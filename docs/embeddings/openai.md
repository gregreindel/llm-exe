# OpenAI Embeddings

When using OpenAi models, llm-exe will make POST requests to `https://api.openai.com/v1/chat/completions`. All models are supported if you pass `openai.chat.v1` as the first argument, and then specify a model in the options.

## Basic Usage

### OpenAi Embeddings

```ts
const embeddings = createEmbedding("openai.embedding.v1", {
    model: "text-embedding-3-small",
});

const str = "The string of text you would like as vector";
const embedding = await embeddings.call(str);
const vector = embedding.getEmbedding();
console.log(vector);
// [
//   -0.014564549,   0.026690058,  -0.021338109,  -0.042174473,   -0.05775645,
//    -0.04404208, -0.0035819034,  -0.012320633,   -0.02112905,   0.030355586,
// ...etc
// ]
```
