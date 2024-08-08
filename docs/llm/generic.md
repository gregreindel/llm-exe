# Generic

## Options

| Option             | Type              | Default         | Description                                                                                                        |
| ------------------ | ----------------- | --------------- | ------------------------------------------------------------------------------------------------------------------ |
| `openAIApiKey`     | `string`          | `undefined`     | API key for OpenAI. Optionally can be set using process.env.OPEN_AI_API_KEY                                        |
| `model`            | `string`          | `gpt-3.5-turbo` | The model to use. Can be any one of: gpt-4, gpt-3.5-turbo, davinci, text-curie-001, text-babbage-001, text-ada-001 |
| `temperature`      | `number`          | `0`             | See OpenAI Docs                                                                                                    |
| `maxTokens`        | `number`          | `500`           | See OpenAI Docs                                                                                                    |
| `topP`             | `number \| null`  | `null`          | See OpenAI Docs                                                                                                    |
| `n`                | `number \| null`  | `null`          | See OpenAI Docs                                                                                                    |
| `stream`           | `boolean \| null` | `null`          | See OpenAI Docs. Note: Not supported yet.                                                                          |
| `stop`             | ?                 | `null`          | See OpenAI Docs                                                                                                    |
| `presencePenalty`  | `number \| null`  | `null`          | See OpenAI Docs                                                                                                    |
| `frequencyPenalty` | `number \| null`  | `null`          | See OpenAI Docs                                                                                                    |
| `logitBias`        | `object \| null`  | `null`          | See OpenAI Docs                                                                                                    |
| `user`             | `string \| null`  | `null`          | See OpenAI Docs                                                                                                    |

## Generic LLM Methods
