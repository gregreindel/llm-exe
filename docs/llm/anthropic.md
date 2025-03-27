# Anthropic

When using Anthropic models, llm-exe will make POST requests to `https://api.anthropic.com/v1/messages`.

## Setup

### Anthropic Chat

```ts
const llm = useLlm("anthropic.chat.v1", {
  model: "claude-3-5-sonnet-20240620", // specify a model
});
```

### Anthropic Chat By Model

```ts
const llm = useLlm("anthropic.claude-3-5-sonnet-latest", {
  // other options,
  // no model needed, using claude-3-5-sonnet
});
```

> [!NOTE]
> You can use the following models using this shorthand:
>
> - anthropic.claude-3-5-sonnet-latest
> - anthropic.claude-3-opus-latest
> - anthropic.claude-3-sonnet-latest
> - anthropic.claude-3-haiku-latest

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

## Anthropic-Specific Options

<!--@include: ./anthropic.options.part.md-->