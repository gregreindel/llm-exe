
export const COMPLETION_END_TOKEN = "<--END";
export const PROMPT_END_TOKEN = "-->";

const MarkdownCode = `{{#if code}}\`\`\`{{#if language}}{{language}}{{/if}}
{{{code}}}
\`\`\`{{/if}}`;

const ThoughtActionResult = `
{{#if title}}{{#if attributes.stepsTaken.length}}{{title}}\n{{/if}}{{/if}}
{{#each attributes.stepsTaken as | step |}}
{{#if step.thought}}Thought: {{step.result}}{{/if}}
{{#if step.result}}Action: {{step.action}}{{/if}}
{{#if step.result}}Result: {{step.result}}{{/if}}
{{/each}}`;

const ChatConversationHistory = `
{{~#if title}}{{~#if chat_history.length}}{{title}}\n{{~/if}}{{~/if}}
{{#each chat_history as | item |}}
{{~#eq item.role 'user'}}{{../userName}}: {{{item.content}}}\n{{/eq}}
{{~#eq item.role 'assistant'}}{{../assistantName}}: {{{item.content}}}\n{{/eq}}
{{~#eq item.role 'system'}}{{../systemName}}: {{{item.content}}}\n{{/eq}}
{{~/each}}`;

const DialogueHistory = `{{>ChatConversationHistory title=title chat_history=(__getDialogueHistory key) assistantName=(getOr assistant 'Assistant') userName=(getOr user 'User') systemName=(getOr system 'System')}}`;

const ThoughtsAndObservations = `{{~#each thoughts as | step |}}
{{~#if step.thought}}Thought: {{{step.thought}}}\n{{/if}}
{{~#if step.observation}}Observation: {{{step.observation}}}\n{{/if}}
{{~/each}}`;

export const partials = {
  MarkdownCode,
  DialogueHistory,
  ChatConversationHistory,
  ThoughtsAndObservations,
  ThoughtActionResult,
};
