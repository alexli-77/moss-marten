import type { DiscordChannel } from '../channels/discord.js';
import type { AppConfig } from '../config/schema.js';
import { readGitHubAssignedIssues } from '../data-sources/github.js';
import { readJsonSnapshot } from '../data-sources/snapshots.js';

export async function collectEvidence(config: AppConfig, discord: DiscordChannel, channelId: string) {
  const evidence: Record<string, unknown> = {};
  const missing: string[] = [];

  if (config.sources.discord_history.enabled) {
    try {
      evidence.discord_history = await discord.history(channelId, config.sources.discord_history.limit);
    } catch (error) {
      missing.push(`discord_history: ${error instanceof Error ? error.message : String(error)}`);
    }
  } else {
    missing.push('discord_history disabled');
  }

  if (config.sources.calendar_snapshot.enabled) {
    const result = readJsonSnapshot(config.sources.calendar_snapshot.path);
    if (result.available) evidence.calendar_snapshot = result.content;
    else missing.push(`calendar_snapshot: ${result.reason}`);
  } else {
    missing.push('calendar_snapshot disabled');
  }

  if (config.sources.tasks_snapshot.enabled) {
    const result = readJsonSnapshot(config.sources.tasks_snapshot.path);
    if (result.available) evidence.tasks_snapshot = result.content;
    else missing.push(`tasks_snapshot: ${result.reason}`);
  } else {
    missing.push('tasks_snapshot disabled');
  }

  if (config.sources.github.enabled) {
    const result = await readGitHubAssignedIssues();
    if (result.available) evidence.github = result.content;
    else missing.push(`github: ${result.reason}`);
  } else {
    missing.push('github disabled');
  }

  evidence.missing_sources = missing;
  return evidence;
}
