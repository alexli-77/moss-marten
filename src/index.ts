import 'dotenv/config';
import { DiscordChannel } from './channels/discord.js';
import { loadConfig } from './config/load-config.js';
import { scheduleWorkflows } from './scheduler/scheduler.js';
import { openDatabase } from './storage/database.js';
import { runWorkflow } from './workflows/run-workflow.js';

async function main() {
  const config = loadConfig();
  const db = openDatabase();
  const discord = new DiscordChannel();

  await discord.start();
  const runOnce = process.argv.find((arg) => arg.startsWith('--run-once='))?.split('=')[1];
  if (runOnce === 'daily_review' || runOnce === 'daily_plan') {
    await runWorkflow(runOnce, config, discord, db);
    await discord.stop();
    console.log(`Ran ${runOnce} once.`);
    return;
  }

  if (process.argv.includes('--smoke-test')) {
    const channel = config.channels.review;
    const channelId = process.env[channel.channel_id_env];
    if (!channelId) throw new Error(`${channel.channel_id_env} is required`);
    await discord.send(channelId, `Moss Marten smoke test passed at ${new Date().toISOString()}.`);
    await discord.stop();
    console.log('Smoke test message sent.');
    return;
  }

  scheduleWorkflows(config, discord, db);
  console.log(`${config.assistant.name} is running.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
