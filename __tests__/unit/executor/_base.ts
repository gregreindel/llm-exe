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
    const executor = new MockExecutor("mock-executor", "mock");
    executor.setHooks(undefined)
    expect(typeof executor.hooks.onComplete).toEqual("object");
    expect(Array.isArray(executor.hooks.onComplete)).toEqual(true);
    expect(typeof executor.hooks.onError).toEqual("object");
    expect(Array.isArray(executor.hooks.onError)).toEqual(true);

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
  it("MockExecutor can removeHooks", async () => {
    const hooks = {
      onComplete(){},
    }
   const executor = new MockExecutor("mock-executor", "mock", hooks);
   expect(executor.hooks.onComplete).toHaveLength(1);
   executor.removeHook("onComplete", hooks["onComplete"])
   expect(executor.hooks.onComplete).toHaveLength(0);
  });

  it("MockExecutor can removeHooks with invalid hook", async () => {
    const hooks = {
      onComplete(){},
    }
   const executor = new MockExecutor("mock-executor", "mock", hooks);
   expect(executor.hooks.onComplete).toHaveLength(1);
   expect(executor.removeHook("onComplete", hooks["onComplete"].toString() as any)).toBeInstanceOf(MockExecutor)
   expect(executor.hooks.onComplete).toHaveLength(1);
  });
  it("MockExecutor can removeHooks with invalid hook name", async () => {
    const hooks = {
      onComplete(){},
    }
   const executor = new MockExecutor("mock-executor", "mock", hooks);
   expect(executor.hooks.onComplete).toHaveLength(1);
   expect(executor.removeHook("whatIsThisAnyway" as any, hooks["onComplete"])).toBeInstanceOf(MockExecutor)
   expect(executor.hooks.onComplete).toHaveLength(1);
  });


  it("MockExecutor can with off", async () => {
    const hooks = {
      onComplete(){},
    }
   const executor = new MockExecutor("mock-executor", "mock", hooks);
   expect(executor.hooks.onComplete).toHaveLength(1);
   executor.off("onComplete", hooks["onComplete"])
   expect(executor.hooks.onComplete).toHaveLength(0);
  });

  it("MockExecutor can with once", async () => {
    const hooks = {
      onComplete(){},
    }
   const executor = new MockExecutor("mock-executor", "mock");
   expect(executor.hooks.onComplete).toHaveLength(0);
   executor.once("onComplete", hooks["onComplete"]);
   expect(executor.hooks.onComplete).toHaveLength(1);
    await executor.execute({});
   expect(executor.hooks.onComplete).toHaveLength(0);
  });
  it("MockExecutor can with once handles non-function", async () => {
    const hooks = {
      onComplete: ["invalid input"],
    } as any
   const executor = new MockExecutor("mock-executor", "mock");
   expect(executor.hooks.onComplete).toHaveLength(0);
   expect(executor.once("onComplete", hooks["onComplete"])).toBeInstanceOf(MockExecutor)
   expect(executor.hooks.onComplete).toHaveLength(0);
  });

  it("MockExecutor can with on", async () => {
    const hooks = {
      onComplete(){},
    }
   const executor = new MockExecutor("mock-executor", "mock");
   expect(executor.hooks.onComplete).toHaveLength(0);
   executor.on("onComplete", hooks["onComplete"]);
   expect(executor.hooks.onComplete).toHaveLength(1);
    await executor.execute({});
   expect(executor.hooks.onComplete).toHaveLength(1);
  });
});
