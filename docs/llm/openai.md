# OpenAI

When using OpenAi models, llm-exe will make POST requests to `https://api.openai.com/v1/chat/completions`. All models are supported if you pass `openai.chat.v1` as the first argument, and then specify a model in the options.

## Basic Usage

### OpenAi Chat

```ts
const llm = useLlm("openai.chat.v1", {
  model: "gpt-4o", // specify a model
});
```

### OpenAi Chat By Model

```ts
const llm = useLlm("openai.gpt-4o", {
  // other options,
  // no model needed, using gpt-4o
});
```

<ImportModelNames provider="openai" />

## Authentication

To authenticate, you need to provide an OpenAi API Key. You can provide the API key various ways, depending on your use case.

1. Pass in as execute options using `openAIApiKey`
2. Pass in as setup options using `openAIApiKey`
3. Use a default key by setting an environment variable of `OPENAI_API_KEY`

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

In addition to the generic options, the following options are OpenAi-specific and can be passed in when creating a llm function.

| Option           | Type    | Default     | Description                                                    |
| ---------------- | ------- | ----------- | -------------------------------------------------------------- |
| model            | string  | gpt-4o-mini | The model to use. Can be any valid chat model. See OpenAI Docs |
| openAIApiKey     | string  | undefined   | API key for OpenAi. See [authentication](/llm/openai#authentication)   |
| temperature      | number  | undefined   | Maps to temperature.*                          |
| maxTokens        | number  | undefined   | Maps to max_tokens. See OpenAI Docs                            |
| topP             | number  | undefined   | Maps to top_p. See OpenAI Docs                                 |
| n                | number  | undefined   | Maps to n. See OpenAI Docs                                     |
| stream           | boolean | undefined   | See OpenAI Docs. Note: Not supported yet.                      |
| stop             | ?       | undefined   | Maps to stop. See OpenAI Docs                                  |
| presencePenalty  | number  | undefined   | Maps to presence_penalty. See OpenAI Docs                      |
| frequencyPenalty | number  | undefined   | Maps to frequency_penalty. See OpenAI Docs                     |
| logitBias        | object  | undefined   | Maps to logit_bias. See OpenAI Docs                            |
| user             | string  | undefined   | Maps to user. See OpenAI Docs                                  |

\* OpenAI Docs: [link](https://platform.openai.com/docs/api-reference/chat)
