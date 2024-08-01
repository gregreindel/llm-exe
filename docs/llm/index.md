# LLM

LLM is a wrapper around various LLM providers, making your function implementations LLM-agnostic.

**LLM Features:**

- Built-in timeout mechanism for better control when a provider takes too long.
- Automatic retry with configurable back-off for errors.
- Use different LLM's with different configurations for different functions.
- Streaming coming soon.

Note: You can use and call methods on LLM's directly, but they are usually passed to an LLM executor and then called internally.

## BaseLlm
The `BaseLlm` class is a simple wrapper around an LLM client. The class wraps all calls to the LLM client with an error handling retry mechanism, and configurable timeout. Basic usage metrics are persisted within each instance you create.

When using any LLM that extends the `BaseLlm`, the options below are available in addition to any specific options that module define. See [LlmOpenAI LLM](openai).

## Options

| Option        | Type             | Default | Description                                                                               |
| ------------- | ---------------- | ------- | ----------------------------------------------------------------------------------------- |
| timeout       | number           | 30000   | Max execution time of API call to the LLM, in milliseconds.                                                |
| maxDelay      | number           | 5000    | Used for retry back-off. Max time to wait between attempts when timeout has been reached, in milliseconds. |
| numOfAttempts | number           | 0       | Used for retry. How many attempts should be made before throwing error                    |
| jitter        | "none" \| "full" | none    | Used for retry back-off.                                                                  |

## Extending `BaseLlm`

// TODO: elaborate. Until then check the source, it should have comments.
