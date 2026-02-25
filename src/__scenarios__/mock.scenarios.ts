/**
 * Mock Scenarios for llm-exe
 *
 * Reusable mock data representing real-world LLM response patterns.
 * Used to test the full pipeline: Prompt → LLM → Parser → Result
 */
import { OutputResultContent, OutputResult } from "@/interfaces";

// ─── Helpers ──────────────────────────────────────────────────────────

export function mockOutputResult(
  content: OutputResultContent[],
  overrides?: Partial<OutputResult>
): OutputResult {
  return {
    id: overrides?.id ?? "mock-id-001",
    created: overrides?.created ?? 1700000000,
    stopReason: overrides?.stopReason ?? "STOP",
    content,
    usage: overrides?.usage ?? {
      input_tokens: 10,
      output_tokens: 20,
      total_tokens: 30,
    },
    ...(overrides?.options && { options: overrides.options }),
  };
}

// ─── Text Responses ───────────────────────────────────────────────────

/** Simple text answer */
export const SIMPLE_TEXT = mockOutputResult([
  { type: "text", text: "The capital of France is Paris." },
]);

/** Multi-paragraph text */
export const LONG_TEXT = mockOutputResult([
  {
    type: "text",
    text: "Here are three key points:\n\n1. First point about architecture.\n2. Second point about testing.\n3. Third point about deployment.",
  },
]);

/** JSON string embedded in text */
export const TEXT_WITH_JSON = mockOutputResult([
  {
    type: "text",
    text: '{"name": "Alice", "age": 30, "role": "engineer"}',
  },
]);

/** JSON array embedded in text */
export const TEXT_WITH_JSON_ARRAY = mockOutputResult([
  {
    type: "text",
    text: '[{"id": 1, "task": "Buy groceries"}, {"id": 2, "task": "Walk the dog"}]',
  },
]);

/** Markdown code block in text */
export const TEXT_WITH_CODE_BLOCK = mockOutputResult([
  {
    type: "text",
    text: 'Here is the function:\n\n```typescript\nfunction add(a: number, b: number): number {\n  return a + b;\n}\n```\n\nThis adds two numbers.',
  },
]);

/** Boolean-like text responses */
export const TEXT_BOOLEAN_TRUE = mockOutputResult([
  { type: "text", text: "true" },
]);

export const TEXT_BOOLEAN_FALSE = mockOutputResult([
  { type: "text", text: "false" },
]);

/** Numeric text response */
export const TEXT_NUMBER = mockOutputResult([
  { type: "text", text: "42" },
]);

/** List-style text response */
export const TEXT_LIST = mockOutputResult([
  {
    type: "text",
    text: "- item one\n- item two\n- item three",
  },
]);

/** Empty/minimal text */
export const TEXT_EMPTY = mockOutputResult([
  { type: "text", text: "" },
]);

export const TEXT_WHITESPACE = mockOutputResult([
  { type: "text", text: "   \n\n  " },
]);

// ─── Function Call Responses ──────────────────────────────────────────

/** Single function call */
export const SINGLE_FUNCTION_CALL = mockOutputResult(
  [
    {
      type: "function_use",
      name: "get_weather",
      input: { location: "San Francisco", units: "celsius" },
      functionId: "call_001",
    },
  ],
  { stopReason: "tool_use" }
);

/** Multiple function calls (parallel tool use) */
export const PARALLEL_FUNCTION_CALLS = mockOutputResult(
  [
    {
      type: "function_use",
      name: "get_weather",
      input: { location: "San Francisco" },
      functionId: "call_001",
    },
    {
      type: "function_use",
      name: "get_weather",
      input: { location: "New York" },
      functionId: "call_002",
    },
  ],
  { stopReason: "tool_use" }
);

/** Function call with complex nested input */
export const FUNCTION_CALL_COMPLEX_INPUT = mockOutputResult(
  [
    {
      type: "function_use",
      name: "create_record",
      input: {
        name: "Test Record",
        metadata: {
          tags: ["urgent", "review"],
          priority: 1,
          nested: { deep: { value: true } },
        },
      },
      functionId: "call_003",
    },
  ],
  { stopReason: "tool_use" }
);

// ─── Mixed Responses (Text + Function Calls) ─────────────────────────

/** Text followed by function call (common agentic pattern) */
export const TEXT_THEN_FUNCTION = mockOutputResult(
  [
    { type: "text", text: "I'll look up the weather for you." },
    {
      type: "function_use",
      name: "get_weather",
      input: { location: "San Francisco" },
      functionId: "call_010",
    },
  ],
  { stopReason: "tool_use" }
);

/** Text, function call, then more text */
export const TEXT_FUNCTION_TEXT = mockOutputResult([
  { type: "text", text: "Let me search for that." },
  {
    type: "function_use",
    name: "search",
    input: { query: "TypeScript best practices" },
    functionId: "call_011",
  },
  { type: "text", text: "Here are the results I found." },
]);

/** Multiple interleaved text and function calls */
export const INTERLEAVED_MIXED = mockOutputResult(
  [
    { type: "text", text: "I'll help with both tasks." },
    {
      type: "function_use",
      name: "task_a",
      input: { action: "read" },
      functionId: "call_020",
    },
    { type: "text", text: "Now for the second part." },
    {
      type: "function_use",
      name: "task_b",
      input: { action: "write" },
      functionId: "call_021",
    },
    { type: "text", text: "Both tasks are complete." },
  ],
  { stopReason: "tool_use" }
);

