# llm-exe

[![tests](https://github.com/gregreindel/llm-exe/actions/workflows/tests.yml/badge.svg)](https://github.com/gregreindel/llm-exe/actions/workflows/tests.yml) [![Coverage Status](https://coveralls.io/repos/github/gregreindel/llm-exe/badge.svg?branch=main)](https://coveralls.io/github/gregreindel/llm-exe?branch=main) [![npm version](https://badge.fury.io/js/llm-exe.svg)](https://badge.fury.io/js/llm-exe)

A package that provides simplified base components to make building and maintaining LLM-powered applications easier.

- Write functions powered by LLM's with easy to use building blocks.
- Pure Javascript and Typescript. Allows you to pass and infer types.
- Support for text-based (llama-3) and chat-based prompts. (gpt-4o, claude-3.5, grok-3, Gemini, Bedrock, Ollama, etc)
- Call LLM's from different providers without changing your code. (OpenAi/Anthropic/xAI/Google/AWS Bedrock/Ollama/Deepseek)
- Supercharge your prompts by using handlebars within prompt template.
- Allow LLM's to call functions (or call other LLM executors).
- Not very opinionated. You have control on how you use it.

![llm-exe](https://assets.llm-exe.com/llm-exe-featured.jpg)

See full docs here: [https://llm-exe.com](https://llm-exe.com)

---

# Install

Install llm-exe using npm.

```
npm i llm-exe
```

ESM-first. CommonJS works too.

```typescript
// ESM
import * as llmExe from "llm-exe";
// or specific modules
import { useLlm, createChatPrompt, createParser } from "llm-exe";

// CommonJS
const llmExe = require("llm-exe");
```

## Basic Usage

```ts
// Prompt
const prompt = createChatPrompt("You are a support agent. Help the user.");
prompt.addUserMessage("I need help with my order.");

// LLM
const llm = useLlm("openai.gpt-4o");

// Parser
const parser = createParser("json", { schema: mySchema });

// Executor
const executor = createLlmExecutor({ llm, prompt, parser });
await executor.execute({ input: "..." });
```

#### Prompt Helpers

```ts
const prompt = createChatPrompt(`
{{#if user.isFirstTime}}
Welcome!
{{else}}
Welcome back!
{{/if}}
`);
```

#### Built-In Parsers

```ts
createParser("stringExtract", { enum: ["yes", "no"] });
createParser("listToJson");
createParser("markdownCodeBlock");
```

#### Custom Parsers

```ts
const parser = createCustomParser("MyUppercaseParser", (output, input) => {
  return { result: output.toUpperCase() };
});
```

#### State

```ts
const dialogue = createDialogue("chat");
dialogue.setUserMessage("Hi");
dialogue.setAssistantMessage("Hello!");
dialogue.getHistory(); // returns chat array
```

#### Hooks

```ts
executor.on("onComplete", console.log);
executor.on("onError", console.error);
```

## Basic Example

Below is simple example:

```typescript
import {
  useLlm,
  createChatPrompt,
  createParser,
  createLlmExecutor,
} from "llm-exe";

// 1. Use the model you want
const llm = useLlm("openai.gpt-4o");

// 2. Create a parameterized prompt using Handlebars
const instruction = `
You are a classifier. Given a user message, reply with the category it belongs to.
Pick from only the following options:

{{#each options}}- {{this}}
{{/each}}

Respond with only one of the options.`;

const prompt = createChatPrompt(instruction).addUserMessage("{{input}}"); // placeholder for message content

// 3. Create a parser that ensures a clean match
const parser = createParser("stringExtract", {
  enum: ["billing", "support", "cancel", "unknown"],
});

// 4. Create the executor
const classifyMessage = createLlmExecutor({
  llm,
  prompt,
  parser,
});

// 5. Pass in options and a message — like a real function!
// classifyMessage.execute is typed based on the prompt/parser
// This means you get type safety and autocompletion in your IDE
const result = await classifyMessage.execute({
  input: "Hi, I'm moving and no longer need this service.",
  options: ["billing", "support", "cancel", "unknown"],
});

console.log(result); // => "cancel"
```
