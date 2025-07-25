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

    expect(executor.runHook).toHaveBeenCalledTimes(2);

    expect(executor.getHandlerInput).toHaveBeenCalledWith({
      input: "input-value",
    },  expect.objectContaining({input}), undefined);
    expect(executor.getHandlerOutput).toHaveBeenCalledWith({ result: "Success" }, expect.objectContaining({input}), undefined);
  });

  it("MockExecutor returns correct result from execute", async () => {
    const executor = new MockExecutor();
    const response = await executor.execute({ input: "input-value" });
    expect(response).toEqual({ result: "Success" });
  });
  it("MockExecutor can setup hooks", async () => {
    const executor = new MockExecutor("mock-executor", "mock", {
      onComplete(){ console.log("fn1") },
    });
   
    expect(executor.hooks.onComplete).toHaveLength(1);

    executor.setHooks({
      onComplete(){ console.log("fn2") },
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

  it("MockLlm can use withTraceId", () => {
    const executor = new MockExecutor();
    executor.withTraceId("1234")
    expect(executor.getTraceId()).toEqual("1234");
  });

  describe("Hook Memory Management", () => {
    it("should enforce maximum hooks per event", () => {
      const executor = new MockExecutor();
      
      // Add hooks up to the limit
      for (let i = 0; i < executor.maxHooksPerEvent; i++) {
        executor.on("onComplete", () => {});
      }
      
      expect(executor.getHookCount("onComplete")).toBe(executor.maxHooksPerEvent);
      
      // Try to add one more hook - should throw
      expect(() => {
        executor.on("onComplete", () => {});
      }).toThrow(`Maximum number of hooks (${executor.maxHooksPerEvent}) reached for event "onComplete"`);
    });

    it("should enforce maximum hooks for once method", () => {
      const executor = new MockExecutor();
      
      // Add hooks up to the limit
      for (let i = 0; i < executor.maxHooksPerEvent; i++) {
        executor.once("onSuccess", () => {});
      }
      
      // Try to add one more hook - should throw
      expect(() => {
        executor.once("onSuccess", () => {});
      }).toThrow(`Maximum number of hooks (${executor.maxHooksPerEvent}) reached for event "onSuccess"`);
    });

    it("should clear hooks for specific event", () => {
      const executor = new MockExecutor();
      const hook1 = () => {};
      const hook2 = () => {};
      
      executor.on("onComplete", hook1);
      executor.on("onSuccess", hook2);
      
      expect(executor.getHookCount("onComplete")).toBe(1);
      expect(executor.getHookCount("onSuccess")).toBe(1);
      
      executor.clearHooks("onComplete");
      
      expect(executor.getHookCount("onComplete")).toBe(0);
      expect(executor.getHookCount("onSuccess")).toBe(1);
    });

    it("should clear all hooks when no event specified", () => {
      const executor = new MockExecutor();
      
      executor.on("onComplete", () => {});
      executor.on("onSuccess", () => {});
      executor.on("onError", () => {});
      
      const counts = executor.getHookCount() as Record<string, number>;
      expect(counts.onComplete).toBe(1);
      expect(counts.onSuccess).toBe(1);
      expect(counts.onError).toBe(1);
      
      executor.clearHooks();
      
      const clearedCounts = executor.getHookCount() as Record<string, number>;
      expect(clearedCounts.onComplete).toBe(0);
      expect(clearedCounts.onSuccess).toBe(0);
      expect(clearedCounts.onError).toBe(0);
    });

    it("should return correct hook counts", () => {
      const executor = new MockExecutor();
      
      executor.on("onComplete", () => {});
      executor.on("onComplete", () => {});
      executor.on("onSuccess", () => {});
      
      expect(executor.getHookCount("onComplete")).toBe(2);
      expect(executor.getHookCount("onSuccess")).toBe(1);
      expect(executor.getHookCount("onError")).toBe(0);
      
      const allCounts = executor.getHookCount() as Record<string, number>;
      expect(allCounts).toEqual({
        onComplete: 2,
        onSuccess: 1,
        onError: 0
      });
    });

    it("should handle clearing non-existent event gracefully", () => {
      const executor = new MockExecutor();
      
      // Should not throw
      expect(() => {
        executor.clearHooks("nonExistentEvent" as any);
      }).not.toThrow();
    });

    it("should not count duplicate hooks towards limit", () => {
      const executor = new MockExecutor();
      const hook = () => {};
      
      // Add the same hook multiple times
      for (let i = 0; i < 10; i++) {
        executor.on("onComplete", hook);
      }
      
      // Should only count as 1 hook
      expect(executor.getHookCount("onComplete")).toBe(1);
    });

    it("should allow adding hooks after clearing", async () => {
      const executor = new MockExecutor();
      const results: string[] = [];
      
      // Fill up to limit
      for (let i = 0; i < executor.maxHooksPerEvent; i++) {
        executor.on("onComplete", () => results.push(`hook${i}`));
      }
      
      // Clear and add new hooks
      executor.clearHooks("onComplete");
      executor.on("onComplete", () => results.push("new hook"));
      
      await executor.execute({});
      
      expect(results).toContain("new hook");
      expect(results.filter(r => r === "new hook")).toHaveLength(1);
    });

    it("should properly handle once wrapper removal", async () => {
      const executor = new MockExecutor();
      let callCount = 0;
      
      executor.once("onComplete", () => callCount++);
      
      expect(executor.getHookCount("onComplete")).toBe(1);
      
      await executor.execute({});
      expect(callCount).toBe(1);
      expect(executor.getHookCount("onComplete")).toBe(0);
      
      await executor.execute({});
      expect(callCount).toBe(1); // Should not increment again
    });
  });

});
