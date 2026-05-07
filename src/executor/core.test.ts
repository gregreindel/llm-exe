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

  describe("execution", () => {
    it("execute returns the handler result", async () => {
      const handler = (input: { x: number }) => ({ doubled: input.x * 2 });
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({ x: 5 });
      expect(result).toEqual({ doubled: 10 });
    });

    it("execute works with async handler", async () => {
      const handler = async (input: { name: string }) => {
        return { greeting: `Hello, ${input.name}` };
      };
      const executor = new CoreExecutor({ handler });
      const result = await executor.execute({ name: "World" });
      expect(result).toEqual({ greeting: "Hello, World" });
    });

    it("increments execution count on each call", async () => {
      const handler = () => "done";
      const executor = new CoreExecutor({ handler });
      expect(executor.executions).toBe(0);
      await executor.execute({});
      expect(executor.executions).toBe(1);
      await executor.execute({});
      expect(executor.executions).toBe(2);
    });

    it("propagates errors from handler", async () => {
      const handler = () => {
        throw new Error("handler broke");
      };
      const executor = new CoreExecutor({ handler });
      await expect(executor.execute({})).rejects.toThrow("handler broke");
    });

    it("calls onSuccess and onComplete hooks on success", async () => {
      const onSuccess = jest.fn();
      const onComplete = jest.fn();
      const handler = () => ({ ok: true });
      const executor = new CoreExecutor({ handler }, { hooks: { onSuccess, onComplete } });

      await executor.execute({ key: "val" });

      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ input: { key: "val" }, output: { ok: true } }),
        expect.objectContaining({ name: "handler" })
      );
    });

    it("calls onError and onComplete hooks on failure", async () => {
      const onError = jest.fn();
      const onComplete = jest.fn();
      const handler = () => {
        throw new Error("fail");
      };
      const executor = new CoreExecutor({ handler }, { hooks: { onError, onComplete } });

      await expect(executor.execute({})).rejects.toThrow("fail");

      expect(onError).toHaveBeenCalledTimes(1);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ errorMessage: "fail" }),
        expect.objectContaining({ name: "handler" })
      );
    });

    it("handler receives the raw input object", async () => {
      const handler = jest.fn().mockReturnValue("result");
      const executor = new CoreExecutor({ handler });
      await executor.execute({ a: 1, b: 2 });
      expect(handler).toHaveBeenCalledWith({ a: 1, b: 2 });
    });

    it("sets type to function-executor", () => {
      const executor = new CoreExecutor({ handler: () => {} });
      expect(executor.type).toEqual("function-executor");
    });

    it("falls back to anonymous-core-executor when handler name cannot be inferred", () => {
      const fn = Object.defineProperty(() => {}, "name", { value: "" });
      const executor = new CoreExecutor({ handler: fn });
      expect(executor.name).toEqual("anonymous-core-executor");
    });

    it("accepts options with hooks in constructor", () => {
      const onComplete = jest.fn();
      const executor = new CoreExecutor(
        { handler: () => {} },
        { hooks: { onComplete } }
      );
      expect(executor.hooks.onComplete).toHaveLength(1);
    });
  });
});
