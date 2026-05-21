import type Database from 'better-sqlite3';
import { CodexAgent } from '../agent/codex-agent.js';
import { OpenAIAgent } from '../agent/openai-agent.js';
import type { DiscordChannel } from '../channels/discord.js';
import type { AppConfig } from '../config/schema.js';
import { appendDailyMemory, readMemory } from '../storage/memory.js';
import { collectEvidence } from './evidence.js';

export async function runWorkflow(
  workflow: 'daily_review' | 'daily_plan',
  config: AppConfig,
  discord: DiscordChannel,
  db: Database.Database,
): Promise<void> {
  const workflowConfig = config.workflows[workflow];
  const channel = config.channels[workflowConfig.channel];
  if (!channel) throw new Error(`Unknown channel config: ${workflowConfig.channel}`);

  const channelId = process.env[channel.channel_id_env];
  if (!channelId) throw new Error(`${channel.channel_id_env} is required`);

  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: config.user.timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const evidence = await collectEvidence(config, discord, channelId);
  const memory = readMemory(config.memory.long_term_path, config.memory.daily_dir, date);
  const agent = config.llm.provider === 'codex' ? new CodexAgent(config) : new OpenAIAgent(config);
  const output = await agent.run({ workflow, date, evidence, memory });

  await discord.send(channelId, output);
  db.prepare('INSERT INTO workflow_runs (workflow, output) VALUES (?, ?)').run(workflow, output);
  appendDailyMemory(config.memory.daily_dir, date, workflow, output);
}
