import cron from 'node-cron';
import type Database from 'better-sqlite3';
import type { DiscordChannel } from '../channels/discord.js';
import type { AppConfig } from '../config/schema.js';
import { runWorkflow } from '../workflows/run-workflow.js';

function toCronExpression(time: string): string {
  const [hour, minute] = time.split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    throw new Error(`Invalid workflow time: ${time}`);
  }
  return `${minute} ${hour} * * *`;
}

export function scheduleWorkflows(config: AppConfig, discord: DiscordChannel, db: Database.Database): void {
  const entries: Array<['daily_review' | 'daily_plan', { enabled: boolean; time: string }]> = [
    ['daily_review', config.workflows.daily_review],
    ['daily_plan', config.workflows.daily_plan],
  ];

  for (const [workflow, workflowConfig] of entries) {
    if (!workflowConfig.enabled) continue;
    cron.schedule(
      toCronExpression(workflowConfig.time),
      () => {
        runWorkflow(workflow, config, discord, db).catch((error) => {
          console.error(`[${workflow}] ${error instanceof Error ? error.stack : String(error)}`);
        });
      },
      { timezone: config.user.timezone },
    );
    console.log(`Scheduled ${workflow} at ${workflowConfig.time} (${config.user.timezone})`);
  }
}
