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

  describe("execute", () => {
    it("invokes the handler and returns its result", async () => {
      const handler = jest.fn((_input: any) => ({ greeting: "hello" }));
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({ name: "world" });
      expect(result).toEqual({ greeting: "hello" });
      expect(handler).toHaveBeenCalledWith({ name: "world" });
    });

    it("handles async handlers", async () => {
      const handler = async (_input: any) => {
        return { doubled: (_input.value as number) * 2 };
      };
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({ value: 21 });
      expect(result).toEqual({ doubled: 42 });
    });

    it("increments the executions counter on each call", async () => {
      const handler = () => ({});
      const executor = new CoreExecutor({ handler });
      expect(executor.executions).toBe(0);
      await executor.execute({});
      expect(executor.executions).toBe(1);
      await executor.execute({});
      expect(executor.executions).toBe(2);
    });

    it("increments the executions counter even when handler throws", async () => {
      const handler = () => { throw new Error("fail"); };
      const executor = new CoreExecutor({ handler });
      expect(executor.executions).toBe(0);
      await expect(executor.execute({})).rejects.toThrow("fail");
      expect(executor.executions).toBe(1);
    });

    it("propagates errors from synchronous handlers", async () => {
      const handler = () => { throw new Error("sync error"); };
      const executor = new CoreExecutor({ handler });
      await expect(executor.execute({})).rejects.toThrow("sync error");
    });

    it("propagates errors from async handlers", async () => {
      const handler = async () => { throw new Error("async error"); };
      const executor = new CoreExecutor({ handler });
      await expect(executor.execute({})).rejects.toThrow("async error");
    });

    it("returns null when handler returns null", async () => {
      const handler = () => null;
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({});
      expect(result).toBeNull();
    });

    it("returns undefined when handler returns undefined", async () => {
      const handler = () => undefined;
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({});
      expect(result).toBeUndefined();
    });

    it("returns primitive values from handler", async () => {
      const stringHandler = () => "hello";
      const numberHandler = () => 42;

      const strExecutor = new CoreExecutor({ handler: stringHandler });
      const numExecutor = new CoreExecutor({ handler: numberHandler });

      expect(await strExecutor.execute({})).toBe("hello");
      expect(await numExecutor.execute({})).toBe(42);
    });

    it("returns arrays from handler", async () => {
      const handler = () => [1, 2, 3];
      const executor = new CoreExecutor({ handler });
      expect(await executor.execute({})).toEqual([1, 2, 3]);
    });

    it("fires onSuccess and onComplete hooks on success", async () => {
      const onSuccess = jest.fn();
      const onComplete = jest.fn();
      const onError = jest.fn();
      const handler = () => ({ ok: true });
      const executor = new CoreExecutor({ handler }, {
        hooks: { onSuccess, onComplete, onError },
      });

      await executor.execute({ input: "test" });

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onError).not.toHaveBeenCalled();
    });

    it("fires onError and onComplete hooks on error", async () => {
      const onSuccess = jest.fn();
      const onComplete = jest.fn();
      const onError = jest.fn();
      const handler = () => { throw new Error("boom"); };
      const executor = new CoreExecutor({ handler }, {
        hooks: { onSuccess, onComplete, onError },
      });

      await expect(executor.execute({})).rejects.toThrow("boom");

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("passes metadata to hooks with correct structure", async () => {
      const onSuccess = jest.fn();
      const handler = (_input: any) => ({ result: _input.x });
      const executor = new CoreExecutor({ handler }, {
        hooks: { onSuccess },
      });

      await executor.execute({ x: 5 });

      const metadata = onSuccess.mock.calls[0][0];
      expect(metadata).toHaveProperty("input", { x: 5 });
      expect(metadata).toHaveProperty("handlerInput");
      expect(metadata).toHaveProperty("handlerOutput");
      expect(metadata).toHaveProperty("output");
      expect(metadata).toHaveProperty("start");
    });

    it("passes error metadata to onError hook", async () => {
      const onError = jest.fn();
      const handler = () => { throw new Error("test error"); };
      const executor = new CoreExecutor({ handler }, {
        hooks: { onError },
      });

      await expect(executor.execute({})).rejects.toThrow("test error");

      const metadata = onError.mock.calls[0][0];
      expect(metadata).toHaveProperty("error");
      expect(metadata).toHaveProperty("errorMessage", "test error");
    });
  });

  describe("type", () => {
    it("has type function-executor", () => {
      const handler = () => ({});
      const executor = new CoreExecutor({ handler });
      expect(executor.type).toBe("function-executor");
    });
  });
});
