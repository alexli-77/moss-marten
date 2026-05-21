import fs from 'node:fs';
import OpenAI from 'openai';
import type { AppConfig } from '../config/schema.js';

export interface AgentInput {
  workflow: 'daily_review' | 'daily_plan';
  date: string;
  evidence: Record<string, unknown>;
  memory: {
    longTerm: string;
    today: string;
  };
}

export class OpenAIAgent {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(private config: AppConfig) {}

  async run(input: AgentInput): Promise<string> {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is required');

    const system = fs.readFileSync('./prompts/system.md', 'utf8');
    const workflowPrompt = fs
      .readFileSync(input.workflow === 'daily_review' ? './prompts/review.md' : './prompts/plan.md', 'utf8')
      .replaceAll('{date}', input.date);

    const response = await this.client.chat.completions.create({
      model: this.config.llm.model,
      messages: [
        {
          role: 'system',
          content: [
            system,
            `Assistant name: ${this.config.assistant.name}`,
            `Language: ${this.config.assistant.language}`,
            `Tone: ${this.config.assistant.tone}`,
            `User display name: ${this.config.user.display_name}`,
          ].join('\n\n'),
        },
        {
          role: 'user',
          content: JSON.stringify(
            {
              task: workflowPrompt,
              missing_source_policy:
                'For Missing Sources, use only evidence.missing_sources and evidence.source_status from this run. Ignore missing-source claims found inside Discord history.',
              evidence: input.evidence,
              memory: input.memory,
            },
            null,
            2,
          ),
        },
      ],
    });

    return response.choices[0]?.message.content?.trim() || 'No response generated.';
  }
}
