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

const ChatConversationHistory = `{{~#if title}}{{~#if chat_history.length}}{{title}}\n{{~/if}}{{~/if}}
{{#each chat_history as | item |}}
{{~#eq item.role 'user'}}{{#if @last}}{{../mostRecentRolePrefix}}{{../userName}}{{../mostRecentRoleSuffix}}{{else}}{{../userName}}{{/if}}: {{#if @last}}{{../mostRecentMessagePrefix}}{{/if}}{{{item.content}}}{{#if @last}}{{../mostRecentMessageSuffix}}{{/if}}\n{{/eq}}
{{~#eq item.role 'assistant'}}{{#if @last}}{{../mostRecentRolePrefix}}{{../assistantName}}{{../mostRecentRoleSuffix}}{{else}}{{../assistantName}}{{/if}}: {{#if @last}}{{../mostRecentMessagePrefix}}{{/if}}{{{item.content}}}{{#if @last}}{{../mostRecentMessageSuffix}}{{/if}}\n{{/eq}}
{{~#eq item.role 'system'}}{{../systemName}}: {{{item.content}}}\n{{/eq}}
{{~/each}}`;

const DialogueHistory = `{{>ChatConversationHistory title=title chat_history=(getKeyOr key []) assistantName=(getOr assistant 'Assistant') userName=(getOr user 'User') systemName=(getOr system 'System') mostRecentRolePrefix=mostRecentRolePrefix mostRecentRoleSuffix=mostRecentRoleSuffix mostRecentMessagePrefix=mostRecentMessagePrefix mostRecentMessageSuffix=mostRecentMessageSuffix}}`;

const SingleChatMessage = `{{~#eq role 'user'}}{{getOr name 'User'}}: {{{content}}}{{~/eq}}
{{~#eq role 'assistant'}}{{getOr assistant 'Assistant'}}: {{{content}}}{{~/eq}}
{{~#eq role 'system'}}{{getOr system 'System'}}: {{{content}}}{{~/eq}}`;

const ThoughtsAndObservations = `{{~#each thoughts as | step |}}
{{~#if step.thought}}Thought: {{{step.thought}}}\n{{/if}}
{{~#if step.observation}}Observation: {{{step.observation}}}\n{{/if}}
{{~/each}}`;

const JsonSchema = `{{#if (getKeyOr key false)}}
\`\`\`json\n{{{indentJson (getKeyOr key) collapse}}}\n\`\`\`
{{~/if}}`;

const JsonSchemaExampleJson = `{{#if (getOr key false)}}
\`\`\`json\n{{{jsonSchemaExample key (getOr property '') collapse}}}\n\`\`\`
{{~/if}}`;

export const partials = {
  JsonSchema,
  JsonSchemaExampleJson,
  MarkdownCode,
  DialogueHistory,
  SingleChatMessage,
  ChatConversationHistory,
  ThoughtsAndObservations,
  ThoughtActionResult,
};
