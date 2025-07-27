import { LlmExecutorWithFunctions, LlmExecutorOpenAiFunctions } from "@/executor";
import { useLlm } from "@/llm";
import { createChatPrompt } from "@/prompt";

/**
 * Tests LlmExecutor
 */
describe("llm-exe:executor/LlmExecutor", () => {
  const llm = useLlm("openai.chat-mock.v1", { model: "something" });

  const prompt = createChatPrompt("This is a prompt.");
  it("has basic properties", () => {
    const executor = new LlmExecutorWithFunctions({ llm, prompt });
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
    const executor = new LlmExecutorWithFunctions({ llm, prompt });
    await executor.execute(
      { input: "input-value" },
      { functionCall: "none", functions: [] }
    );
  });
  it("MockExecutor returns correct result from execute", async () => {
    const executor = new LlmExecutorWithFunctions({ llm, prompt });
    await executor.execute(
      { input: "input-value" },
      { functionCall: "auto", functions: [] }
    );
  });
});

describe("llm-exe:executor/LlmExecutorOpenAiFunctions (deprecated)", () => {
  const llm = useLlm("openai.chat-mock.v1", { model: "something" });
  const prompt = createChatPrompt("This is a prompt.");
  
  // Mock console.warn to avoid noise in tests
  const originalWarn = console.warn;
  beforeEach(() => {
    console.warn = jest.fn();
  });
  afterEach(() => {
    console.warn = originalWarn;
  });

  it("creates instance and shows deprecation warning", () => {
    const executor = new LlmExecutorOpenAiFunctions({ llm, prompt });
    expect(executor).toBeDefined();
    expect(console.warn).toHaveBeenCalledWith(
      "LlmExecutorOpenAiFunctions is deprecated. Please migrate to LlmExecutorWithFunctions"
    );
  });

  it("has basic properties", () => {
    const executor = new LlmExecutorOpenAiFunctions({ llm, prompt });
    expect(executor).toHaveProperty("id");
    expect(executor).toHaveProperty("name");
    expect(executor).toHaveProperty("created");
    expect(executor).toHaveProperty("executions");
    expect(executor).toHaveProperty("hooks");
    expect(executor).toHaveProperty("execute");
    expect(typeof executor.execute).toEqual("function");
  });

  it("executes with functionCall none", async () => {
    const executor = new LlmExecutorOpenAiFunctions({ llm, prompt });
    const result = await executor.execute(
      { input: "input-value" },
      { functionCall: "none", functions: [] }
    );
    expect(result).toBeDefined();
  });

  it("executes with functionCall auto", async () => {
    const executor = new LlmExecutorOpenAiFunctions({ llm, prompt });
    const result = await executor.execute(
      { input: "input-value" },
      { functionCall: "auto", functions: [] }
    );
    expect(result).toBeDefined();
  });

  it("uses custom parser when provided", () => {
    const customParser = { parse: jest.fn() };
    const executor = new LlmExecutorOpenAiFunctions({ 
      llm, 
      prompt,
      parser: customParser as any
    });
    expect(executor).toBeDefined();
  });
});
