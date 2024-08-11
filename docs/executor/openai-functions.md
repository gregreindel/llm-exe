# OpenAi Functions Executor

To take advantage of OpenAI Function Calling [announcement](https://openai.com/blog/function-calling-and-other-api-updates)|[docs](https://platform.openai.com/docs/guides/gpt/function-calling), You can use an `LlmExecutorOpenAiFunctions`. A LlmExecutorOpenAiFunctions is exactly like a regular [llm executor](/executor/) - in fact, it just extends the class and adds options with some additional type restraints.

## Basic Example
Highlighted below are the few lines that demonstrate the options for a 
```typescript{13,14,15,16,17,18,19,20,21,26,27}:no-line-numbers
const llm = useLlm("openai.chat.v1", {/* options */});
const instruction = `You are walking through a maze.
You must take one step at a time.
Pick a direction to move.`;

const prompt = createChatPrompt(instruction);

const executor = new LlmExecutorOpenAiFunctions({
  llm,
  prompt,
})

const functions = [{
    name: "move_left",
    description: "move one block to the left",
    parameters: {/* options */}
},{
    name: "move_right",
    description: "move one block to the right",
    parameters: {/* options */}
}]

const response = await executor.execute({
  input: "Hello!"
}, {
  functionCall: "auto",
  functions: functions,
})
```
