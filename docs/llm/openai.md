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
// call the LLM directly with a prompt
await llm.call(prompt);
```

## OpenAi-Specific Options

In addition to the generic options, the following options are OpenAi-specific and can be passed in when creating a llm function.

| Option       | Type    | Default     | Description                                                          |
| ------------ | ------- | ----------- | -------------------------------------------------------------------- |
| model        | string  | gpt-4o-mini | The model to use. Can be any valid chat model. See OpenAI Docs*      |
| openAIApiKey | string  | undefined   | API key for OpenAi. See [authentication](/llm/openai#authentication) |
| topP         | number  | undefined   | Maps to `top_p`. See OpenAI Docs*                                    |
| useJson      | boolean | undefined   | Sets `response_format.type` to `json_object` when `true`             |
| effort       | string  | undefined   | Maps to `reasoning_effort` for supported models (e.g. gpt-5). Values: `minimal`, `low`, `medium`, `high` |

\* OpenAI Docs: [link](https://platform.openai.com/docs/api-reference/chat)
