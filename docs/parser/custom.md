# Custom Parser
You can define a custom parser to have full control over transforming the LLM output into the format you expect.

A custom parser is really just a function that is provided 2 arguments, and is expected to transform/modify before returning the result. 

When using Typescript, as long as you type things well, the types will get inferred into your LLM executors.

## Defining a custom parser
```ts
function customParserHandler(
  /* input is the response from the LLM */
  input: string,
  /* values is input that gets provided to execute() */
  values: Record<string, any>
){
  const output = "";
  /**
   * parse the input string, 
   * return what you'd like
   */
  return output
};

export const customParser = createCustomParser(
  "customParser", // a name
  customParserHandler // the parser function
);
```

## Using a custom parser
```ts
import { customParser } from "the-example-above"

// the .parse method on a custom parser is the function you assigned.
const parse = customParser.parse(``)

// or in an LLM executor
const executor = createLlmExecutor({
  llm: useLlm("openai", { model: "model-name"}),
  prompt: createChatPrompt(`You are a customer support agent.`),
  parser: customParser // use the custom parser
})

```

## Extending `BaseParser`
TODO: Add more info. In meantime, check code, it should have comments.