---
title: LLMs | Connect and Configure Models in llm-exe
description: "Use any LLM with a consistent, composable API. llm-exe supports OpenAI, Anthropic, Amazon, and more—giving you full control over model config, retries, and usage patterns with minimal setup."
---

# LLM

LLM is a wrapper around various LLM providers, making your function implementations LLM-agnostic.

Note: llm-exe utilizes the underlying API's from the various providers. This means that you must have an account (and usually an API key) with them if you want to call those models using llm-exe.

**LLM Features:**

- Built-in timeout mechanism for better control when a provider takes too long.
- Automatic retry with configurable back-off for errors.
- Use different LLM's with different configurations for different functions.
- Streaming coming soon.

Note: You can use and call methods on LLM's directly, but they are usually passed to an LLM executor and then called internally.

## Currently Supported Providers

Currently, llm-exe supports calling LLM's from:

- [OpenAi](/llm/openai.html)
- [Anthropic](/llm/anthropic.html)
- [xAI](/llm/xai.html)
- [Google](/llm/gemini.html)
- [AWS Bedrock](/llm/bedrock.html)
- [Ollama](/llm/ollama.html)
- [Deepseek](/llm/deepseek.html)

## Adding Custom LLM's

Coming soon: documentation on how to register a custom LLM.

<!-- If you need to register additional LLM's to be used, you can, once I add documentation. -->
