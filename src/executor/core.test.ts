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

  describe("execute()", () => {
    it("executes a synchronous handler and returns the result", async () => {
      const executor = new CoreExecutor<{ x: number }, number>({
        handler: ({ x }) => x * 2,
        name: "doubler",
      });
      const result = await executor.execute({ x: 5 });
      expect(result).toEqual(10);
    });

    it("executes an async handler and awaits the result", async () => {
      const executor = new CoreExecutor<{ x: number }, number>({
        handler: async ({ x }) => {
          return Promise.resolve(x + 1);
        },
        name: "incrementer",
      });
      const result = await executor.execute({ x: 41 });
      expect(result).toEqual(42);
    });

    it("increments executions counter after a successful run", async () => {
      const executor = new CoreExecutor<{ x: number }, number>({
        handler: ({ x }) => x,
        name: "identity",
      });
      expect(executor.executions).toEqual(0);
      await executor.execute({ x: 1 });
      expect(executor.executions).toEqual(1);
      await executor.execute({ x: 2 });
      expect(executor.executions).toEqual(2);
    });

    it("propagates thrown errors from the handler", async () => {
      const executor = new CoreExecutor<{ x: number }, number>({
        handler: () => {
          throw new Error("boom");
        },
        name: "exploder",
      });
      await expect(executor.execute({ x: 0 })).rejects.toThrow("boom");
    });
  });

  describe("hooks", () => {
    it("runs onSuccess hook when handler succeeds", async () => {
      const onSuccess = jest.fn();
      const executor = new CoreExecutor<{ x: number }, number>(
        { handler: ({ x }) => x * 10, name: "tenX" },
        { hooks: { onSuccess: [onSuccess] } }
      );
      await executor.execute({ x: 3 });
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    it("runs onError hook when handler throws", async () => {
      const onError = jest.fn();
      const executor = new CoreExecutor<{ x: number }, number>(
        {
          handler: () => {
            throw new Error("bad");
          },
          name: "fails",
        },
        { hooks: { onError: [onError] } }
      );
      await expect(executor.execute({ x: 0 })).rejects.toThrow("bad");
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("runs onComplete hook regardless of outcome", async () => {
      const onComplete = jest.fn();
      const okExec = new CoreExecutor<{ x: number }, number>(
        { handler: ({ x }) => x, name: "ok" },
        { hooks: { onComplete: [onComplete] } }
      );
      const failExec = new CoreExecutor<{ x: number }, number>(
        {
          handler: () => {
            throw new Error("nope");
          },
          name: "fail",
        },
        { hooks: { onComplete: [onComplete] } }
      );
      await okExec.execute({ x: 1 });
      await expect(failExec.execute({ x: 1 })).rejects.toThrow();
      expect(onComplete).toHaveBeenCalledTimes(2);
    });
  });

  describe("metadata", () => {
    it("getMetadata returns executor metadata with id, name, type", () => {
      const executor = new CoreExecutor({
        handler: () => ({}),
        name: "meta-exec",
      });
      const meta = executor.getMetadata();
      expect(meta).toHaveProperty("id", executor.id);
      expect(meta).toHaveProperty("name", "meta-exec");
      expect(meta).toHaveProperty("type", "function-executor");
      expect(meta).toHaveProperty("created");
    });
  });
});
