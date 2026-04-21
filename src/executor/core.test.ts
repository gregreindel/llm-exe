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

  it("uses fallback name for anonymous functions", () => {
    const executor = new CoreExecutor({ handler: () => ({}) });
    expect(executor.name).toBeDefined();
    expect(typeof executor.name).toBe("string");
  });

  it("sets type to function-executor", () => {
    const executor = new CoreExecutor({ handler: () => ({}) });
    expect(executor.type).toEqual("function-executor");
  });

  it("executes sync handler and returns result", async () => {
    const executor = new CoreExecutor({
      handler: (input: { value: number }) => ({ doubled: input.value * 2 }),
    });
    const result = await executor.execute({ value: 5 });
    expect(result).toEqual({ doubled: 10 });
  });

  it("executes async handler and returns result", async () => {
    const executor = new CoreExecutor({
      handler: async (input: { value: string }) => ({ upper: input.value.toUpperCase() }),
    });
    const result = await executor.execute({ value: "hello" });
    expect(result).toEqual({ upper: "HELLO" });
  });

  it("increments execution count on each execute", async () => {
    const executor = new CoreExecutor({ handler: () => ({}) });
    expect(executor.executions).toBe(0);
    await executor.execute({});
    expect(executor.executions).toBe(1);
    await executor.execute({});
    expect(executor.executions).toBe(2);
  });

  it("propagates handler errors through execute", async () => {
    const executor = new CoreExecutor({
      handler: () => { throw new Error("handler failed"); },
    });
    await expect(executor.execute({})).rejects.toThrow("handler failed");
  });

  it("increments execution count even when handler throws", async () => {
    const executor = new CoreExecutor({
      handler: () => { throw new Error("boom"); },
    });
    try { await executor.execute({}); } catch {}
    expect(executor.executions).toBe(1);
  });

  it("calls onSuccess hook on successful execution", async () => {
    const onSuccess = jest.fn();
    const executor = new CoreExecutor(
      { handler: () => ({ ok: true }) },
      { hooks: { onSuccess } }
    );
    await executor.execute({});
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("calls onError hook when handler throws", async () => {
    const onError = jest.fn();
    const executor = new CoreExecutor(
      { handler: () => { throw new Error("fail"); } },
      { hooks: { onError } }
    );
    try { await executor.execute({}); } catch {}
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete hook regardless of success or failure", async () => {
    const onComplete = jest.fn();
    const successExecutor = new CoreExecutor(
      { handler: () => ({}) },
      { hooks: { onComplete } }
    );
    await successExecutor.execute({});
    expect(onComplete).toHaveBeenCalledTimes(1);

    const onComplete2 = jest.fn();
    const failExecutor = new CoreExecutor(
      { handler: () => { throw new Error("fail"); } },
      { hooks: { onComplete: onComplete2 } }
    );
    try { await failExecutor.execute({}); } catch {}
    expect(onComplete2).toHaveBeenCalledTimes(1);
  });

  it("getMetadata returns executor metadata", () => {
    const executor = new CoreExecutor({
      handler: () => ({}),
      name: "test-exec",
    });
    const meta = executor.getMetadata();
    expect(meta.name).toBe("test-exec");
    expect(meta.type).toBe("function-executor");
    expect(meta.id).toBeDefined();
    expect(meta.executions).toBe(0);
  });

  it("handler is bound with null context", async () => {
    const executor = new CoreExecutor({
      handler: function() { return { self: this }; },
    });
    const result = await executor.execute({});
    expect(result.self).toBeNull();
  });
});
