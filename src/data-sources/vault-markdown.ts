import fs from 'node:fs';
import path from 'node:path';

export function readVaultMarkdown(input: {
  root: string;
  maxFiles: number;
  maxBytesPerFile: number;
}): { available: true; root: string; files: Array<{ path: string; content: string }> } | { available: false; reason: string; root: string } {
  const root = path.resolve(expandHome(input.root));
  if (!fs.existsSync(root)) return { available: false, reason: `Missing vault directory: ${root}`, root };
  if (!fs.statSync(root).isDirectory()) return { available: false, reason: `Vault path is not a directory: ${root}`, root };

  const files = walkMarkdown(root)
    .sort()
    .slice(0, input.maxFiles)
    .map((filePath) => ({
      path: path.relative(root, filePath),
      content: fs.readFileSync(filePath, 'utf8').slice(0, input.maxBytesPerFile),
    }));

  if (files.length === 0) return { available: false, reason: `No markdown files found under ${root}`, root };
  return { available: true, root, files };
}

function walkMarkdown(root: string): string[] {
  const result: string[] = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (shouldSkip(entry.name)) continue;
    const fullPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      result.push(...walkMarkdown(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      result.push(fullPath);
    }
  }
  return result;
}

function shouldSkip(name: string): boolean {
  return name.startsWith('.') || name === '_snapshots' || name === 'node_modules';
}

function expandHome(filePath: string): string {
  if (filePath === '~') return process.env.HOME ?? filePath;
  if (filePath.startsWith('~/')) return `${process.env.HOME ?? '~'}${filePath.slice(1)}`;
  return filePath;
}
