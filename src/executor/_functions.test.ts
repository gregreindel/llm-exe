import { CoreExecutor, createCoreExecutor, createLlmExecutor, LlmExecutor, LlmExecutorWithFunctions, createLlmFunctionExecutor } from "@/executor";
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

  it("createLlmFunctionExecutor", () => {
    const llm = useLlm("openai.chat-mock.v1", { model: "something"});
    const prompt = createChatPrompt("This is a prompt.");

    const executor = createLlmFunctionExecutor({
         llm: llm,
         prompt: prompt,
    });
    expect(executor).toBeInstanceOf(LlmExecutorWithFunctions);
    expect(executor).toBeInstanceOf(LlmExecutor);
  });

  it("createLlmFunctionExecutor with parser and options", () => {
    const llm = useLlm("openai.chat-mock.v1", { model: "something"});
    const prompt = createChatPrompt("This is a prompt.");
    const parser = { parse: jest.fn() };
    const options = { 
      hooks: {
        onComplete: jest.fn()
      }
    };

    const executor = createLlmFunctionExecutor({
         llm: llm,
         prompt: prompt,
         parser: parser as any,
    }, options);
    
    expect(executor).toBeInstanceOf(LlmExecutorWithFunctions);
    expect(executor.hooks.onComplete).toEqual([options.hooks.onComplete]);
  });
});
