import {
  createChatPrompt,
  createParser,
  createLlmExecutor,
  useLlm,
} from "llm-exe";
import type { BaseLlm } from "llm-exe";

const llm = useLlm("openai.chat-mock.v1", { model: "something" });

// #region StepOne
const PROMPT = `You are a senior typescript developer. I need you make 
a concise list of test cases that need to be written for the function below. 
We need to write an extensive test suite that covers all paths and edge-cases. 
Do not write any tests yet, we need to plan first.
    
Here is the function:
{{>MarkdownCode language='typescript' code=functionToTest}}`;

const INSTRUCTION = `Don't explain yourself or ask questions. Think step 
by step through how the function works, then respond with a plain-text 
list of tests cases we need to write.

Do not list more than {{numberOfTestCases}} test cases.
  
For Example:
- <explain a test case we need to write>
- <explain a test case we need to write>`;

export function llmExecutorThatMakesAListOfTestCases<T extends {
  functionToTest: string;
  numberOfTestCases: number;
}>(llm: BaseLlm, input: T) {
  return createLlmExecutor({
    prompt: createChatPrompt<T>(PROMPT).addUserMessage(INSTRUCTION),
    parser: createParser("listToArray"),
    llm,
  }).execute(input)
}
// #endregion StepOne

// #region StepTwo
const PROMPT2 = `You are a senior typescript developer. You need to write 
a single Jest test for the function below.

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

export function llmExecutorThatWritesTests<T extends {
  testRequirement: string;
  functionToTest: string;
}>(llm: BaseLlm, input: T) {

  const prompt = createChatPrompt<T>(PROMPT2, { allowUnsafeUserTemplate: true })
  .addUserMessage(INSTRUCTION2);

  const parser = createParser("markdownCodeBlock");

  return createLlmExecutor({
    prompt,
    parser,
    llm,
  }).execute(input)
}
// #endregion StepTwo

// #region StepThree
export async function generateTestSuite(functionToTest: string) {
  const tests = [];

  const requirements = await llmExecutorThatMakesAListOfTestCases(
    llm, {
    numberOfTestCases: 5,
    functionToTest,
  });

  for (const testRequirement of requirements) {
    const test = await llmExecutorThatWritesTests(llm, {
      functionToTest,
      testRequirement,
    });
    if (test?.code) {
      tests.push(test.code);
    }
  }
  return { requirements, tests};
}
// #endregion StepThree


(async () => {
  const functionToTest = `function add(a: number, b: number){
    return a + b;
}`;

  const results = await generateTestSuite(functionToTest);
  console.log(results);
})();