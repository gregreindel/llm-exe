# Anthropic

## Setup

### Anthropic Chat
```ts
const llm = useLlm("anthropic.chat.v1", { //
  model: "claude-3-5-sonnet-20240620",
  anthropicApiKey: "<your anthropic API Key>" // optional, see `Authentication` below
});
```

### Anthropic Chat By Model
```ts
const llm = useLlm("claude-3-5-sonnet", {
  anthropicApiKey: "<your anthropic API Key>" // optional, see `Authentication` below
  // options
});
```

## Authentication
To authenticate, you need to provide an Anthropic API Key. You can either provide the API key various ways, depending on your use case. 
- Pass in as execute options using `anthropicApiKey`
- Pass in as setup options using `anthropicApiKey`
- Use a default key by setting an environment variable of `ANTHROPIC_API_KEY`

## Basic Usage

Generally you pass the LLM instance off to an LLM Executor and call that. However, it is possible to interact with the LLM object directly, if you wanted.

```ts
// given array of chat messages, calls chat completion
await llm.call([]);

// given string prompt, calls completion
await llm.call("");
```

## Usage with LLM Executor

## Anthropic-Specific Options

| Option             | Type              | Default       | Description                                                                 |
| ------------------ | ----------------- | ------------- | --------------------------------------------------------------------------- |
| anthropicApiKey     | string          | undefined   | API key for Anthropic. Optionally can be set using process.env.OPEN_AI_API_KEY |
| model            | string          | claude-3-5-sonnet | The model to use. Can be any one of: claude-3-5-sonnet, etc.       |
| temperature      | number          | 0           | See Anthropic Docs                                                             |
| maxTokens        | number          | 500         | See Anthropic Docs                                                             |
| topP             | number \| null  | null        | See Anthropic Docs                                                             |
| n                | number \| null  | null        | See Anthropic Docs                                                             |
| stream           | boolean \| null | null        | See Anthropic Docs. Note: Not supported yet.                                   |
| stop             | ?                 | null        | See Anthropic Docs                                                             |
| presencePenalty  | number \| null  | null        | See Anthropic Docs                                                             |
| frequencyPenalty | number \| null  | null        | See Anthropic Docs                                                             |
| logitBias        | object \| null  | null        | See Anthropic Docs                                                             |
| user             | string \| null  | null        | See Anthropic Docs                                                             |

Anthropic Docs: [link](https://platform.openai.com/docs/api-reference/completions)

## Anthropic LLM Methods

**chat**
Calls chat completions endpoint. Must by using text prompt and one of these models: .

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
