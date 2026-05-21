import fs from 'node:fs';

export function readJsonSnapshot(path: string): { available: true; content: unknown } | { available: false; reason: string } {
  if (!fs.existsSync(path)) return { available: false, reason: `Missing file: ${path}` };
  try {
    return { available: true, content: JSON.parse(fs.readFileSync(path, 'utf8')) };
  } catch (error) {
    return { available: false, reason: error instanceof Error ? error.message : String(error) };
  }
}
