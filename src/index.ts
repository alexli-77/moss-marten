import 'dotenv/config';
import { DiscordChannel } from './channels/discord.js';
import { loadConfig } from './config/load-config.js';
import { scheduleWorkflows } from './scheduler/scheduler.js';
import { openDatabase } from './storage/database.js';

async function main() {
  const config = loadConfig();
  const db = openDatabase();
  const discord = new DiscordChannel();

  await discord.start();
  scheduleWorkflows(config, discord, db);
  console.log(`${config.assistant.name} is running.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exit(1);
});
