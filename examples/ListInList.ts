import { createLlmExecutor } from "@/executor";
import { BaseLlm } from "@/llm";
import { OpenAIMock } from "@/llm/openai.mock";
import { createParser } from "@/parser";
import { createChatPrompt } from "@/prompt";

const llm = new OpenAIMock({});

const PROMPT = `You are a senior typescript developer. I need you make a concise list of test cases that need to be written for the function below. We need to write an extensive test suite that covers all paths and edge-cases. Do not write any tests yet, we need to plan first.
    
Here is the function:
{{>MarkdownCode language='typescript' code=functionToTest}}`;

const INSTRUCTION = `Don't explain yourself or ask questions. Think step by step through how the function works, then respond with a plain-text list of tests cases we need to write. Do not list more than {{numberOfTestCases}} test cases.
  
For Example:
- <explain a test case we need to write>
- <explain a test case we need to write>`;

export function llmExecutorThatMakesAListOfTestCases(llm: BaseLlm) {
  return createLlmExecutor({
    prompt: createChatPrompt<{
      functionToTest: string;
      numberOfTestCases: number;
    }>(PROMPT).addUserMessage(INSTRUCTION),
    parser: createParser("listToArray"),
    llm,
  });
}

const PROMPT2 = `You are a senior typescript developer. You need to write a single Jest test for the function below.

Here is the function the test needs to be written for:
{{>MarkdownCode language='typescript' code=functionToTest}}`;

const INSTRUCTION2 = `Here is the test you need to write:
{{testRequirement}}
  
Reply only with the test case. Do not explain yourself or ask questions.

For example:
\`\`\`typescript
  it('<a description of what the test covers>', async () => {
  // Your test code here
});
\`\`\``;

export function llmExecutorThatWritesTests(llm: BaseLlm) {
  return createLlmExecutor({
    prompt: createChatPrompt<{
      testRequirement: string;
      functionToTest: string;
    }>(PROMPT2, { allowUnsafeUserTemplate: true }).addUserMessage(INSTRUCTION2),
    parser: createParser("markdownCodeBlock"),
    llm,
  });
}

export async function run() {
  const functionToTest = `function add(a: number, b: number){
        return a + b;
    }`;

  const tests = [];

  const testRequirements = await llmExecutorThatMakesAListOfTestCases(
    llm
  ).execute({
    numberOfTestCases: 5,
    functionToTest,
  });

  for (const testRequirement of testRequirements) {
    const test = await llmExecutorThatWritesTests(llm).execute({
      functionToTest,
      testRequirement,
    });
    if (test?.code) {
      tests.push(test.code);
    }
  }
  return tests;
}

(async () => {
  const answer = await run();
  console.log(answer);
})();