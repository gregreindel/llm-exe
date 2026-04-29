import { CoreExecutor } from "@/executor";

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
    const handler = () => ({});
    const executor = new CoreExecutor({ handler });
    expect(executor.type).toEqual("function-executor");
  });

  it("executes handler and returns result", async () => {
    const handler = (input: { text: string }) => ({
      result: input.text.toUpperCase(),
    });
    const executor = new CoreExecutor({ handler });
    const result = await executor.execute({ text: "hello" });
    expect(result).toEqual({ result: "HELLO" });
  });

  it("executes async handler and returns result", async () => {
    const handler = async (input: { value: number }) => ({
      doubled: input.value * 2,
    });
    const executor = new CoreExecutor({ handler });
    const result = await executor.execute({ value: 5 });
    expect(result).toEqual({ doubled: 10 });
  });

  it("increments execution count", async () => {
    const handler = () => ({ done: true });
    const executor = new CoreExecutor({ handler });
    expect(executor.executions).toBe(0);

    await executor.execute({});
    expect(executor.executions).toBe(1);

    await executor.execute({});
    expect(executor.executions).toBe(2);
  });

  it("throws when handler throws", async () => {
    const handler = () => {
      throw new Error("handler failed");
    };
    const executor = new CoreExecutor({ handler });
    await expect(executor.execute({})).rejects.toThrow("handler failed");
  });

  it("calls onSuccess hook on successful execution", async () => {
    const onSuccess = jest.fn();
    const handler = () => ({ ok: true });
    const executor = new CoreExecutor({ handler }, { hooks: { onSuccess } });

    await executor.execute({ input: "test" });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ input: { input: "test" } }),
      expect.any(Object)
    );
  });

  it("calls onError hook when handler throws", async () => {
    const onError = jest.fn();
    const handler = () => {
      throw new Error("boom");
    };
    const executor = new CoreExecutor({ handler }, { hooks: { onError } });

    await expect(executor.execute({})).rejects.toThrow("boom");
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it("calls onComplete hook regardless of success or failure", async () => {
    const onComplete = jest.fn();
    const successHandler = () => ({ ok: true });
    const failHandler = () => {
      throw new Error("fail");
    };

    const successExecutor = new CoreExecutor(
      { handler: successHandler },
      { hooks: { onComplete } }
    );
    await successExecutor.execute({});
    expect(onComplete).toHaveBeenCalledTimes(1);

    onComplete.mockClear();

    const failExecutor = new CoreExecutor(
      { handler: failHandler },
      { hooks: { onComplete } }
    );
    await expect(failExecutor.execute({})).rejects.toThrow("fail");
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("uses handler property name when handler is an arrow function", () => {
    const executor = new CoreExecutor({ handler: (() => ({})) as any });
    expect(executor.name).toEqual("handler");
  });
});
