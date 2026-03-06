# Executor Options

## Creation Options

When creating an executor with `createLlmExecutor`, you pass two arguments:

1. **Configuration object** — the LLM, prompt, parser, and optional state
2. **Options object** (optional) — hooks and other settings

```typescript
import { useLlm, createChatPrompt, createParser, createLlmExecutor } from "llm-exe";

const executor = createLlmExecutor(
  {
    llm: useLlm("openai.gpt-4o-mini"),
    prompt: createChatPrompt("Summarize: {{text}}"),
    parser: createParser("string"),
  },
  {
    hooks: {
      onComplete: () => console.log("Done"),
      onSuccess: (result) => console.log("Result:", result),
      onError: (error) => console.error("Error:", error),
    },
  }
);
```

### Configuration

| Option   | Type          | Required | Description                                                    |
| -------- | ------------- | -------- | -------------------------------------------------------------- |
| llm      | `BaseLlm`    | Yes      | LLM instance created with `useLlm()`                          |
| prompt   | `BasePrompt`  | Yes      | Prompt instance, or a function that returns one                |
| parser   | `BaseParser`  | No       | Parser instance. Defaults to string parser if not provided     |
| state    | `BaseState`   | No       | State instance for managing dialogue and context               |
| name     | `string`      | No       | Name for the executor, used in tracing and metadata            |

### Hooks

See [Hooks](/executor/hooks.html) for full documentation on available hooks.

## Execute Options

When calling `executor.execute()`, you can optionally pass a second argument with execution-time options:

```typescript
const result = await executor.execute(
  { text: "Hello world" },
  { jsonSchema: mySchema }
);
```

| Option     | Type                      | Description                                         |
| ---------- | ------------------------- | --------------------------------------------------- |
| jsonSchema | `Record<string, any>`     | JSON schema to pass to the LLM for structured output |
