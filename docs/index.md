---
title: Typescript LLM Utilities
description: A package that provides utilities, wrappers, and base abstractions to help make writing applications with llm-powered functions easier.
---
# llm-exe

A package that provides simplified base components to make building and maintaining LLM-powered applications easier.

- Write functions powered by LLM's with easy to use building blocks.
- Pure Javascript and Typescript. Allows you to pass and infer types.
- Not very opinionated. You have control on how you use it.
- Support for text-based and chat-based prompts (gpt-3.5-turbo and gpt-4).
- Supercharge your prompts by using handlebars within prompt template.
- Allow LLM's to call functions (or call other LLM executors).

## Core Components
- [LLM Executor](/executor)
  - [LLM](/llm)
  - [Prompt](/prompt)
  - [Parser](/parser)
- [State](/parser)
- [Callable Executor Wrapper](/callable)
- Embeddings (coming soon)
- Vector Store (coming soon)

### Getting Started

Install llm-exe using npm.
```
npm i llm-exe
```

```typescript
import * as llmExe from "llm-exe"

// or 
import { /* specific modules */ } from from "llm-exe/dist"
```

### Basic Example
Below is simple example:
```javascript
import {
  createLlmOpenAi,
  createChatPrompt,
  createParser
} from "llm-exe";

const instruction = `Based on the user message, I need you to provide a
list of subtasks that need to be taken to answer their question.

Your response must be formatted like:
<subtask>
<subtask>
<subtask>

Review the user message and reply with a list of subtasks:`;

const llm = createLlmOpenAi({});
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
 *    content: 'Based on the user message, I need you to provide a list of 
 *              subtasks that need to be taken to answer their question.\n 
 *              Your response must be formatted like:\n<subtask>\n<subtask>\n 
 *              <subtask>\nReview the user message and reply with a list 
 *              of subtasks:' 
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

Below is the above example with types added:

```typescript
import {
  createLlmOpenAi,
  createChatPrompt,
  createParser
} from "llm-exe";

interface ChatInput {
  input: string;
  anything: string[]
}

const instruction = `You are a customer support agent. Reply below.`;

const llm = createLlmOpenAi({});
const prompt = createChatPrompt<ChatInput>(instruction);
const parser = createParser("json");

const executor = createLlmExecutor({
  llm,
  prompt,
  parser
})

const execute = executor.execute({ input });

const response = await executor.execute({input: "Hello!"})
```

### LLM
LLM is a wrapper around various LLM providers.
- Built-in retry with configurable timeout.
- Configurable back-off mechanism.
- Use different llms with different configurations for different functions.

### Prompt
 Prompts are just a string template, so we treat them as that. 

- Uses handlebars as template engine, allowing you to use features such as custom templates, partials, functions, etc. See handlebars documentation.


### Parser
Parsers are used to parse LLM responses.

Example default parsers are:
- JSON: will try to parse a string response that contains JSON to a plain object. You can pass schema (Schema spec) to infer typings, provide validation, and set defaults.
- List to array: Will take text separated with `/n` and return an array of strings.
- Number: will enforce a number from the response.


#### Llm Executor
Llm-powered functions take an llm, prompt, and optionally a parser, and wrap in a well-typed executor function. These can be used to call an llm with the input passed at the time of execution.


### Callable Executors
Callable executors are a wrapper around core executors, which add a few extra properties, and make them callable from an llm.

`CallableCoreFunction` - class that takes a function or pipeline and makes it callable by an llm by adding some properties,
`createCallableCoreFunction` - helper function that returns a new CallableCoreFunction instance

`UseFunctions` - class that is provided an array of callable functions, and provides an interface to easily call them, and get info about them, etc.
`useFunctions` - helper function that returns a new UseFunctions instance


### Core Functions 
Core functions are the base of an llm function. Only advanced uses will require using (or extending) core functions directly. You may notice that you use core functions indirectly, as any normal function passed into pipeline, or callable function, will be wrapped internally as a core function.
`createLlmExecutor`- helper function, returns new LlmExecutor instance

Core functions are a class that provides a unified interface for calling llm and non-llm powered functions. 
`createCoreExecutor` - helper function, returns new CoreExecutor instance