# OpenAI

## Basic Usage

### OpenAi Chat

```ts
const llm = useLlm("openai.chat.v1", { //
  model: "gpt-4o",
});
```

### OpenAi Chat By Model

```ts
const llm = useLlm("openai.gpt-4o", {
  // options
});
```

Generally you pass the LLM instance off to an LLM Executor and call that. However, it is possible to interact with the LLM object directly, if you wanted.

```ts
// given array of chat messages, calls chat completion
await llm.chat([]);

// given string prompt, calls completion
await llm.completion("");
```

::: tip
Note: The `OpenAILlm` checks to make sure you are using the correct prompt type when using chat vs completion, and will throw an error if you try to use the wrong prompt type with the wrong model.
:::

## OpenAi-Specific Options

| Option             | Type              | Default       | Description                                                                 |
| ------------------ | ----------------- | ------------- | --------------------------------------------------------------------------- |
| `openAIApiKey`     | `string`          | `undefined`   | API key for OpenAI. Optionally can be set using process.env.OPEN_AI_API_KEY |
| `model`            | `string`          | `gpt-4o-mini` | The model to use. Can be any one of: gpt-4, gpt-4o, gpt-4o-mini, etc.       |
| `temperature`      | `number`          | `0`           | See OpenAI Docs                                                             |
| `maxTokens`        | `number`          | `500`         | See OpenAI Docs                                                             |
| `topP`             | `number \| null`  | `null`        | See OpenAI Docs                                                             |
| `n`                | `number \| null`  | `null`        | See OpenAI Docs                                                             |
| `stream`           | `boolean \| null` | `null`        | See OpenAI Docs. Note: Not supported yet.                                   |
| `stop`             | ?                 | `null`        | See OpenAI Docs                                                             |
| `presencePenalty`  | `number \| null`  | `null`        | See OpenAI Docs                                                             |
| `frequencyPenalty` | `number \| null`  | `null`        | See OpenAI Docs                                                             |
| `logitBias`        | `object \| null`  | `null`        | See OpenAI Docs                                                             |
| `user`             | `string \| null`  | `null`        | See OpenAI Docs                                                             |

OpenAI Docs: [link](https://platform.openai.com/docs/api-reference/completions)

## OpenApi LLM Methods

**chat**
Calls chat completions endpoint. Must by using text prompt and one of these models: gpt-4o, gpt-4o-mini, gpt-3.5-turbo.

**completion**
Calls completions endpoint. Must by using text prompt and one of these models: davinci, text-curie-001, text-babbage-001.

**getMetrics()**
Get the total prompt and completion tokens across all calls to the API. Returns an object with total prompt and completion tokens.

**calculatePrice()**
Calculate the API call cost based on model used and input and output tokens.
@param `input_tokens` - The number of input tokens.
@param `output_tokens` - The number of output tokens (defaults to 0).
@returns An object for input/output tokens and cost.

**logMetrics()**
Log a table containing usage metrics for the OpenAI API.
