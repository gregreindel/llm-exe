## LLM
LLM is a wrapper around various LLM providers, making your function implementations LLM-agnostic.

**LLM Features**
- Built-in timeout mechanism for better control when a provider takes too long.
- Automatic retry with configurable back-off for errors.
- Use different LLM's with different configurations for different functions.
- Streaming coming soon.

Currently, the only supported LLM is OpenAI, but more can and will be added.

Note: You can use and call methods on LLM's directly, but they are usually passed to an LLM executor and then called internally.

###  BaseLlm
The base LLM class is a simple wrapper around an LLM client. The class wraps all calls to the LLM client with an error handling retry mechanism, and configurable timeout. Basic usage is persisted within each instance you create.

###  Use OpenAi

#### Basic Usage

```typescript:no-line-numbers
const llm = createLlmOpenAi({
  // OpenAIOptions
  openAIApiKey: "your-open-ai-key"
  modelName: "gpt-3.5-turbo",
  maxTokens: 500, // optional.
  temperature: 0, // optional.
});
```
#### Basic Usage with More Options

```typescript:no-line-numbers
const llm = createLlmOpenAi({
  // OpenAIOptions
  openAIApiKey: "your-open-ai-key"
  modelName: "gpt-3.5-turbo",
  maxTokens: 500, // optional.
  temperature: 0, // optional.
    // BaseLlmOptions
  timeout: 30000, // optional
  maxDelay: 5000, // optional.
  numOfAttempts: 5, // optional.
  jitter: "none", // optional
});
```


#### OpenApi LLM Methods
**getMetrics()**
Get the total prompt and completion tokens across all calls to the API. Returns an object with total prompt and completion tokens.

**calculatePrice()**
Calculate the API call cost based on model used and input and output tokens.
@param `input_tokens` - The number of input tokens.
@param `output_tokens` - The number of output tokens (defaults to 0).
@returns An object for input/output tokens and cost.

**logMetrics()**
Log a table containing usage metrics for the OpenAI API.

### Extending `BaseLlm`
// TODO: elaborate. Until then check the source, it should have comments.