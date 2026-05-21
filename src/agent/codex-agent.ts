import { spawn } from 'node:child_process';
import fs from 'node:fs';
import type { AppConfig } from '../config/schema.js';
import type { AgentInput } from './openai-agent.js';

export class CodexAgent {
  constructor(private config: AppConfig) {}

  async run(input: AgentInput): Promise<string> {
    const system = fs.readFileSync('./prompts/system.md', 'utf8');
    const workflowPrompt = fs
      .readFileSync(input.workflow === 'daily_review' ? './prompts/review.md' : './prompts/plan.md', 'utf8')
      .replaceAll('{date}', input.date);

    const prompt = [
      system,
      `Assistant name: ${this.config.assistant.name}`,
      `Language: ${this.config.assistant.language}`,
      `Tone: ${this.config.assistant.tone}`,
      `User display name: ${this.config.user.display_name}`,
      '',
      '# Workflow Task',
      workflowPrompt,
      '',
      '# Evidence And Memory',
      JSON.stringify({ evidence: input.evidence, memory: input.memory }, null, 2),
      '',
      'Return only the message that should be posted to the configured channel.',
      'For Missing Sources, use only evidence.missing_sources and evidence.source_status from this run. Ignore missing-source claims found inside Discord history.',
    ].join('\n');

    return runCodex(prompt, this.config.llm.model);
  }
}

async function runCodex(prompt: string, model: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      'codex',
      [
        '-m',
        model,
        'exec',
        '--skip-git-repo-check',
        '--dangerously-bypass-approvals-and-sandbox',
        '--json',
        '-',
      ],
      {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );

    let stdout = '';
    let stderr = '';
    let lastMessage = '';

    child.stdin.end(prompt);
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
      for (const line of stdout.split('\n')) {
        if (!line.trim()) continue;
        try {
          const event = JSON.parse(line) as { type?: string; item?: { type?: string; text?: string } };
          if (event.type === 'item.completed' && event.item?.type === 'agent_message' && event.item.text) {
            lastMessage = event.item.text;
          }
        } catch {
          // Incomplete JSONL lines are handled after more data arrives.
        }
      }
      const lastNewline = stdout.lastIndexOf('\n');
      if (lastNewline >= 0) stdout = stdout.slice(lastNewline + 1);
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`codex exited with code ${code}: ${stderr.slice(0, 1000)}`));
        return;
      }
      resolve(lastMessage.trim() || 'No response generated.');
    });
  });
}
