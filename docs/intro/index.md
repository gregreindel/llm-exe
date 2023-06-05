# Introduction

when writing llm-based functions, you'll end up repeating a lot of code, and will end up needing some structure. A prompt may seem simple, but as your instructions grow, you may end up needing to add some more advanced abstractions. Likewise, if you're calling an llm if various functions in your code, you'll end up writing some wrapper around the llm so that you can share some functionality. like logging, collecting metrics, handling failures/timeouts/retry. Furthermore, the LLM will be returning a string that you may need to validate or parse into a usable data type. Will you be duplicating code? Or creating sharable output parsers.

This package aims to be those lightweight abstractions.

Take the example below. In the first block, there is a function that takes an input, and responds yes or no

##  Example: A llm-powered function - Yes/No bot.
:x: This example does not use llm-exe

This example uses the OpenAi nodejs package directly. Its likely where you'd start. It works, but as I'll explain below, its more of a proof of concept.
```typescript
const { Configuration, OpenAIApi } = require("openai");

const openAiClient = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
);

export async function YesOrNoBot(
  question: string
): Promise<{ response: string }> {
  const model = "gpt-3.5-turbo";

  const messages = [
    {
      role: "system",
      content: `You are not an assistant, I need you to reply with only 
  'yes' or 'no' as an answer to the question below. Do not explain yourself 
  or ask questions. Answer with only yes or no.`;,
    },
    {
      role: "user",
      content: question,
    },
    {
      role: "system",
      content: `yes or no:`,
    },
  ];

  const response = await openAiClient.createChatCompletion({
    model: model,
    messages,
    temperature: 0,
    max_tokens: 160,
  });

  const { data } = response;
  const [choice] = data.choices;
  const { message, finish_reason } = choice;
  const { content = "" } = message;
  if (finish_reason !== "stop") {
    console.log("error finish reason");
  }
  let cleanResponse = content.trim();
  return { response: cleanResponse };
}
```

##  Example: A llm-powered function (with llm-exe) - Yes/No bot.
:white_check_mark: This example does use llm-exe!

This example uses llm-exe to accomplish the same task.
```typescript
export async function YesOrNoBot<I extends string>(
  body: I
): Promise<{ response: string }> {
  const llm = new OpenAI({
    modelName: "gpt-3.5-turbo",
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const PROMPT = `You are not an assistant, I need you to reply with only 
  'yes' or 'no' as an answer to the question below. Do not explain yourself 
  or ask questions. Answer with only yes or no.`;

  const prompt = createChatPrompt<I>(PROMPT)
    .addUserMessage(body)
    .addSystemMessage(`yes or no:`);

  const parser = createParser("stringExtract", { enum: ["yes", "no"]});
  return createLlmExecutor({ llm, prompt, parser }).execute({
    body,
  });
}
```

To highlight the main differences:
- How do we test this?