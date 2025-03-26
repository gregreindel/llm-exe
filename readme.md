# llm-exe

[![tests](https://github.com/gregreindel/llm-exe/actions/workflows/tests.yml/badge.svg)](https://github.com/gregreindel/llm-exe/actions/workflows/tests.yml) [![Coverage Status](https://coveralls.io/repos/github/gregreindel/llm-exe/badge.svg?branch=main)](https://coveralls.io/github/gregreindel/llm-exe?branch=main) [![npm version](https://badge.fury.io/js/llm-exe.svg)](https://badge.fury.io/js/llm-exe)

A package that provides simplified base components to make building and maintaining LLM-powered applications easier.

- Write functions powered by LLM's with easy to use building blocks.
- Pure Javascript and Typescript. Allows you to pass and infer types.
- Support for text-based (llama-3) and chat-based prompts. (gpt-4o, claude-3.5, grok-3, Gemini, Bedrock, Ollama, etc)
- Call LLM's from different providers without changing your code. (OpenAi/Anthropic/xAI/Google/AWS Bedrock/Ollama)
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

```typescript
import * as llmExe from "llm-exe";

// or 

import { /* specific modules */ } from from "llm-exe"
```

## Basic Example
Below is simple example:
```typescript
import * as llmExe from "llm-exe";

/**
 * Define a yes/no llm-powered function
 */
export async function YesOrNoBot<I extends string>(input: I) {
  const llm = llmExe.useLlm("openai.gpt-4o-mini");

  const instruction = `You are not an assistant, I need you to reply with only 
  'yes' or 'no' as an answer to the question below. Do not explain yourself 
  or ask questions. Answer with only yes or no.`;

  const prompt = llmExe
    .createChatPrompt(instruction)
    .addUserMessage(input)
    .addSystemMessage(`yes or no:`);

  const parser = llmExe.createParser("stringExtract", { enum: ["yes", "no"] });
  return llmExe.createLlmExecutor({ llm, prompt, parser }).execute({ input });
}

const isTheSkyBlue = await YesOrNoBot(`Is AI cool?`)

/**
 * 
 * The prompt sent to the LLM would be: 
 * (line breaks added for readability)
 * 
 * [{ 
 *   role: 'system', 
 *    content: 'You are not an assistant, I need you to reply with only 
  'yes' or 'no' as an answer to the question asked by the user. Do not explain yourself 
  or ask questions. Answer only with yes or no.' 
 * },
 * { 
 *   role: 'user',
 *   content: 'Is AI cool?'
 * }]
 * 
 */

/**
 * 
 * console.log(isTheSkyBlue)
 * yes
 * /
```