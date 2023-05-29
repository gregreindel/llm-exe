## Simple Combining  

In this example, we will create a single function that wraps 2 executor functions. The function will be provided a block of code, and will output some Jest tests. Instead of just saying 'write me jest tests', we will have the LLM plan a bit in advance. 

This can be useful as:
- Planning any ideas
- Iterating on plans

This is really just a simple loop that combines 2 functions, but using LLM executors keeps the code simple.

#### Step 1 - Create LLM Executor to make list of test cases given a function
@[code{13-33} ts:no-line-numbers](../../examples/ListInList.ts)

#### Step 2 - Create LLM Executor to write single test case
@[code{34-62} ts:no-line-numbers](../../examples/ListInList.ts)

#### Step 3 - Combine into single method
Combine the prompt, LLM, and parser into a single function.
@[code{63-88} ts:no-line-numbers](../../examples/ListInList.ts)


#### Step 4 - Use it!


```typescript:no-line-numbers
import { checkPolicy } from "./somewhere"

// the input you get from somewhere
const input = "";

// a chat history, loaded from somewhere
const chatHistory = [{ role: "user", content: "Hi I'm Greg" }];

// a list of statements we'd like to check
const statements = [
    "The user has told us their age.",
     "The user has told us their name."
]

const response = await checkPolicy().execute({
    mostRecentMessage: input,
    chatHistory,
    statements
});

/**
 * 
 * console.log(response)
 * {
 *   "passed": false,
 *   "results": [{
 *     "statement": "The user has told us their age.",
 *     "answer":"false",
 *     "confidence":"95"
 *    },{
 *      "statement": "The user has told us their name.",
 *      "answer": "true",
 *      "confidence":"80"
 *    }]
 * }
 ** 
```

```typescript

```
### Complete File
@[code](../../examples/Verify.ts)
