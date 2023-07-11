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

const llm = createLlmOpenAi({/* options */});
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

const llm = createLlmOpenAi({/* options */});
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