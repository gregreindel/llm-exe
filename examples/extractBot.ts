// #region file
import { createPrompt, createParser, createLlmExecutor } from "llm-exe";
import type { BaseLlm, IChatMessages } from "llm-exe";
import { JSONSchema } from "json-schema-to-ts";

// #region types
interface ExtractInformationInput {
  chatHistory: IChatMessages;
  mostRecentMessage: string;
}
// #endregion types

// #region prompt
export const PROMPT = `# Instructions: I need you to identify and extract 
the following information from the context and conversation. Reply with only 
this information, formatted as valid JSON. Do not carry on a conversation. 
Make sure you read through the context and work step-by-step to make sure 
you identify accurate information. If you do not know the value, use 
the default value.

Your response must EXACTLY follow the JSON Schema specified below:

{{>JsonSchema key='schema'}}`;

export const INSTRUCT = `Respond with:
{{>JsonSchemaExampleJson key='schema'}}`;
// #endregion prompt

// #region function
export async function extractInformation<
  S extends JSONSchema,
  I extends ExtractInformationInput
>(llm: BaseLlm, input: I, schema: S) {
  const prompt = createPrompt<I>("chat", PROMPT)
    .addChatHistoryPlaceholder("chatHistory")
    .addMessagePlaceholder(`{{mostRecentMessage}}`)
    .addSystemMessage(INSTRUCT);

  const parser = createParser("json", { schema });

  return createLlmExecutor({
    name: "extract",
    llm,
    prompt,
    parser,
  }).execute(Object.assign(input, { schema }));
}
// #endregion function
// #endregion file
