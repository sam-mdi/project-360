import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';

export async function callClaude(
  apiKey: string,
  system: string,
  userContent: string,
  maxTokens = 1024
): Promise<string> {
  if (!apiKey) throw new Error('No API key. Add it in Settings → AI Settings.');
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: userContent }],
  });
  const block = msg.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}

export async function callClaudeJSON<T>(
  apiKey: string,
  system: string,
  userContent: string,
  maxTokens = 2048
): Promise<T> {
  const raw = await callClaude(apiKey, system, userContent, maxTokens);
  const match = raw.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
  if (!match) throw new Error('No JSON found in response');
  return JSON.parse(match[0]) as T;
}
