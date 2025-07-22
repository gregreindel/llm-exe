# Tool Calling / Functions Executor

To take advantage of Tool Calling with OpenAI, Anthropic, and Google Gemini, you can use an `LlmExecutorWithFunctions`. This executor extends the regular [llm executor](/executor/) with additional options and type constraints for tool calling.

::: info Provider Support
Tool calling is supported by:

- **OpenAI**: All GPT models (using the `tools` API)
- **Anthropic**: Claude 3+ models (using `tool_use` content blocks)
- **Google Gemini**: Gemini Pro models (using `functionCall` parts)
  :::

## Basic Example

Here's a simple example that works across all supported providers:

```ts
const llm = useLlm("openai.gpt-4o-mini"); // or "anthropic.claude-3-sonnet" or "google.gemini-pro"
const instruction = `You are walking through a maze.
You must take one step at a time.
Pick a direction to move.`;

const prompt = createChatPrompt(instruction);

const executor = new LlmExecutorWithFunctions({
  llm,
  prompt,
});

const functions = [
  {
    name: "move_left",
    description: "move one block to the left",
    parameters: {
      type: "object",
      properties: {
        steps: { type: "number", description: "number of steps to move" },
      },
      required: ["steps"],
    },
  },
  {
    name: "move_right",
    description: "move one block to the right",
    parameters: {
      type: "object",
      properties: {
        steps: { type: "number", description: "number of steps to move" },
      },
      required: ["steps"],
    },
  },
];

const response = await executor.execute(
  {
    input: "Hello! I need to go right.",
  },
  {
    functionCall: "auto",
    functions: functions,
  }
);

// The response will be a function call like:
// { name: "move_right", arguments: { steps: 1 } }
```

## Provider-Specific Examples

### OpenAI

OpenAI uses the newer `tools` API format (the deprecated `functions` API is still supported for backward compatibility):

```ts
const llm = useLlm("openai.gpt-4o");
const executor = new LlmExecutorWithFunctions({ llm, prompt });

const response = await executor.execute(input, {
  functionCall: "auto", // or "none" or specific function name
  functions: [
    {
      name: "get_weather",
      description: "Get the current weather",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string" },
        },
      },
    },
  ],
});
```

### Anthropic

Anthropic uses `tool_use` content blocks in the assistant messages:

```ts
const llm = useLlm("anthropic.claude-3-sonnet");
const executor = new LlmExecutorWithFunctions({ llm, prompt });

// Same interface as OpenAI
const response = await executor.execute(input, {
  functionCall: "auto",
  functions: [
    /* your functions */
  ],
});
```

### Google Gemini

Gemini uses `functionCall` in the parts array:

```ts
const llm = useLlm("google.gemini-pro");
const executor = new LlmExecutorWithFunctions({ llm, prompt });

// Same interface as other providers
const response = await executor.execute(input, {
  functionCall: "auto",
  functions: [
    /* your functions */
  ],
});
```

## Handling Function Responses

When the model calls a function, you need to execute it and send the result back:

```ts
const prompt = createChatPrompt("Help me with the weather");
const executor = new LlmExecutorWithFunctions({ llm, prompt });

// First execution - model calls the function
const functionCall = await executor.execute(
  {},
  {
    functionCall: "auto",
    functions: [
      {
        name: "get_weather",
        description: "Get weather for a location",
        parameters: {
          type: "object",
          properties: {
            location: { type: "string" },
          },
        },
      },
    ],
  }
);

// Execute the function (your code)
const weatherData = await getWeather(functionCall.arguments.location);

// Add the function response to the conversation
prompt.addFunctionMessage(JSON.stringify(weatherData), functionCall.name);

// Continue the conversation
const finalResponse = await executor.execute({});
```

## Migration Guide

### Deprecated Class Names

The following class names have been deprecated but are still available for backward compatibility:

::: warning Deprecation Notice

- `LlmExecutorOpenAiFunctions` → Use `LlmExecutorWithFunctions` instead
- `OpenAiFunctionParser` → Use `FunctionCallParser` instead (for advanced usage)

These deprecated names will be removed in the next major version.
:::

### Migrating from Old Function Calling

If you're using the older OpenAI function calling format, your code will continue to work. The library automatically converts between the old and new formats:

```ts
// Old way (still works)
const executor = new LlmExecutorOpenAiFunctions({ llm, prompt });

// New way (recommended)
const executor = new LlmExecutorWithFunctions({ llm, prompt });
```

## Advanced: Multiple Function Calls

Some providers support calling multiple functions in a single response. While the executor currently returns only the first function call for backward compatibility, the underlying parsers capture all function calls:

```ts
// Future feature (not yet available in executors)
const executor = new LlmExecutorWithFunctions({
  llm,
  prompt,
  multipleFunctions: true, // Coming soon
});
```

## Parser Options

For advanced use cases, you can use the `FunctionCallParser` directly:

```ts
import { FunctionCallParser, StringParser } from "llm-exe";

const parser = new FunctionCallParser({
  parser: new StringParser(), // Fallback parser
  multiple: true, // Return array of all function calls
});

// Use with raw LLM output
const functions = parser.parse(llmOutput);
```

## Provider Differences

While the interface is consistent across providers, there are some behavioral differences:

| Feature                     | OpenAI | Anthropic | Gemini                      |
| --------------------------- | ------ | --------- | --------------------------- |
| Multiple functions per call | ✅     | ✅        | ✅                          |
| Streaming function calls    | ✅     | ✅        | ❌                          |
| Function call IDs           | ✅     | ✅        | ❌                          |
| System messages             | ✅     | ✅        | ✅ (via system_instruction) |

## Best Practices

1. **Always validate function arguments** - The LLM-generated arguments are parsed as-is
2. **Handle errors gracefully** - Function calls can fail or return unexpected results
3. **Use descriptive function names and descriptions** - This helps the model choose correctly
4. **Keep function schemas simple** - Complex nested schemas may confuse the model
5. **Test across providers** - Each provider may interpret functions slightly differently
