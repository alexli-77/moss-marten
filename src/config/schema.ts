import { z } from 'zod';

export const AppConfigSchema = z.object({
  assistant: z.object({
    name: z.string().default('moss-marten'),
    language: z.string().default('en'),
    tone: z.string().default('direct, calm, practical'),
  }),
  user: z.object({
    display_name: z.string().default('User'),
    timezone: z.string().default('UTC'),
  }),
  llm: z.object({
    provider: z.literal('openai').default('openai'),
    model: z.string().default('gpt-4.1-mini'),
  }),
  channels: z.record(
    z.object({
      type: z.literal('discord'),
      channel_id_env: z.string(),
    }),
  ),
  workflows: z.object({
    daily_review: z.object({
      enabled: z.boolean().default(true),
      time: z.string(),
      channel: z.string(),
    }),
    daily_plan: z.object({
      enabled: z.boolean().default(true),
      time: z.string(),
      channel: z.string(),
    }),
  }),
  sources: z.object({
    discord_history: z.object({
      enabled: z.boolean().default(true),
      limit: z.number().int().positive().default(50),
    }),
    github: z.object({ enabled: z.boolean().default(false) }),
    calendar_snapshot: z.object({
      enabled: z.boolean().default(false),
      path: z.string().default('./data/snapshots/calendar/today-agenda.json'),
    }),
    tasks_snapshot: z.object({
      enabled: z.boolean().default(false),
      path: z.string().default('./data/snapshots/tasks/my-tasks.json'),
    }),
    vault_gate: z.object({ enabled: z.boolean().default(false) }),
  }),
  memory: z.object({
    long_term_path: z.string().default('./data/memory/long-term.md'),
    daily_dir: z.string().default('./data/memory/daily'),
  }),
});

export type AppConfig = z.infer<typeof AppConfigSchema>;
