# xAI

When using xAI models, llm-exe will make POST requests to `https://api.x.ai/v1/chat/completions`. All models are supported if you pass `xai.chat.v1` as the first argument, and then specify a model in the options.

## Basic Usage

### xAI Chat

```ts
const llm = useLlm("xai.chat.v1", {
  model: "grok-2", // specify a model
});
```

### x.ai Chat By Model

```ts
const llm = useLlm("xai.grok-2", {
  // other options,
  // no model needed, using grok-2
});
```

<ImportModelNames provider="xai" />


## Authentication

To authenticate, you need to provide an xAI API Key. You can provide the API key various ways, depending on your use case.

1. Pass in as execute options using `xAiApiKey`
2. Pass in as setup options using `xAiApiKey`
3. Use a default key by setting an environment variable of `XAI_API_KEY`

Generally you pass the LLM instance off to an LLM Executor and call that. However, it is possible to interact with the LLM object directly, if you wanted.

```ts
// given array of chat messages, calls chat completion
await llm.chat([]);
```


## xAI-Specific Options

In addition to the generic options, the following options are xAI-specific and can be passed in when creating a llm function.

| Option           | Type    | Default     | Description                                                    |
| ---------------- | ------- | ----------- | -------------------------------------------------------------- |
| model            | string  | gpt-4o-mini | The model to use. Can be any valid chat model. See xAI Docs |
| xAiApiKey     | string  | undefined   | API key for xAI.    |
| temperature      | number  | undefined   | Maps to temperature.*                          |
| maxTokens        | number  | undefined   | Maps to max_tokens. See xAI Docs                            |
| topP             | number  | undefined   | Maps to top_p. See xAI Docs                                 |
| n                | number  | undefined   | Maps to n. See xAI Docs                                     |
| stream           | boolean | undefined   | See xAI Docs. Note: Not supported yet.                      |
| stop             | ?       | undefined   | Maps to stop. See xAI Docs                                  |
| presencePenalty  | number  | undefined   | Maps to presence_penalty. See xAI Docs                      |
| frequencyPenalty | number  | undefined   | Maps to frequency_penalty. See xAI Docs                     |
| logitBias        | object  | undefined   | Maps to logit_bias. See xAI Docs                            |
| user             | string  | undefined   | Maps to user. See xAI Docs                                  |

\* xAI Docs: [link](https://docs.x.ai/docs/overview)
