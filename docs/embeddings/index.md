# Embeddings

Embeddings is a wrapper around various embeddings providers, making your function implementations vendor-agnostic.

**Embeddings Features:**

- Built-in timeout mechanism for better control when a provider takes too long.
- Automatic retry with configurable back-off for errors.
- Use different LLM's with different configurations for different functions.

## Supported Embedding Providers
- OpenAi
- Amazon Embedding

## Adding Custom Providers
If you need to register additional embeddings's to be used, you can...
