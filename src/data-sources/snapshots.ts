import fs from 'node:fs';
import path from 'node:path';

export function readJsonSnapshot(path: string): { available: true; content: unknown } | { available: false; reason: string } {
  if (!fs.existsSync(path)) return { available: false, reason: `Missing file: ${path}` };
  try {
    return { available: true, content: JSON.parse(fs.readFileSync(path, 'utf8')) };
  } catch (error) {
    return { available: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

export function readTextSnapshot(path: string): { available: true; content: string } | { available: false; reason: string } {
  if (!fs.existsSync(path)) return { available: false, reason: `Missing file: ${path}` };
  try {
    return { available: true, content: fs.readFileSync(path, 'utf8') };
  } catch (error) {
    return { available: false, reason: error instanceof Error ? error.message : String(error) };
  }
}

export function readVaultSnapshotsForPreviousDay(input: {
  root: string;
  currentDate: string;
  maxFiles: number;
}): { available: true; date: string; root: string; files: Array<{ path: string; type: 'json' | 'text'; content: unknown }> } | { available: false; reason: string; date: string; root: string } {
  return readVaultSnapshotsForDate({
    root: input.root,
    date: previousDate(input.currentDate),
    maxFiles: input.maxFiles,
  });
}

export function readVaultSnapshotsForDate(input: {
  root: string;
  date: string;
  maxFiles: number;
}): { available: true; date: string; root: string; files: Array<{ path: string; type: 'json' | 'text'; content: unknown }> } | { available: false; reason: string; date: string; root: string } {
  const date = input.date;
  const root = path.resolve(expandHome(input.root));
  const snapshotsDir = resolveSnapshotsDir(root);
  if (!fs.existsSync(snapshotsDir)) {
    return { available: false, reason: `Missing snapshots directory: ${snapshotsDir}`, date, root };
  }
  if (!fs.statSync(snapshotsDir).isDirectory()) {
    return { available: false, reason: `Snapshots path is not a directory: ${snapshotsDir}`, date, root };
  }

  const compact = date.replaceAll('-', '');
  const candidates = walkFiles(snapshotsDir)
    .filter((filePath) => {
      const normalized = filePath.split(path.sep).join('/');
      return normalized.includes(`/${date}/`) || normalized.includes(date) || normalized.includes(compact);
    })
    .sort()
    .slice(0, input.maxFiles);

  if (candidates.length === 0) {
    return { available: false, reason: `No snapshot files found for ${date} under ${snapshotsDir}`, date, root };
  }

  const files = candidates.map((filePath) => {
    const relative = path.relative(root, filePath);
    const raw = fs.readFileSync(filePath, 'utf8');
    if (filePath.endsWith('.json')) {
      return { path: relative, type: 'json' as const, content: JSON.parse(raw) };
    }
    return { path: relative, type: 'text' as const, content: raw };
  });
  return { available: true, date, root, files };
}

function previousDate(currentDate: string): string {
  const match = currentDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error(`Invalid currentDate: ${currentDate}`);
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function walkFiles(root: string): string[] {
  const result: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith('.')) continue;
      result.push(...walkFiles(fullPath));
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }
  return result;
}

function resolveSnapshotsDir(root: string): string {
  const base = path.basename(root);
  if (base === '_snapshots' || base === 'snapshots') return root;

  const candidates = [
    path.join(root, '_snapshots'),
    path.join(root, 'snapshots'),
    path.join(root, 'Private-Vault', '_snapshots'),
    path.join(root, 'Private-Vault', 'snapshots')
  ];

  return candidates.find((candidate) => fs.existsSync(candidate)) ?? candidates[0];
}

function expandHome(filePath: string): string {
  if (filePath === '~') return process.env.HOME ?? filePath;
  if (filePath.startsWith('~/')) return `${process.env.HOME ?? '~'}${filePath.slice(1)}`;
  return filePath;
}
