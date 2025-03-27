# AWS Bedrock

## Setup

### AWS Bedrock Chat
```ts
const llm = useLlm("amazon:anthropic.chat.v1", { //
  model: "claude-3-5-sonnet-20240620", // a valid model from bedrock

  // optional, see `Authentication` below
  awsRegion: "<Your aws Region>",
  awsSecretKey: "<Your AWS secret key.",
  awsAccessKey: "<Your AWS access key. Starts with AKIxxxx>",

  // rest of options
});
```

#### AWS Bedrock Chat Model Options
- amazon:meta.chat.v1
- amazon:anthropic.chat.v1



## Authentication
To authenticate, you need to provide a way to authenticate with AWS. You can provide the API key various ways, depending on your use case. 
- Pass in as execute options using `awsRegion` | `awsSecretKey` | `awsAccessKey`
- Pass in as setup options using `awsRegion` | `awsSecretKey` | `awsAccessKey`
- Use a default key by setting an environment variable of `AWS_REGION` | `AWS_SECRET_ACCESS_KEY` | `AWS_ACCESS_KEY_ID`, respectivly.


::: tip
If you are in AWS environment, the above environment variables could be set automatically. 
:::

::: warning
Make sure the respective role has the necessary permissions to access Bedrock.
:::
