import { CoreExecutor, createCoreExecutor, createLlmExecutor, LlmExecutor } from "@/executor";
import { useLlm } from "@/llm";

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
  const llm = useLlm("openai.chat-mock.v1", { model: "something"});

    const executor = createLlmExecutor({
         llm: llm,
         prompt: createChatPrompt("This is a prompt."),
    });
    expect(executor).toBeInstanceOf(LlmExecutor);
  });
});