// ─── Edge Cases ───────────────────────────────────────────────────────

/** Response with stop reason variations */
export const STOP_MAX_TOKENS = mockOutputResult(
  [{ type: "text", text: "This response was cut off because" }],
  { stopReason: "max_tokens" }
);

export const STOP_CONTENT_FILTER = mockOutputResult(
  [{ type: "text", text: "" }],
  { stopReason: "content_filter" }
);

/** High token usage */
export const HIGH_TOKEN_USAGE = mockOutputResult(
  [{ type: "text", text: "A very thorough response." }],
  {
    usage: {
      input_tokens: 100000,
      output_tokens: 4096,
      total_tokens: 104096,
    },
  }
);

/** Response with options (n>1 completions) */
export const RESPONSE_WITH_OPTIONS = mockOutputResult(
  [{ type: "text", text: "Option A response" }],
  {
    options: [
      [{ type: "text", text: "Option B response" }],
      [{ type: "text", text: "Option C response" }],
    ],
  }
);

// ─── Conversation Histories ───────────────────────────────────────────

import { IChatMessages } from "@/interfaces";

/** Simple Q&A conversation */
export const CONVERSATION_SIMPLE: IChatMessages = [
  { role: "system", content: "You are a helpful assistant." },
  { role: "user", content: "What is TypeScript?" },
  {
    role: "assistant",
    content: "TypeScript is a typed superset of JavaScript.",
  },
];

/** Multi-turn with function calls */
export const CONVERSATION_WITH_TOOLS: IChatMessages = [
  { role: "system", content: "You are a weather assistant." },
  { role: "user", content: "What's the weather in SF?" },
  {
    role: "function_call",
    content: null,
    function_call: {
      name: "get_weather",
      arguments: '{"location":"San Francisco"}',
      id: "call_100",
    },
  },
  {
    role: "function",
    content: '{"temp": 65, "condition": "foggy"}',
    name: "get_weather",
  },
  {
    role: "assistant",
    content: "It's 65°F and foggy in San Francisco.",
  },
];

/** Multi-turn deep conversation */
export const CONVERSATION_MULTI_TURN: IChatMessages = [
  { role: "system", content: "You are a coding tutor." },
  { role: "user", content: "How do I write a for loop in Python?" },
  {
    role: "assistant",
    content: "Use `for item in iterable:` syntax.",
  },
  { role: "user", content: "What about a while loop?" },
  {
    role: "assistant",
    content: "Use `while condition:` syntax.",
  },
  { role: "user", content: "Can you show me both together?" },
];

/** Conversation with parallel tool calls */
export const CONVERSATION_PARALLEL_TOOLS: IChatMessages = [
  { role: "system", content: "You can use multiple tools at once." },
  { role: "user", content: "Compare weather in SF and NYC." },
  {
    role: "function_call",
    content: null,
    function_call: {
      name: "get_weather",
      arguments: '{"location":"San Francisco"}',
      id: "call_200",
    },
  },
  {
    role: "function_call",
    content: null,
    function_call: {
      name: "get_weather",
      arguments: '{"location":"New York"}',
      id: "call_201",
    },
  },
  {
    role: "function",
    content: '{"temp": 65, "condition": "foggy"}',
    name: "get_weather",
  },
  {
    role: "function",
    content: '{"temp": 45, "condition": "clear"}',
    name: "get_weather",
  },
  {
    role: "assistant",
    content: "SF is 65°F and foggy. NYC is 45°F and clear.",
  },
];

// ─── Prompt Template Inputs ───────────────────────────────────────────

/** Common template variable sets for testing prompt rendering */
export const TEMPLATE_INPUTS = {
  simple: { name: "Alice" },
  withContext: {
    name: "Bob",
    context: "The user is asking about project deadlines.",
  },
  withHistory: {
    name: "Charlie",
    history: [
      { role: "user" as const, content: "Hi" },
      { role: "assistant" as const, content: "Hello!" },
    ],
  },
  withArray: {
    items: ["apple", "banana", "cherry"],
  },
  withNested: {
    user: {
      name: "Diana",
      preferences: {
        language: "en",
        tone: "formal",
      },
    },
  },
  empty: {},
  withSpecialChars: {
    input: 'User said: "Hello <world> & \'friends\'"',
  },
} as const;

// ─── Parser Test Inputs ───────────────────────────────────────────────

/** Raw LLM text outputs for parser testing */
export const PARSER_INPUTS = {
  validJson: '{"key": "value", "count": 42}',
  invalidJson: '{"key": "value", count: 42}',  // missing quotes
  jsonInMarkdown: '```json\n{"key": "value"}\n```',
  numberedList: "1. First item\n2. Second item\n3. Third item",
  bulletList: "- First item\n- Second item\n- Third item",
  keyValueList: "name: Alice\nage: 30\nrole: engineer",
  booleanTrue: "true",
  booleanYes: "yes",
  booleanFalse: "false",
  number: "42",
  float: "3.14",
  multipleCodeBlocks:
    '```python\nprint("hello")\n```\n\nSome text\n\n```javascript\nconsole.log("hello")\n```',
  emptyString: "",
  whitespaceOnly: "   \n\t  ",
};
