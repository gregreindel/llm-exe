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
    it("executes a synchronous handler and returns the result", async () => {
      const handler = (input: { x: number }) => ({ doubled: input.x * 2 });
      const executor = new CoreExecutor({ handler });

      const result = await executor.execute({ x: 7 });
      expect(result).toEqual({ doubled: 14 });
    });

    it("executes an async handler and returns the result", async () => {
      const handler = async (input: { name: string }) => `Hello, ${input.name}`;
      const executor = new CoreExecutor({ handler });

      const result = await executor.execute({ name: "World" });
      expect(result).toEqual("Hello, World");
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
        throw new Error("handler exploded");
      };
      const executor = new CoreExecutor({ handler });

      await expect(executor.execute({})).rejects.toThrow("handler exploded");
    });

    it("propagates async errors from handler", async () => {
      const handler = async () => {
        throw new Error("async failure");
      };
      const executor = new CoreExecutor({ handler });

      await expect(executor.execute({})).rejects.toThrow("async failure");
    });

    it("fires onSuccess hook on successful execution", async () => {
      const onSuccess = jest.fn();
      const handler = () => "ok";
      const executor = new CoreExecutor({ handler }, { hooks: { onSuccess } });

      await executor.execute({});
      expect(onSuccess).toHaveBeenCalledTimes(1);
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ output: "ok" }),
        expect.objectContaining({ type: "function-executor" })
      );
    });

    it("fires onError hook when handler throws", async () => {
      const onError = jest.fn();
      const handler = () => {
        throw new Error("boom");
      };
      const executor = new CoreExecutor({ handler }, { hooks: { onError } });

      await expect(executor.execute({})).rejects.toThrow("boom");
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ errorMessage: "boom" }),
        expect.any(Object)
      );
    });

    it("fires onComplete hook regardless of success or failure", async () => {
      const onComplete = jest.fn();
      const handler = () => "result";
      const executor = new CoreExecutor({ handler }, { hooks: { onComplete } });

      await executor.execute({});
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("fires onComplete hook even when handler throws", async () => {
      const onComplete = jest.fn();
      const handler = () => {
        throw new Error("fail");
      };
      const executor = new CoreExecutor({ handler }, { hooks: { onComplete } });

      await expect(executor.execute({})).rejects.toThrow("fail");
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it("handler receives the input object", async () => {
      const handler = jest.fn().mockReturnValue("processed");
      const executor = new CoreExecutor({ handler });

      await executor.execute({ key: "value", num: 42 });
      expect(handler).toHaveBeenCalledWith({ key: "value", num: 42 });
    });

    it("returns null/undefined from handler correctly", async () => {
      const nullHandler = () => null;
      const executor = new CoreExecutor({ handler: nullHandler });

      const result = await executor.execute({});
      expect(result).toBeNull();
    });

    it("handles complex return types", async () => {
      const handler = () => ({
        items: [1, 2, 3],
        nested: { deep: true },
        count: 3,
      });
      const executor = new CoreExecutor({ handler });

      const result = await executor.execute({});
      expect(result).toEqual({
        items: [1, 2, 3],
        nested: { deep: true },
        count: 3,
      });
    });

    it("has type function-executor", () => {
      const executor = new CoreExecutor({ handler: () => {} });
      expect(executor.type).toEqual("function-executor");
    });

    it("falls back to inferred name for arrow functions", () => {
      const handler = () => {};
      const executor = new CoreExecutor({ handler });
      expect(executor.name).toEqual("handler");
    });
  });
});
