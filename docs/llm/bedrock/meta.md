# Meta

When using Meta models via AWS Bedrock, llm-exe will make POST requests to `https://bedrock-runtime.us-west-2.amazonaws.com/model/{MODEL_ID}/invoke`.

## Setup

### Meta LLama

```ts
const llm = useLlm("amazon:meta.chat.v1", {
    model: "llama3-8b-instruct-v1:0", // This is the model id from Bedrock
});
```

## LLama-Specific Options