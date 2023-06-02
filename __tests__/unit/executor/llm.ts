import { LlmExecutor } from "@/executor";
import { OpenAIMock } from "@/llm/openai.mock";
import { createChatPrompt } from "@/prompt";

/**
 * Tests LlmExecutor
 */
describe("llm-exe:executor/LlmExecutor", () => {
    const llm = new OpenAIMock();
    const prompt = createChatPrompt("This is a prompt.");
  it("has basic properties", () => {
    const executor = new LlmExecutor({ llm, prompt });
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

  it("MockExecutor has basic properties", async () => {
    const executor = new LlmExecutor({ llm, prompt });

    jest.spyOn(executor, "getHandlerInput");
    jest.spyOn(executor, "getHandlerOutput");
    // jest.spyOn(executor, "setExecutionMetadata");
    jest.spyOn(executor, "runHook");

    const input = { input: "input-value"}
    await executor.execute(input);

    // expect(executor.setExecutionMetadata).toHaveBeenNthCalledWith(1, "startTime", expect.any(Number));
    // expect(executor.setExecutionMetadata).toHaveBeenNthCalledWith(2, "input", input);
    // expect(executor.setExecutionMetadata).toHaveBeenNthCalledWith(3, "handlerInput", [{"content": "This is a prompt.", "role": "system"}]);
    // expect(executor.setExecutionMetadata).toHaveBeenNthCalledWith(4, "handlerOutput", "Hello world from LLM! The input was [{\"role\":\"system\",\"content\":\"This is a prompt.\"}]");


    expect(executor.runHook).toHaveBeenCalledTimes(1)

    // expect(executor.runHook).toHaveBeenNthCalledWith(1, "beforeExecute");
    // expect(executor.runHook).toHaveBeenNthCalledWith(2, "afterExecute");
    // expect(executor.runHook).toHaveBeenNthCalledWith(3, "onComplete");

    expect(executor.getHandlerInput).toHaveBeenCalledWith({ input: "input-value"}, expect.objectContaining({input}));
    expect(executor.getHandlerOutput).toHaveBeenCalledWith(`Hello world from LLM! The input was [{\"role\":\"system\",\"content\":\"This is a prompt.\"}]`, expect.objectContaining({input}));
  })
  it("MockExecutor returns correct result from execute", async () => {
    const executor = new LlmExecutor({ llm, prompt });
    const response = await executor.execute({ input: "input-value"})
    expect(response).toEqual("Hello world from LLM! The input was [{\"role\":\"system\",\"content\":\"This is a prompt.\"}]");
  })
  it("MockExecutor returns correct result from execute", async () => {
    const promptAsFn = () => createChatPrompt("This is a prompt from a function")
    const executor = new LlmExecutor({ llm, prompt: promptAsFn });
    const response = await executor.execute({ input: "input-value"})
    expect(response).toEqual("Hello world from LLM! The input was [{\"role\":\"system\",\"content\":\"This is a prompt from a function\"}]");
  })
  it("MockExecutor throws error if no prompt", async () => {
    const executor = new LlmExecutor({ llm, prompt: undefined } as any);
    try {
        await executor.execute({ input: "input-value"})
      } catch (e: any) {
        expect(e.message).toEqual('Missing prompt');
      }

  })
  it("MockExecutor returns metadata", async () => {
    const executor = new LlmExecutor({ llm, prompt });

    const initialMetadata = executor.getMetadata()
    expect(typeof initialMetadata).toEqual("object");
    expect(initialMetadata).toHaveProperty("executions");
    expect(initialMetadata).toHaveProperty("name");
    expect(initialMetadata).toHaveProperty("id");

    expect(initialMetadata).toHaveProperty("llm");
    expect((initialMetadata as any).llm).toHaveProperty("promptType");

    expect(executor.getMetadata().executions).toEqual(0);
    await executor.execute({ input: "input-value"})
    expect(executor.getMetadata().executions).toEqual(1);

    expect(executor.getMetadata().id).toEqual(initialMetadata.id);
  })

  it("MockExecutor metadata returns persists after executions", async () => {
    const executor = new LlmExecutor({ llm, prompt });
    const initialMetadata = executor.getMetadata()

    expect(executor.getMetadata().executions).toEqual(0);
    await executor.execute({ input: "input-value"})
    expect(executor.getMetadata().executions).toEqual(1);
    
    expect(executor.getMetadata().id).toEqual(initialMetadata.id);
    expect(executor.getMetadata().created).toEqual(initialMetadata.created);
    expect(executor.getMetadata().name).toEqual(initialMetadata.name);

    await executor.execute({ input: "input-value"})
    expect(executor.getMetadata().executions).toEqual(2);
    
    expect(executor.getMetadata().id).toEqual(initialMetadata.id);
    expect(executor.getMetadata().created).toEqual(initialMetadata.created);
    expect(executor.getMetadata().name).toEqual(initialMetadata.name);

    await executor.execute({ input: "input-value"})
    expect(executor.getMetadata().executions).toEqual(3);
    
    expect(executor.getMetadata().id).toEqual(initialMetadata.id);
    expect(executor.getMetadata().created).toEqual(initialMetadata.created);
    expect(executor.getMetadata().name).toEqual(initialMetadata.name);
  })

  it("MockExecutor getHandlerOutput gets correct inputs", async () => {
    const executor = new LlmExecutor({ llm, prompt });

    jest.spyOn(executor, "getHandlerOutput");
    const input = { input: "input-value"}
    await executor.execute(input);
    // expect(executor.getHandlerOutput).
    const response = `Hello world from LLM! The input was [{\"role\":\"system\",\"content\":\"This is a prompt.\"}]`
    expect(executor.getHandlerOutput).toHaveBeenCalledWith(response, expect.objectContaining({input}));

  })
  

});