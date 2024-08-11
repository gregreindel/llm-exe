# AWS Bedrock

## Setup

### AWS Bedrock Chat
```ts
const llm = useLlm("bedrock:meta.chat.v1", { //
  model: "claude-3-5-sonnet-20240620",

  // optional, see `Authentication` below
  awsRegion: "<Your aws Region>",
  awsSecretKey: "<Your AWS secret key.",
  awsAccessKey: "<Your AWS access key. Starts with AKIxxxx>",

  // rest of options
});
```

#### AWS Bedrock Chat Model Options
- bedrock:meta.chat.v1
 - llama3.5
- bedrock:anthropic.chat.v1
 - llama3.5


## Authentication
To authenticate, you need to provide an Anthropic API Key. You can either provide the API key various ways, depending on your use case. 
- Pass in as execute options using `awsRegion` | `awsSecretKey` | `awsAccessKey`
- Pass in as setup options using `awsRegion` | `awsSecretKey` | `awsAccessKey`

- Use a default key by setting an environment variable of `AWS_REGION` | `AWS_SECRET_ACCESS_KEY` | `AWS_ACCESS_KEY_ID`, respectivly.