import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { AppConfigSchema, type AppConfig } from './schema.js';

export function loadConfig(): AppConfig {
  const configPath = process.env.CONFIG_PATH ?? './config/config.yaml';
  const fallbackPath = './config/config.example.yaml';
  const resolved = path.resolve(process.cwd(), fs.existsSync(configPath) ? configPath : fallbackPath);
  const raw = fs.readFileSync(resolved, 'utf8');
  return AppConfigSchema.parse(YAML.parse(raw));
}
