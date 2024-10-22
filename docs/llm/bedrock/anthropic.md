# Anthropic

When using Anthropic models via AWS Bedrock, llm-exe will make POST requests to `https://api.anthropic.com/v1/messages`.

## Setup

### Anthropic Chat

```ts
const llm = useLlm("", {
  model: "claude-3-5-sonnet-20240620", // specify a model
});
```

## Anthropic-Specific Options

<!--@include: ../anthropic.options.part.md-->