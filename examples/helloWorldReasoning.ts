// #region file
import { createPrompt, createParser, createLlmExecutor } from "llm-exe"
import type { BaseLlm } from "llm-exe"

// #region prompt
export const PROMPT = `We are conducting a test, follow the instructions exactly.

Do not ask questions or make conversation.

The user will provide an input, you need to reply only with:

"Hello World, you said <and then insert here what they said>".

So for example, if they say "Hello", you should reply only with: 

Hello World, you said Hello.`;
// #endregion prompt

// #region function
export async function helloWorldReasoning(llm: BaseLlm, input: string) {
  const prompt = createPrompt("chat", PROMPT)

  prompt.addUserMessage(input)

  const parser = createParser("string");

  return createLlmExecutor({
    name: "extract",
    llm,
    prompt,
    parser,
  }).execute({});
}
// #endregion function
// #endregion file
