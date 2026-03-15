# Anthropic

When using Anthropic models via AWS Bedrock, llm-exe will make POST requests to `https://bedrock-runtime.us-west-2.amazonaws.com/model/{MODEL_ID}/invoke`.

## Setup

### Anthropic Chat

```ts
const llm = useLlm("amazon:anthropic.chat.v1", {
  model: "anthropic.claude-sonnet-4-v2:0",  // This is the model id from Bedrock
});
```

## Anthropic-Specific Options

<!--@include: ../anthropic.options.part.md-->