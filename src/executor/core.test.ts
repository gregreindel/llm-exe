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
    it("returns the handler result for a sync handler", async () => {
      const handler = (input: { x: number }) => ({ doubled: input.x * 2 });
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({ x: 5 });
      expect(result).toEqual({ doubled: 10 });
    });

    it("returns the handler result for an async handler", async () => {
      const handler = async (input: { msg: string }) => ({ echo: input.msg });
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({ msg: "hello" });
      expect(result).toEqual({ echo: "hello" });
    });

    it("increments execution count on each call", async () => {
      const handler = () => "ok";
      const executor = new CoreExecutor({ handler });
      expect(executor.executions).toBe(0);
      await executor.execute({});
      expect(executor.executions).toBe(1);
      await executor.execute({});
      expect(executor.executions).toBe(2);
    });

    it("fires onSuccess and onComplete hooks on successful execution", async () => {
      const onSuccess = jest.fn();
      const onComplete = jest.fn();
      const handler = () => "result";
      const executor = new CoreExecutor({ handler }, { hooks: { onSuccess, onComplete } });

      await executor.execute({});

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ output: "result" }),
        expect.objectContaining({ name: "handler" })
      );
    });

    it("fires onError and onComplete hooks when handler throws", async () => {
      const onError = jest.fn();
      const onComplete = jest.fn();
      const onSuccess = jest.fn();
      const handler = () => { throw new Error("boom"); };
      const executor = new CoreExecutor({ handler }, { hooks: { onError, onComplete, onSuccess } });

      await expect(executor.execute({})).rejects.toThrow("boom");

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ errorMessage: "boom" }),
        expect.any(Object)
      );
    });

    it("propagates the original error from the handler", async () => {
      const handler = () => { throw new TypeError("type error"); };
      const executor = new CoreExecutor({ handler });

      try {
        await executor.execute({});
        fail("should have thrown");
      } catch (e: any) {
        expect(e).toBeInstanceOf(TypeError);
        expect(e.message).toBe("type error");
      }
    });

    it("sets type to function-executor", () => {
      const executor = new CoreExecutor({ handler: () => {} });
      expect(executor.type).toBe("function-executor");
    });

    it("falls back to anonymous-core-executor when function has no name", () => {
      const fn = (() => {
        const f = function () {};
        Object.defineProperty(f, "name", { value: "" });
        return f;
      })();
      const executor = new CoreExecutor({ handler: fn });
      expect(executor.name).toBe("anonymous-core-executor");
    });

    it("metadata returns an empty object by default", () => {
      const executor = new CoreExecutor({ handler: () => {} });
      expect(executor.metadata()).toEqual({});
    });

    it("getMetadata includes executor identity fields", () => {
      const executor = new CoreExecutor({ handler: () => {}, name: "test-exec" });
      const meta = executor.getMetadata();
      expect(meta.name).toBe("test-exec");
      expect(meta.type).toBe("function-executor");
      expect(meta.id).toBeDefined();
      expect(meta.created).toBeGreaterThan(0);
      expect(meta.executions).toBe(0);
    });
  });
});
