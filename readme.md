# llm-exe

[![node.js](https://github.com/gregreindel/llm-exe/actions/workflows/node.js.yml/badge.svg)](https://github.com/gregreindel/llm-exe/actions/workflows/node.js.yml) [![Coverage Status](https://coveralls.io/repos/github/gregreindel/llm-exe/badge.svg?branch=main)](https://coveralls.io/github/gregreindel/llm-exe?branch=main) [![npm version](https://badge.fury.io/js/llm-exe.svg)](https://badge.fury.io/js/llm-exe)

A package that provides simplified base components to make building and maintaining LLM-powered applications easier.

- Write functions powered by LLM's with easy to use building blocks.
- Pure Javascript and Typescript. Allows you to pass and infer types.
- Support for text-based (llama-3) and chat-based prompts (gpt-4o, claude-3.5).
- Supercharge your prompts by using handlebars within prompt template.
- Allow LLM's to call functions (or call other LLM executors).
- Not very opinionated. You have control on how you use it.

![llm-exe](https://assets.llm-exe.com/llm-exe-featured.jpg)


See full docs [here](https://llm-exe.com)


---
# Install

Install llm-exe using npm.
```
npm i llm-exe
```

```typescript
import * as llmExe from "llm-exe"

// or 

import { /* specific modules */ } from from "llm-exe"
```

## Basic Example
Below is simple example:
```javascript
import {
  useLlm,
  createChatPrompt,
  createParser
} from "llm-exe";

const instruction = `<some prompt>

Your response must be formatted like:
<subtask>
<subtask>
<subtask>`;

const llm = useLlm("openai.chat.v1",{ /* options */ });
const prompt = createChatPrompt(instruction).addUserMessage()
const parser = createParser("listToArray");

const executor = createLlmExecutor({
  llm,
  prompt,
  parser
})

const input = "Hello! When was my last appointment?";
const response = await executor.execute({ input })
/**
 * 
 * The prompt sent to the LLM would be: 
 * (line breaks added for readability)
 * 
 * [{ 
 *   role: 'system', 
 *    content: '<some prompt>\n 
 *              Your response must be formatted like:\n<subtask>\n<subtask>\n 
 *              <subtask>' 
 * },
 * { 
 *   role: 'user',
 *   content: 'Hello! When was my last appointment?'
 * }]
 * 
 */

/**
 * 
 * console.log(response)
 * [
 *  "a subtask the llm generated",
 *  "a subtask the llm generated",
 *  "a subtask the llm generated",
 * ]
 * /
```