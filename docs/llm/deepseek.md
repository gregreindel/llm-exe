# Deepseek

When using Deepseek models, llm-exe will make POST requests to `https://api.deepseek.com/v1/chat/completions`. All models are supported if you pass `deepseek.chat.v1` as the first argument, and then specify a model in the options.

## Basic Usage

### Deepseek Chat

```ts
const llm = useLlm("deepseek.chat.v1", {
  model: "deepseek-chat", // specify a model
});
```

### Deepseek Chat By Model

```ts
const llm = useLlm("deepseek.chat", {
  // other options,
  // no model needed, using deepseek-chat model
});
```

<ImportModelNames provider="deepseek" />

## Authentication

To authenticate, you need to provide an Deepseek API Key. You can provide the API key various ways, depending on your use case.

1. Pass in as execute options using `deepseekApiKey`
2. Pass in as setup options using `deepseekApiKey`
3. Use a default key by setting an environment variable of `DEEPSEEK_API_KEY`

Generally you pass the LLM instance off to an LLM Executor and call that. However, it is possible to interact with the LLM object directly, if you wanted.

```ts
// given array of chat messages, calls chat completion
await llm.chat([]);

// given string prompt, calls completion
await llm.completion("");
```

## Deepseek-Specific Options

In addition to the generic options, the following options are Deepseek-specific and can be passed in when creating a llm function.

| Option           | Type    | Default     | Description                                                    |
| ---------------- | ------- | ----------- | -------------------------------------------------------------- |
| model            | string  | gpt-4o-mini | The model to use. Can be any valid chat model. See Deepseek Docs |
| deepseekApiKey     | string  | undefined   | API key for Deepseek. See [authentication](/llm/deepseek#authentication)   |
| temperature      | number  | undefined   | Maps to temperature.*                          |
| maxTokens        | number  | undefined   | Maps to max_tokens. See Deepseek Docs                            |
| topP             | number  | undefined   | Maps to top_p. See Deepseek Docs                                 |
| n                | number  | undefined   | Maps to n. See Deepseek Docs                                     |
| stream           | boolean | undefined   | See Deepseek Docs. Note: Not supported yet.                      |


\* Deepseek Docs: [link](https://api-docs.deepseek.com/)
