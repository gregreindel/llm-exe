// #region file

// #region imports
import {
  createChatPrompt,
  createParser,
  createLlmExecutor,
  useLlm,
} from "llm-exe";
// #endregion imports
// #region inner
// #region prompt
const PROMPT = `You are a senior TypeScript developer. 

Write a concise implementation for the task: "{{spec}}". 

Respond with only the code (no questions or explanation), inside a single ts code block`;
// #endregion prompt

// #region function
export async function writeCodeFromSpec(spec: string) {
  const llm = useLlm("openai.gpt-4o-mini"); // change this if you want
  const prompt = createChatPrompt<{ spec: string }>(PROMPT);
  const parser = createParser("markdownCodeBlock");

  const executor = createLlmExecutor({ llm, prompt, parser });

  return executor.execute({ spec });
}
// #endregion function
// #endregion inner
// #endregion file
