# OpenAI Embeddings

When using OpenAI embeddings, llm-exe will make POST requests to `https://api.openai.com/v1/embeddings`.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `model` | `string` | — | The OpenAI embedding model to use (e.g., `text-embedding-3-small`) |
| `dimensions` | `number` | `1536` | The number of dimensions for the output embedding |
| `encodingFormat` | `string` | — | The encoding format (e.g., `float`, `base64`) |
| `openAiApiKey` | `string` | `OPENAI_API_KEY` env var | Your OpenAI API key |

## Basic Usage

```ts
import { createEmbedding } from "llm-exe";

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

## Custom Dimensions

```ts
const embeddings = createEmbedding("openai.embedding.v1", {
    model: "text-embedding-3-small",
    dimensions: 512,
});
```
