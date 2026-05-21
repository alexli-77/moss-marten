import type { DiscordChannel } from '../channels/discord.js';
import type { AppConfig } from '../config/schema.js';
import { readGitHubAssignedIssues } from '../data-sources/github.js';
import { readJsonSnapshot, readTextSnapshot } from '../data-sources/snapshots.js';
import { readVaultGate } from '../data-sources/vault-gate.js';

type SourceState = 'available' | 'empty' | 'disabled' | 'missing' | 'error';

interface SourceStatus {
  state: SourceState;
  detail?: string;
}

export async function collectEvidence(config: AppConfig, discord: DiscordChannel, channelId: string, date: string) {
  const evidence: Record<string, unknown> = {};
  const sources: Record<string, SourceStatus> = {};

  function setSource(name: string, state: SourceState, detail?: string) {
    sources[name] = detail ? { state, detail } : { state };
  }

  if (config.sources.discord_history.enabled) {
    try {
      const history = await discord.history(channelId, config.sources.discord_history.limit);
      evidence.discord_history = history;
      setSource('discord_history', history.length > 0 ? 'available' : 'empty');
    } catch (error) {
      setSource('discord_history', 'error', error instanceof Error ? error.message : String(error));
    }
  } else {
    setSource('discord_history', 'disabled');
  }

  if (config.sources.calendar_snapshot.enabled) {
    const result = readJsonSnapshot(config.sources.calendar_snapshot.path);
    if (result.available) {
      evidence.calendar_snapshot = result.content;
      setSource('calendar_snapshot', isEmpty(result.content) ? 'empty' : 'available');
    } else {
      setSource('calendar_snapshot', 'missing', result.reason);
    }
  } else {
    setSource('calendar_snapshot', 'disabled');
  }

  if (config.sources.tasks_snapshot.enabled) {
    const result = readJsonSnapshot(config.sources.tasks_snapshot.path);
    if (result.available) {
      evidence.tasks_snapshot = result.content;
      setSource('tasks_snapshot', isEmpty(result.content) ? 'empty' : 'available');
    } else {
      setSource('tasks_snapshot', 'missing', result.reason);
    }
  } else {
    setSource('tasks_snapshot', 'disabled');
  }

  if (config.sources.apple_calendar_snapshot.enabled) {
    const result = readJsonSnapshot(config.sources.apple_calendar_snapshot.path);
    if (result.available) {
      evidence.apple_calendar_snapshot = result.content;
      setSource('apple_calendar_snapshot', isEmpty(result.content) ? 'empty' : 'available');
    } else {
      setSource('apple_calendar_snapshot', 'missing', result.reason);
    }
  } else {
    setSource('apple_calendar_snapshot', 'disabled');
  }

  if (config.sources.github.enabled) {
    const result = await readGitHubAssignedIssues();
    if (result.available) {
      evidence.github = result.content;
      setSource('github', isEmpty(result.content) ? 'empty' : 'available');
    } else {
      setSource('github', 'error', result.reason);
    }
  } else {
    setSource('github', 'disabled');
  }

  if (config.sources.chrome_snapshot.enabled) {
    const tabs = readTextSnapshot(config.sources.chrome_snapshot.tabs_path);
    const status = readJsonSnapshot(config.sources.chrome_snapshot.status_path);
    if (tabs.available) evidence.chrome_tabs = tabs.content;
    if (status.available) evidence.chrome_status = status.content;
    setSource(
      'chrome_snapshot',
      tabs.available || status.available ? 'available' : 'missing',
      tabs.available || status.available ? undefined : `${tabs.reason}; ${status.reason}`,
    );
  } else {
    setSource('chrome_snapshot', 'disabled');
  }

  if (config.sources.vault_gate.enabled) {
    const dailyPath = config.sources.vault_gate.daily_note_path_template.replaceAll('{date}', date);
    const [dailyNote, watchList] = await Promise.all([
      readVaultGate(dailyPath),
      readVaultGate(config.sources.vault_gate.watch_list_path),
    ]);
    if (dailyNote.available) evidence.vault_daily_note = dailyNote.content;
    if (watchList.available) evidence.vault_watch_list = watchList.content;
    setSource(
      'vault_gate',
      dailyNote.available || watchList.available ? 'available' : 'error',
      dailyNote.available || watchList.available ? undefined : `${dailyNote.reason}; ${watchList.reason}`,
    );
  } else {
    setSource('vault_gate', 'disabled');
  }

  if (config.sources.codex_history.enabled) {
    const sessionIndex = readTextSnapshot(expandHome(config.sources.codex_history.session_index_path));
    const history = readTextSnapshot(expandHome(config.sources.codex_history.history_path));
    if (sessionIndex.available) evidence.codex_session_index = tailLines(sessionIndex.content, 80);
    if (history.available) evidence.codex_history = tailLines(history.content, 80);
    setSource(
      'codex_history',
      sessionIndex.available || history.available ? 'available' : 'missing',
      sessionIndex.available || history.available ? undefined : `${sessionIndex.reason}; ${history.reason}`,
    );
  } else {
    setSource('codex_history', 'disabled');
  }

  evidence.source_status = sources;
  evidence.missing_sources = Object.entries(sources)
    .filter(([, status]) => status.state === 'missing' || status.state === 'error')
    .map(([name, status]) => `${name}: ${status.detail ?? status.state}`);
  return evidence;
}

function isEmpty(value: unknown): boolean {
  if (value == null) return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'string') return value.trim().length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

function expandHome(path: string): string {
  if (path === '~') return process.env.HOME ?? path;
  if (path.startsWith('~/')) return `${process.env.HOME ?? '~'}${path.slice(1)}`;
  return path;
}

function tailLines(text: string, count: number): string {
  return text.split('\n').slice(-count).join('\n');
}
