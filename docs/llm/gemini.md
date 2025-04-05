# OpenAI

When using Google Gemini models, llm-exe will make POST requests to `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`. All models are supported if you pass `google.chat.v1` as the first argument, and then specify a model in the options.

## Basic Usage

### Google Gemini Chat

```ts
const llm = useLlm("google.chat.v1", {
  model: "gemini-2.0-flash", // specify a model
});
```

### Google Gemini Chat By Model

```ts
const llm = useLlm("google.gemini-2.0-flash", {
  // other options,
  // no model needed, using gemini-2.0-flash
});
```

<ImportModelNames provider="google" />

## Authentication

To authenticate, you need to provide an OpenAi API Key. You can provide the API key various ways, depending on your use case.

1. Pass in as execute options using `geminiApiKey`
2. Pass in as setup options using `geminiApiKey`
3. Use a default key by setting an environment variable of `GEMINI_API_KEY`

Generally you pass the LLM instance off to an LLM Executor and call that. However, it is possible to interact with the LLM object directly, if you wanted.

```ts
// given array of chat messages, calls chat completion
await llm.chat([]);

// given string prompt, calls completion
await llm.completion("");
```

## Gemini-Specific Options

In addition to the generic options, the following options are OpenAi-specific and can be passed in when creating a llm function.

| Option       | Type   | Default          | Description                                                          |
| ------------ | ------ | ---------------- | -------------------------------------------------------------------- |
| model        | string | gemini-2.0-flash | The model to use. Can be any valid chat model. See OpenAI Docs       |
| geminiApiKey | string | undefined        | API key for Google. See [authentication](/llm/gemini#authentication) |
| temperature  | number | undefined        | Maps to temperature.\*                                               |
| maxTokens    | number | undefined        | Maps to max_tokens. See OpenAI Docs                                  |
| topP         | number | undefined        | Maps to top_p. See OpenAI Docs                                       |

\* OpenAI Docs: [link](https://ai.google.dev/gemini-api/docs)
