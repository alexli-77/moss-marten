import fs from 'node:fs';
import path from 'node:path';

export interface MemoryStore {
  longTerm: string;
  today: string;
}

export function readMemory(longTermPath: string, dailyDir: string, date: string): MemoryStore {
  fs.mkdirSync(path.dirname(longTermPath), { recursive: true });
  fs.mkdirSync(dailyDir, { recursive: true });

  if (!fs.existsSync(longTermPath)) fs.writeFileSync(longTermPath, '# Long-term memory\n\n', 'utf8');
  const todayPath = path.join(dailyDir, `${date}.md`);
  if (!fs.existsSync(todayPath)) fs.writeFileSync(todayPath, `# ${date}\n\n`, 'utf8');

  return {
    longTerm: fs.readFileSync(longTermPath, 'utf8'),
    today: fs.readFileSync(todayPath, 'utf8'),
  };
}

export function appendDailyMemory(dailyDir: string, date: string, title: string, body: string): void {
  fs.mkdirSync(dailyDir, { recursive: true });
  const now = new Date().toISOString();
  const file = path.join(dailyDir, `${date}.md`);
  fs.appendFileSync(file, `\n## ${now} ${title}\n\n${body.trim()}\n`, 'utf8');
}
