# Ollama

When using Ollama models, llm-exe will make POST requests to `http://localhost:11434`. You can also override this by setting the environment variable `OLLAMA_ENDPOINT`. All models are supported if you pass `ollama.chat.v1` as the first argument, and then specify a model in the options (assuming you have downloaded this model).

## Basic Usage

### Ollama Chat

```ts
const llm = useLlm("ollama.chat.v1", {
  model: "deepseek-r1", // specify a model
});
```

### Ollama Chat By Model

```ts
const llm = useLlm("ollama.deepseek-r1", {
  // other options,
  // no model needed, using deepseek-r1
});
```

> [!NOTE]
> You can use the following models using this shorthand:
> - deepseek-r1
> - llama3.3
> - llama3.2
> - llama3.1
> - qwq




Generally you pass the LLM instance off to an LLM Executor and call that. However, it is possible to interact with the LLM object directly, if you wanted.

```ts
// given array of chat messages, calls chat completion
await llm.chat([]);

// given string prompt, calls completion
await llm.completion("");
```

## Ollama-Specific Options

In addition to the generic options, the following options are Ollama-specific and can be passed in when creating a llm function.

| Option           | Type    | Default     | Description                                                    |
| ---------------- | ------- | ----------- | -------------------------------------------------------------- |
| model            | string  | gpt-4o-mini | The model to use. Can be any valid chat model. See Ollama Docs |
| temperature      | number  | undefined   | Maps to temperature.*                          |
| maxTokens        | number  | undefined   | Maps to max_tokens. See Ollama Docs                            |
| topP             | number  | undefined   | Maps to top_p. See Ollama Docs                                 |

\* Ollama Docs: [link](https://ollama.com/)
