# Anthropic

When using Anthropic models via AWS Bedrock, llm-exe will make POST requests to `https://bedrock-runtime.us-west-2.amazonaws.com/model/{MODEL_ID}/invoke`.

## Setup

### Anthropic Chat

```ts
const llm = useLlm("amazon:anthropic.chat.v1", {
  model: "anthropic.claude-3-sonnet-20240229-v1:0", // specify a model
});
```

## Anthropic-Specific Options

<!--@include: ../anthropic.options.part.md-->