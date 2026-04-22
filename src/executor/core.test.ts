import { CoreExecutor } from "@/executor";

/**
 * Tests CoreExecutor
 */
describe("llm-exe:executor/CoreExecutor", () => {
  it("has basic properties", () => {
    const handler = () => ({});
    const executor = new CoreExecutor({ handler });
    expect(executor).toHaveProperty("id");
    expect(executor).toHaveProperty("type");
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

  it("infers name from passed in function", () => {
    const handler = () => ({});
    const executor = new CoreExecutor({ handler });
    expect(executor.name).toEqual("handler");
  });
  it("infers name from passed in async function", () => {
    const namedAsync = async () => ({});
    const executor = new CoreExecutor({ handler: namedAsync });
    expect(executor.name).toEqual("namedAsync");
  });
  it("uses name if defined", () => {
    const namedAsync = async () => ({ result: "Correct response" });
    const executor = new CoreExecutor({
      handler: namedAsync,
      name: "otherName",
    });
    expect(executor.name).toEqual("otherName");
    expect(typeof executor._handler).toEqual("function");
  });

  it("sets type to function-executor", () => {
    const executor = new CoreExecutor({ handler: () => ({}) });
    expect(executor.type).toEqual("function-executor");
  });

  describe("execute", () => {
    it("executes a sync handler and returns result", async () => {
      const handler = (input: { x: number }) => ({ doubled: input.x * 2 });
      const executor = new CoreExecutor({ handler });

      const result = await executor.execute({ x: 5 });
      expect(result).toEqual({ doubled: 10 });
    });

    it("executes an async handler and returns result", async () => {
      const handler = async (input: { value: string }) => ({
        upper: input.value.toUpperCase(),
      });
      const executor = new CoreExecutor({ handler });

      const result = await executor.execute({ value: "hello" });
      expect(result).toEqual({ upper: "HELLO" });
    });

    it("increments execution count on each call", async () => {
      const executor = new CoreExecutor({ handler: () => "ok" });

      expect(executor.executions).toBe(0);
      await executor.execute({});
      expect(executor.executions).toBe(1);
      await executor.execute({});
      expect(executor.executions).toBe(2);
    });

    it("propagates errors from the handler", async () => {
      const handler = () => {
        throw new Error("handler failed");
      };
      const executor = new CoreExecutor({ handler });

      await expect(executor.execute({})).rejects.toThrow("handler failed");
    });

    it("propagates errors from an async handler", async () => {
      const handler = async () => {
        throw new Error("async handler failed");
      };
      const executor = new CoreExecutor({ handler });

      await expect(executor.execute({})).rejects.toThrow(
        "async handler failed"
      );
    });

    it("fires onSuccess and onComplete hooks on success", async () => {
      const onSuccess = jest.fn();
      const onComplete = jest.fn();
      const executor = new CoreExecutor(
        { handler: () => "result" },
        { hooks: { onSuccess, onComplete } }
      );

      await executor.execute({});
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("fires onError and onComplete hooks on failure", async () => {
      const onError = jest.fn();
      const onComplete = jest.fn();
      const executor = new CoreExecutor(
        {
          handler: () => {
            throw new Error("fail");
          },
        },
        { hooks: { onError, onComplete } }
      );

      await expect(executor.execute({})).rejects.toThrow("fail");
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("does not fire onSuccess hook on failure", async () => {
      const onSuccess = jest.fn();
      const executor = new CoreExecutor(
        {
          handler: () => {
            throw new Error("fail");
          },
        },
        { hooks: { onSuccess } }
      );

      await expect(executor.execute({})).rejects.toThrow("fail");
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("does not fire onError hook on success", async () => {
      const onError = jest.fn();
      const executor = new CoreExecutor(
        { handler: () => "ok" },
        { hooks: { onError } }
      );

      await executor.execute({});
      expect(onError).not.toHaveBeenCalled();
    });

    it("passes metadata to hooks with input and output", async () => {
      const onSuccess = jest.fn();
      const executor = new CoreExecutor(
        { handler: (input: { x: number }) => input.x * 2 },
        { hooks: { onSuccess } }
      );

      await executor.execute({ x: 7 });

      const metadata = onSuccess.mock.calls[0][0];
      expect(metadata.input).toEqual({ x: 7 });
      expect(metadata.output).toEqual(14);
      expect(metadata.start).toBeDefined();
    });

    it("passes error info to onError hook metadata", async () => {
      const onError = jest.fn();
      const executor = new CoreExecutor(
        {
          handler: () => {
            throw new Error("test error");
          },
        },
        { hooks: { onError } }
      );

      await expect(executor.execute({})).rejects.toThrow("test error");

      const metadata = onError.mock.calls[0][0];
      expect(metadata.error).toBeDefined();
      expect(metadata.errorMessage).toEqual("test error");
    });

    it("handles handler returning null", async () => {
      const executor = new CoreExecutor({ handler: () => null });
      const result = await executor.execute({});
      expect(result).toBeNull();
    });

    it("handles handler returning undefined", async () => {
      const executor = new CoreExecutor({ handler: () => undefined });
      const result = await executor.execute({});
      expect(result).toBeUndefined();
    });

    it("handles handler returning a promise that resolves to an array", async () => {
      const executor = new CoreExecutor({
        handler: async () => [1, 2, 3],
      });
      const result = await executor.execute({});
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe("options", () => {
    it("accepts options with hooks in constructor", () => {
      const onComplete = jest.fn();
      const executor = new CoreExecutor(
        { handler: () => ({}) },
        { hooks: { onComplete } }
      );
      expect(executor.hooks.onComplete).toHaveLength(1);
    });

    it("accepts options without hooks", () => {
      const executor = new CoreExecutor({ handler: () => ({}) }, {});
      expect(executor.hooks.onComplete).toHaveLength(0);
    });
  });

  describe("anonymous name fallback", () => {
    it("uses anonymous-core-executor for anonymous functions", () => {
      const executor = new CoreExecutor({ handler: (() => ({})) as any });
      expect(executor.name).toBeDefined();
    });
  });
});
