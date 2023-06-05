# LLM Executor

The LLM executor takes an [llm](/llm), a [prompt](/prompt), optionally a [parser](/parser), and wraps in a well-typed executor function. An LLM executor is a *container* that can be used to call an LLM with a pre-defined input and output; with additional values provided at the time of execution. The executor is responsible for combining and calling the provided components, with added tracing, metadata, and extendable hooks.

An LLM executor's input and output types are determined by the prompt and parser respectively. These are inferred automatically when working with Typescript. See working with types in prompts and parsers.

## Llm Executor Input
**llm** (required) `instance of BaseLlm`. Use createPrompt or createChatPrompt.

**prompt** (required) `instance of BasePrompt` Either text or chat, respective of the LLM.

**parser** (optional) defaults to string if not provided.

**hooks** (optional) allows you to hook into various stages of the execution. Most useful for logging, but may be used for additional plugins.

There are other components that an llmExecutor can be passed to. See callable executors.

Llm function extends `CoreExecutor`.

## Basic Example
```typescript
import {
  createLlmOpenAi,
  createChatPrompt,
  createParser
} from "llm-exe";

const llm = createLlmOpenAi({});
const instruction = `You are a customer support agent. Reply below.`;
const prompt = createChatPrompt(instruction);

const executor = createLlmExecutor({
  llm,
  prompt,
})

const response = await executor.execute({input: "Hello!"})
```

## Basic Example with All Options
```typescript
import {
  createLlmOpenAi,
  createChatPrompt,
  createParser
} from "llm-exe";

const llm = createLlmOpenAi({});
const instruction = `You are a customer support agent. Reply below.`;
const prompt = createChatPrompt(instruction);
const parser = createParser("json");

const hooks = {
  onComplete(){},
  onSuccess(){},
  onError(){},
}

const executor = createLlmExecutor({
  llm,
  prompt,
  parser
}, hooks)

const response = await executor.execute({input: "Hello!"})
```

`createLlmExecutor` Returns an instance of LlmExecutor. 


