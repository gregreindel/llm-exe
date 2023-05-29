import { BaseExecutor } from "@/executor";
import { CoreExecutorHookInput, PlainObject } from "@/interfaces";

/**
 * Tests BaseExecutor
 */
describe("llm-exe:executor/BaseExecutor", () => {
  class MockExecutor<I extends PlainObject, O> extends BaseExecutor<I, O> {
    constructor(name = "mock-executor", type = "mock", hooks: CoreExecutorHookInput = {}) {
      super(name, type, {hooks});
    }

    async handler(_input: I) {
      return { result: "Success" };
    }
  }
  class MockExecutorThatThrows<I extends PlainObject, O> extends BaseExecutor<I, O> {
    constructor(name = "mock-executor", type = "mock", hooks: CoreExecutorHookInput = {}) {
      super(name, type, {hooks});
    }

    async handler(_input: I) {
      throw new Error("Something happened")
    }
  }

  it("MockExecutor has basic properties", () => {
    const executor = new MockExecutor();
    expect(executor).toHaveProperty("id");
    expect(executor).toHaveProperty("name");
    expect(executor).toHaveProperty("created");
    expect(executor).toHaveProperty("executions");
    expect(executor).toHaveProperty("hooks");
  });

  it("MockExecutor has basic properties", async () => {
    const executor = new MockExecutor();
    jest.spyOn(executor, "getHandlerInput");
    jest.spyOn(executor, "getHandlerOutput");
    jest.spyOn(executor, "runHook");

    const input = { input: "input-value" };
    await executor.execute(input);

    expect(executor.runHook).toHaveBeenCalledTimes(1);

    expect(executor.getHandlerInput).toHaveBeenCalledWith({
      input: "input-value",
    },  expect.objectContaining({input}));
    expect(executor.getHandlerOutput).toHaveBeenCalledWith({ result: "Success" }, expect.objectContaining({input}));
  });

  it("MockExecutor returns correct result from execute", async () => {
    const executor = new MockExecutor();
    const response = await executor.execute({ input: "input-value" });
    expect(response).toEqual({ result: "Success" });
  });
  it("MockExecutor can setup hooks", async () => {
    const executor = new MockExecutor("mock-executor", "mock", {
      onComplete(){},
    });
   
    expect(executor.hooks.onComplete).toHaveLength(1);

    executor.setHooks({
      onComplete(){},
    })
    expect(executor.hooks.onComplete).toHaveLength(2);

  });

  it("MockExecutor invalid hooks don't get set", async () => {
    const executor = new MockExecutor("mock-executor", "mock", {
      thisDoesntExist(){} ,
      onComplete: ["not right either"],
    } as any);
   
    expect((executor?.hooks as any)?.thisDoesntExist).toEqual(undefined);
    expect((executor?.hooks as any)?.onComplete).toEqual([]);

    executor.setHooks({
      onComplete(){},
    })
    expect(executor.hooks.onComplete).toHaveLength(1);
  });
  it("MockExecutor invalid hooks don't get set", async () => {
    const executor = new MockExecutorThatThrows("mock-executor", "mock", {
      thisDoesntExist(){} ,
      onComplete: ["not right either"],
    } as any);
    expect(executor.execute({})).rejects.toThrowError("Something happened")
  })
  it("MockExecutor invalid hooks don't get set", async () => {
    const executor = new MockExecutorThatThrows("mock-executor", "mock", {
      thisDoesntExist(){} ,
      onComplete: ["not right either"],
    } as any);

    jest.spyOn(executor, "runHook");
    
    try {
      await executor.execute({})
    } catch (error: any) {
      expect(error.message).toEqual("Something happened")
    } finally {
      expect(executor.runHook).toHaveBeenCalledTimes(2);
      expect(executor.runHook).toHaveBeenNthCalledWith(1, "onError", expect.any(Object));
      expect(executor.runHook).toHaveBeenNthCalledWith(2, "onComplete", expect.any(Object));
    }
  });

  
  it("MockExecutor can filterResult", async () => {
    const executor = new MockExecutor("mock-executor", "mock", {
      filterResult(){
        return { result: "Filtered" } as any
      },
    });
   
    expect(executor.hooks.filterResult).toHaveLength(1);
    const input = { input: "input-value" };
    const result = await executor.execute(input);
    expect(result).toEqual({ result: "Filtered" })

  });

});
