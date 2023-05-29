import { CoreExecutor, createCoreExecutor, createLlmExecutor, LlmExecutor } from "@/executor";
import { OpenAIMock } from "@/llm/openai.mock";
import { createChatPrompt } from "@/prompt";

/**
 * Tests CoreExecutor
 */
describe("llm-exe:executor/_functions", () => {
  it("createCoreExecutor", () => {
    const handler = () => ({});
    const executor = createCoreExecutor(handler);
    expect(executor).toBeInstanceOf(CoreExecutor);
  });
  it("createLlmExecutor", () => {
    const executor = createLlmExecutor({
         llm: new OpenAIMock(),
         prompt: createChatPrompt("This is a prompt."),
    });
    expect(executor).toBeInstanceOf(LlmExecutor);
  });
});
