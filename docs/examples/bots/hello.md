## Hello World

Here is a simple example of an llm executor.

#### Step 2 - Prepare Prompt

<<< ../../../examples/helloWorld.ts#prompt

#### Step 3 - Create LLM Executor

Combine the prompt, LLM, and parser into a single function.

<<< ../../../examples/helloWorld.ts#function

#### Step 4 - Use it!

```ts
import { helloWorld } from "<your-file-path>";

const response = await helloWorld("Hello");

console.log(response);
/**
 * Hello World, you said Hello.
 **/
```

### Complete File

<<< ../../../examples/helloWorld.ts#file
