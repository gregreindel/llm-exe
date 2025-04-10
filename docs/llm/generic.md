# Generic Options

llm-exe attempts to normalize the inputs for various llm vendors, providing a single interface that can be used to interact with different models. While this is not always possible, since certain vendors may implement seatures that others don't support, either way only the allowed options make it to the respective api calls.

## Options

| Option        | Type             | Default | Description                                                                                                |
| ------------- | ---------------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| timeout       | number           | 30000   | Max execution time of API call to the LLM, in milliseconds.                                                |
| maxDelay      | number           | 5000    | Used for retry back-off. Max time to wait between attempts when timeout has been reached, in milliseconds. |
| numOfAttempts | number           | 0       | Used for retry. How many attempts should be made before throwing error                                     |
| jitter        | "none" \| "full" | none    | Used for retry back-off.                                                                                   |
| temperature   | number           | 0       | Used by model.                                                                                             |
| maxTokens     | number           | 500     | Used by model.                                                                                             |
| stream        | boolean \| null  | null    | Note: Not supported 

> [!NOTE]
> Different vendors will allow (and may require) additional options.
> - [OpenAi Chat Model Options](/llm/openai#openai-specific-options).
> - [Anthropic Chat Model Options](/llm/anthropic#anthropic-specific-options).
> - [Bedrock Chat Model Options](/llm/bedrock/index.html).

<!-- 
| Option           | Type            | Default       | Description                                                                                                                             |
| ---------------- | --------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| openAIApiKey     | string          | undefined     | API key for OpenAI. Optionally can be set using process.env.OPENAI_API_KEY                                                             |
| model            | string          | gpt-3.5-turbo | The model to use. Can be any one of: gpt-4o, gpt-4o-mini, gpt-4, gpt-3.5-turbo, davinci, text-curie-001, text-babbage-001, text-ada-001 |
| temperature      | number          | 0             | See OpenAI Docs                                                                                                                         |
| maxTokens        | number          | 500           | See OpenAI Docs                                                                                                                         |
| topP             | number \| null  | null          | See OpenAI Docs                                                                                                                         |
| n                | number \| null  | null          | See OpenAI Docs                                                                                                                         |
| stream           | boolean \| null | null          | See OpenAI Docs. Note: Not supported yet.                                                                                               |
| stop             | ?               | null          | See OpenAI Docs                                                                                                                         |
| presencePenalty  | number \| null  | null          | See OpenAI Docs                                                                                                                         |
| frequencyPenalty | number \| null  | null          | See OpenAI Docs                                                                                                                         |
| logitBias        | object \| null  | null          | See OpenAI Docs                                                                                                                         |
| user             | string \| null  | null          | See OpenAI Docs                                                                                                                         | -->
