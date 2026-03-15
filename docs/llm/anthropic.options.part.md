| Option          | Type    | Default           | Description                                                                      |
| --------------- | ------- | ----------------- | -------------------------------------------------------------------------------- |
| anthropicApiKey | string  | undefined         | API key for Anthropic. Optionally can be set using process.env.ANTHROPIC_API_KEY |
| model           | string  | —                 | The model to use. Must be specified when using `anthropic.chat.v1`.              |
| temperature     | number  | undefined         | Maps to temperature. See Anthropic Docs                                          |
| maxTokens       | number  | 4096              | Maps to max_tokens. See Anthropic Docs                                           |
| topP            | number  | undefined         | Maps to top_p. See Anthropic Docs                                                |
| topK            | number  | undefined         | Maps to top_k. See Anthropic Docs                                                |
| stopSequences   | array   | undefined         | Maps to stop_sequences. See Anthropic Docs                                       |
| stream          | boolean | undefined         | Note: Not supported yet.                                                         |
| metadata        | object  | undefined         | Maps to metadata. See Anthropic Docs                                             |
| serviceTier     | string  | undefined         | Maps to service_tier. See Anthropic Docs                                         |

Anthropic Docs: [link](https://docs.anthropic.com/en/api/messages)
