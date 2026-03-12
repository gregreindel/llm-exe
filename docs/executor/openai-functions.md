# Tool Calling Executor

To take advantage of tool calling with OpenAI and Anthropic, you can use `createLlmFunctionExecutor` (or the `LlmExecutorWithFunctions` class directly). It works exactly like a regular [LLM executor](/executor/) but adds options for function/tool definitions with additional type constraints.

## Basic Example

Use the `createLlmFunctionExecutor` factory to create a tool-calling executor:

```ts{1,13,14,15,16,17,18,19,20,21,26,27}
import { useLlm, createChatPrompt, createLlmFunctionExecutor } from "llm-exe";

const llm = useLlm("openai.gpt-4o-mini");
const instruction = `You are walking through a maze.
You must take one step at a time.
Pick a direction to move.`;

const prompt = createChatPrompt(instruction);

const executor = createLlmFunctionExecutor({
  llm,
  prompt,
})

const functions = [{
    name: "move_left",
    description: "move one block to the left",
    parameters: {/* options, as JSON Schema */}
},{
    name: "move_right",
    description: "move one block to the right",
    parameters: {/* options, as JSON Schema */}
}]

const response = await executor.execute({
  input: "Hello!"
}, {
  functionCall: "auto",
  functions: functions,
})
```
