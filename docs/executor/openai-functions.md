# Tool Calling Executor

To take advantage of tool calling with OpenAI, Anthropic, and other providers that support it, you can use `createLlmFunctionExecutor` or the `LlmExecutorWithFunctions` class directly. It works exactly like a regular [llm executor](/executor/) — it extends the class and adds options with some additional type constraints.

## Basic Example

```ts{13,14,15,16,17,18,19,20,21,26,27}
const llm = useLlm("openai.gpt-4o-mini");
const instruction = `You are walking through a maze.
You must take one step at a time.
Pick a direction to move.`;

const prompt = createChatPrompt(instruction);

// Using the factory function (recommended)
const executor = createLlmFunctionExecutor({
  llm,
  prompt,
})

// Or using the class directly
// const executor = new LlmExecutorWithFunctions({ llm, prompt })

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
