# Meta

When using Meta models via AWS Bedrock, llm-exe will make POST requests to `https://bedrock-runtime.us-west-2.amazonaws.com/model/{MODEL_ID}/invoke`.

## Setup

### Meta LLama

```ts
const llm = useLlm("amazon:meta.chat.v1", {
    model: "meta.llama3-8b-instruct-v1:0", // specify a model
});
```

## LLama-Specific Options