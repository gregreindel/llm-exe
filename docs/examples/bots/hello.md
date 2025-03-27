## Hello World 

Here is a simple example of an llm executor.


#### Step 2 - Prepare Prompt

<<< ../../../examples/helloWorld.ts#prompt

#### Step 3 - Create LLM Executor
Combine the prompt, LLM, and parser into a single function.

<<< ../../../examples/helloWorld.ts#function

#### Step 4 - Use it!

```ts
import { extractInformation } from "./somewhere"

// a chat history, loaded from somewhere
const chatHistory = [];

const response = await extractInformation({
    // the input you get from somewhere
    input: "I'm going to be in berlin",
    chatHistory
}, schema);

/**
 * 
 * console.log(response)
 * {
 *   "city": "Berlin",
 *   "startDate": "unknown",
 *   "endDate": "unknown",
 * }
 **/

// the intent is focused on the most recent message
chatHistory.push({ 
    role: "user",
    content: "I'm going to be in berlin"
});

const response2 = await identifyIntent().execute({
    input: "I get there the 14th and leave the 18th",
    chatHistory
}, schema);

/**
 * 
 * console.log(response)
 * {
 *   "city": "Berlin",
 *   "startDate": "06/14/2023",
 *   "endDate": "06/18/2023",
 * }
 **/
```

### Complete File

<<< ../../../examples/helloWorld.ts#file