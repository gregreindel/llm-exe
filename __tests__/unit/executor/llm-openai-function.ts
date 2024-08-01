import { LlmExecutorOpenAiFunctions } from "@/executor";
import { useLlm } from "@/llm";
import { createChatPrompt } from "@/prompt";

/**
 * Tests LlmExecutor
 */
describe("llm-exe:executor/LlmExecutor", () => {
  const llm = useLlm("openai.chat-mock.v1", { model: "something"});

    const prompt = createChatPrompt("This is a prompt.");
  it("has basic properties", () => {
    const executor = new LlmExecutorOpenAiFunctions({ llm, prompt });
    expect(executor).toHaveProperty("id");
    expect(executor).toHaveProperty("name");
    expect(executor).toHaveProperty("created");
    expect(executor).toHaveProperty("executions");
    expect(executor).toHaveProperty("hooks");

    expect(executor).toHaveProperty("execute");
    expect(typeof executor.execute).toEqual("function");

    expect(executor).toHaveProperty("getHandlerInput");
    expect(typeof executor.getHandlerInput).toEqual("function");

    expect(executor).toHaveProperty("getHandlerOutput");
    expect(typeof executor.getHandlerOutput).toEqual("function");

    expect(executor).toHaveProperty("metadata");
    expect(typeof executor.metadata).toEqual("function");

    expect(executor).toHaveProperty("getMetadata");
    expect(typeof executor.getMetadata).toEqual("function");


    expect(executor).toHaveProperty("runHook");
    expect(typeof executor.runHook).toEqual("function");

    expect(executor).toHaveProperty("setHooks");
    expect(typeof executor.setHooks).toEqual("function");
  });

  it("MockExecutor returns correct result from execute", async () => {
    const executor = new LlmExecutorOpenAiFunctions({ llm, prompt });
    await executor.execute({ input: "input-value"}, { function_call: "none", functions: []})
  })
  it("MockExecutor returns correct result from execute", async () => {
    const executor = new LlmExecutorOpenAiFunctions({ llm, prompt });
    await executor.execute({ input: "input-value"}, { function_call: "auto", functions: []})
  })
});
