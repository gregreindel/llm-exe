# LLM Executor Function Syntax
llm-exe aims to be building blocks, allowing you to use the pieces as you wish. Below are suggestions on how to contain an LLM executor in a way that can be used throughout your application. Ultimately, do what you want.

## LLM Executor Function 

All examples below will share this prompt instruction and input interface.
@[code{9-26} ts:no-line-numbers](../../examples/basicFunctions.ts)

### Return an Executor
One way to structure the function is to have the function return the executor its self. This is useful in that it returns an instance of LlmExecutor. You can attach hooks, listen for events, etc.

@[code{28-36} ts:no-line-numbers](../../examples/basicFunctions.ts)
When using this approach, whenever you import this function to use, you will need to call execute on it. For example: 

```typescript:{5}:no-line-numbers
import { llmExecutorExample } from "example-above"

const executor = llmExecutorExample()

const result = await executor.execute({
    userInput: "",
    timeOfDay: ""
})
```

### Return a Value
With this approach, you encapsulate the executor and execution. Note the main differences: 
1. The function is now an async function
2. The function requires an input (what gets passed into `.execute()`)
3. The LLM executor is executed and the value is returned on every call, rather than the executor.

@[code{39-50} ts:{1,11}:no-line-numbers](../../examples/basicFunctions.ts)

```typescript:no-line-numbers
import { llmExecutorExample } from "example-above"

const result = await llmExecutorExample({
    userInput: "",
    timeOfDay: ""
})
```

## Structuring Files
When dealing with LLM Executors that have elaborate prompts, custom output parsers, or both, it may be useful to break the components out into different files. For example:

```
llms
- intent-bot
  - index.ts // executor lives here
  - parser.ts // export your parser
  - prompt.ts // export your prompt
  - types.ts // types
```
index.ts
```typescript
import { CustomInputType} from "./types"
import { parser } from "./parser"
import { prompt } from "./prompt"

export async function myLlmExecutorExecute(input: CustomInputType){
  return createLlmExecutor({
    prompt,
    parser,
    llm,
  }).execute(input);
}
```


::: tip
Allowing `prompt` and `parsers` to be imported/exported makes them testable components!
:::

## Other Notes
Its reasonable to pass an llm around.
@[code{52-63} ts:{2}:no-line-numbers](../../examples/basicFunctions.ts)
