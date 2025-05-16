// #region file

// #region imports
import {
  createChatPrompt,
  createParser,
  createLlmExecutor,
  useLlm,
} from "llm-exe";
// #endregion imports

// #region prompt
const PROMPT = `You are an expert TypeScript developer. Write a concise implementation for the task: "{{spec}}". 
Provide only the code (inside one TypeScript code block), no explanation.`;
// #endregion prompt

// #region function
export async function writeCodeFromSpec(spec: string) {
  const llm = useLlm("openai.gpt-4o-mini");
  const prompt = createChatPrompt<{ spec: string }>(PROMPT);
  const parser = createParser("markdownCodeBlock");

  const executor = createLlmExecutor({ llm, prompt, parser });

  return executor.execute({ spec });
}
// #endregion function

// #endregion file
