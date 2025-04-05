
# Amazon Embeddings

When using Amazon models, llm-exe will make POST requests to `https://api.openai.com/v1/chat/completions`. All models are supported if you pass `openai.chat.v1` as the first argument, and then specify a model in the options.

## Basic Usage

### Amazon Embeddings

```ts
const embeddings = createEmbedding("amazon.embedding.v1", {
  model: "amazon.titan-embed-text-v2:0",
});

const str = "The string of text you would like as vector";
const embedding = await embeddings.call(str);
const vector = embedding.getEmbedding();
console.log(vector);
// [
//  -0.08704914152622223,   0.062177956104278564,     0.0284775048494339,
//    0.0569550096988678,   0.021762285381555557,   0.046509113162755966,
// ...etc
// ]
```
