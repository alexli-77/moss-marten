import type Database from 'better-sqlite3';
import type { Message } from 'discord.js';
import type { DiscordChannel } from '../channels/discord.js';
import type { AppConfig } from '../config/schema.js';
import { runWorkflow } from '../workflows/run-workflow.js';

type Workflow = 'daily_review' | 'daily_plan';

export function registerDiscordCommandTriggers(config: AppConfig, discord: DiscordChannel, db: Database.Database): void {
  const triggerConfig = config.triggers.discord_commands;
  if (!triggerConfig.enabled) return;

  const channel = config.channels[triggerConfig.channel];
  if (!channel) throw new Error(`Unknown trigger channel config: ${triggerConfig.channel}`);

  const channelId = process.env[channel.channel_id_env];
  if (!channelId) throw new Error(`${channel.channel_id_env} is required`);

  const reviewPatterns = compilePatterns(triggerConfig.daily_review_patterns);
  const planPatterns = compilePatterns(triggerConfig.daily_plan_patterns);
  const running = new Set<Workflow>();

  discord.onMessage(async (message: Message) => {
    if (message.author.bot) return;
    if (message.channelId !== channelId) return;

    const workflow = matchWorkflow(message.content, reviewPatterns, planPatterns);
    if (!workflow) return;

    if (running.has(workflow)) {
      await message.reply(`${workflow} is already running.`);
      return;
    }

    running.add(workflow);
    await message.reply(`Running ${workflow} now.`);
    try {
      await runWorkflow(workflow, config, discord, db);
    } catch (error) {
      const text = error instanceof Error ? error.message : String(error);
      await message.reply(`Failed to run ${workflow}: ${text.slice(0, 1500)}`);
    } finally {
      running.delete(workflow);
    }
  });

  console.log(`Discord command triggers enabled for channel "${triggerConfig.channel}".`);
}

function matchWorkflow(content: string, reviewPatterns: RegExp[], planPatterns: RegExp[]): Workflow | null {
  const text = content.trim();
  if (reviewPatterns.some((pattern) => pattern.test(text))) return 'daily_review';
  if (planPatterns.some((pattern) => pattern.test(text))) return 'daily_plan';
  return null;
}

function compilePatterns(patterns: string[]): RegExp[] {
  return patterns.map((pattern) => new RegExp(pattern, 'i'));
}
