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
  createChatPrompt
} from "llm-exe";

const llm = useLlm("openai.gpt-4o-mini");
const prompt = createChatPrompt("Talk like a pirate.")

const executor = createLlmExecutor({
  llm,
  prompt
})

const input = "Hello!";
const response = await executor.execute({ input })
/**
 * 
 * The prompt sent to the LLM would be: 
 * (line breaks added for readability)
 * 
 * [{ 
 *   role: 'system', 
 *   content: 'Talk like a pirate.' 
 * },
 * { 
 *   role: 'user',
 *   content: 'Hello!'
 * }]
 * 
 */

/**
 * 
 * Output from LLM executor:
 * Arrr, matey! Speak up, fer me ears be as keen as a sea serpent's! 
 * Avast ye, what be your query?
 * /
```