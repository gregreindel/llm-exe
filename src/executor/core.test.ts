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
      const result = await executor.execute({ x: 7 });
      expect(result).toEqual({ doubled: 14 });
    });

    it("returns the handler result for an async handler", async () => {
      const handler = async (input: { value: string }) => ({
        upper: input.value.toUpperCase(),
      });
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({ value: "hello" });
      expect(result).toEqual({ upper: "HELLO" });
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

    it("propagates handler errors", async () => {
      const handler = () => {
        throw new Error("handler broke");
      };
      const executor = new CoreExecutor({ handler });
      await expect(executor.execute({})).rejects.toThrow("handler broke");
    });

    it("fires onSuccess and onComplete hooks on success", async () => {
      const onSuccess = jest.fn();
      const onComplete = jest.fn();
      const handler = () => "result";
      const executor = new CoreExecutor(
        { handler },
        { hooks: { onSuccess, onComplete } }
      );
      await executor.execute({});
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("fires onError and onComplete hooks on error", async () => {
      const onError = jest.fn();
      const onComplete = jest.fn();
      const handler = () => {
        throw new Error("fail");
      };
      const executor = new CoreExecutor(
        { handler },
        { hooks: { onError, onComplete } }
      );
      await expect(executor.execute({})).rejects.toThrow("fail");
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("does not fire onSuccess when handler throws", async () => {
      const onSuccess = jest.fn();
      const handler = () => {
        throw new Error("oops");
      };
      const executor = new CoreExecutor(
        { handler },
        { hooks: { onSuccess } }
      );
      await expect(executor.execute({})).rejects.toThrow("oops");
      expect(onSuccess).not.toHaveBeenCalled();
    });

    it("does not fire onError when handler succeeds", async () => {
      const onError = jest.fn();
      const handler = () => "ok";
      const executor = new CoreExecutor(
        { handler },
        { hooks: { onError } }
      );
      await executor.execute({});
      expect(onError).not.toHaveBeenCalled();
    });

    it("passes metadata with input to onSuccess hook", async () => {
      const onSuccess = jest.fn();
      const handler = (input: { name: string }) => `hi ${input.name}`;
      const executor = new CoreExecutor(
        { handler },
        { hooks: { onSuccess } }
      );
      await executor.execute({ name: "test" });
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ input: { name: "test" }, output: "hi test" }),
        expect.any(Object)
      );
    });

    it("passes metadata with error to onError hook", async () => {
      const onError = jest.fn();
      const handlerError = new Error("bad input");
      const handler = () => {
        throw handlerError;
      };
      const executor = new CoreExecutor(
        { handler },
        { hooks: { onError } }
      );
      await expect(executor.execute({})).rejects.toThrow("bad input");
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({
          error: handlerError,
          errorMessage: "bad input",
        }),
        expect.any(Object)
      );
    });

    it("handles handler returning undefined", async () => {
      const handler = () => undefined;
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({});
      expect(result).toBeUndefined();
    });

    it("handles handler returning null", async () => {
      const handler = () => null;
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({});
      expect(result).toBeNull();
    });
  });

  describe("type and metadata", () => {
    it("sets type to function-executor", () => {
      const executor = new CoreExecutor({ handler: () => ({}) });
      expect(executor.type).toBe("function-executor");
    });

    it("getMetadata includes execution count", async () => {
      const executor = new CoreExecutor({ handler: () => "ok" });
      await executor.execute({});
      await executor.execute({});
      const meta = executor.getMetadata();
      expect(meta.executions).toBe(2);
      expect(meta.type).toBe("function-executor");
    });
  });
});
