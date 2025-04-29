| Option          | Type    | Default           | Description                                                                      |
| --------------- | ------- | ----------------- | -------------------------------------------------------------------------------- |
| anthropicApiKey | string  | undefined         | API key for Anthropic. Optionally can be set using process.env.ANTHROPIC_API_KEY |
| model           | string  | claude-3-5-sonnet | The model to use. Can be any one of: claude-3-5-sonnet, etc.                     |
| temperature     | number  | 0                 | Maps to temperature. See Anthropic Docs                                          |
| maxTokens       | number  | 500               | Maps to max_tokens. See Anthropic Docs                                           |
| topP            | number  | null              | Maps to top_p. See Anthropic Docs                                                |
| stream          | boolean | null              | Note: Not supported yet.                                                         |
| stop            | ?       | null              | Maps to stop_sequences. See Anthropic Docs                                       |

Anthropic Docs: [link](https://platform.openai.com/docs/api-reference/completions)
