# Install

Install llm-exe using npm.
```txt
npm i llm-exe
```

```ts
import llmExe from "llm-exe"

// or 

import { /* specific modules */ } from from "llm-exe"
```

## Basic Example
Below is simple example:
```js
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
 *   content: '<some prompt>
 *             Your response must be formatted like:
 *             - <subtask>
 *             - <subtask>
 *             - <subtask>' 
 * },
 * { 
 *   role: 'user',
 *   content: 'Hello! When was my last appointment?'
 * }]
 * 
 */

/**
 * 
 * Output from LLM executor:
 * [
 *  "a subtask the llm generated",
 *  "a subtask the llm generated",
 *  "a subtask the llm generated",
 * ]
 * /
```

Below is the above example with types added:

```ts
import {
  useLlm,
  createChatPrompt,
  createParser
} from "llm-exe";

interface ChatInput {
  input: string;
  anything: string[]
}

const instruction = `You are a customer support agent. Reply below.`;

const llm = useLlm("openai.chat.v1", {/* options */});
const prompt = createChatPrompt<ChatInput>(instruction);
const parser = createParser("json");

const executor = createLlmExecutor({
  llm,
  prompt,
  parser
})

const input = "Hello! When was my last appointment?";
const response = await executor.execute({ input })
```