import { CoreExecutor, createCoreExecutor } from "@/executor";

describe("llm-exe:executor/CoreExecutor behavioral", () => {
  it("executes a sync handler and returns its result", async () => {
    const executor = new CoreExecutor({
      handler: (input: { x: number }) => input.x * 3,
    });
    const result = await executor.execute({ x: 7 });
    expect(result).toBe(21);
  });

  it("executes an async handler and returns its result", async () => {
    const executor = new CoreExecutor({
      handler: async (input: { val: string }) => `processed:${input.val}`,
    });
    const result = await executor.execute({ val: "hello" });
    expect(result).toBe("processed:hello");
  });

  it("propagates handler errors through execute", async () => {
    const executor = new CoreExecutor({
      handler: () => {
        throw new Error("handler boom");
      },
    });
    await expect(executor.execute({})).rejects.toThrow("handler boom");
  });

  it("propagates async handler rejections through execute", async () => {
    const executor = new CoreExecutor({
      handler: async () => {
        throw new Error("async boom");
      },
    });
    await expect(executor.execute({})).rejects.toThrow("async boom");
  });

  it("increments execution count on success", async () => {
    const executor = createCoreExecutor((input: { n: number }) => input.n);
    expect(executor.executions).toBe(0);
    await executor.execute({ n: 1 });
    expect(executor.executions).toBe(1);
    await executor.execute({ n: 2 });
    expect(executor.executions).toBe(2);
  });

  it("increments execution count even on failure", async () => {
    const executor = createCoreExecutor(() => {
      throw new Error("fail");
    });
    expect(executor.executions).toBe(0);
    await expect(executor.execute({})).rejects.toThrow();
    expect(executor.executions).toBe(1);
  });

  it("fires onSuccess and onComplete hooks on success", async () => {
    const onSuccess = jest.fn();
    const onComplete = jest.fn();
    const onError = jest.fn();
    const executor = createCoreExecutor(
      (input: { v: number }) => input.v + 1,
      { hooks: { onSuccess, onComplete, onError } }
    );

    await executor.execute({ v: 5 });

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();

    const successMeta = onSuccess.mock.calls[0][0];
    expect(successMeta.input).toEqual({ v: 5 });
    expect(successMeta.output).toBe(6);
  });

  it("fires onError and onComplete hooks on failure", async () => {
    const onSuccess = jest.fn();
    const onComplete = jest.fn();
    const onError = jest.fn();
    const executor = createCoreExecutor(
      () => {
        throw new Error("test error");
      },
      { hooks: { onSuccess, onComplete, onError } }
    );

    await expect(executor.execute({})).rejects.toThrow("test error");

    expect(onSuccess).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);

    const errorMeta = onError.mock.calls[0][0];
    expect(errorMeta.errorMessage).toBe("test error");
    expect(errorMeta.error).toBeInstanceOf(Error);
  });

  it("metadata includes start/end timestamps", async () => {
    const onComplete = jest.fn();
    const executor = createCoreExecutor(
      () => "done",
      { hooks: { onComplete } }
    );

    await executor.execute({});

    const meta = onComplete.mock.calls[0][0];
    expect(typeof meta.start).toBe("number");
    expect(typeof meta.end).toBe("number");
    expect(meta.end).toBeGreaterThanOrEqual(meta.start);
  });

  it("uses inferred name for anonymous function via fallback", () => {
    const executor = new CoreExecutor({
      handler: () => null,
    });
    expect(typeof executor.name).toBe("string");
    expect(executor.name.length).toBeGreaterThan(0);
  });

  it("uses explicit name when provided", () => {
    const executor = new CoreExecutor({
      handler: () => null,
      name: "my-custom-name",
    });
    expect(executor.name).toBe("my-custom-name");
  });

  it("sets type to function-executor", () => {
    const executor = createCoreExecutor(() => null);
    expect(executor.type).toBe("function-executor");
  });

  it("handler does not share state between calls", async () => {
    let counter = 0;
    const executor = createCoreExecutor(() => ++counter);

    const r1 = await executor.execute({});
    const r2 = await executor.execute({});
    expect(r1).toBe(1);
    expect(r2).toBe(2);
  });

  it("handler returning undefined is handled", async () => {
    const executor = createCoreExecutor(() => undefined);
    const result = await executor.execute({});
    expect(result).toBeUndefined();
  });

  it("handler returning null is handled", async () => {
    const executor = createCoreExecutor(() => null);
    const result = await executor.execute({});
    expect(result).toBeNull();
  });

  it("handler returning complex nested objects preserves structure", async () => {
    const data = {
      nested: { deeply: { value: [1, 2, 3] } },
      arr: [{ a: 1 }, { b: 2 }],
    };
    const executor = createCoreExecutor(() => data);
    const result = await executor.execute({});
    expect(result).toEqual(data);
  });

  it("getMetadata returns correct shape after execution", async () => {
    const executor = createCoreExecutor(
      () => "result",
    );
    executor.withTraceId("trace-xyz");

    await executor.execute({});

    const meta = executor.getMetadata();
    expect(meta.id).toBeDefined();
    expect(meta.type).toBe("function-executor");
    expect(meta.executions).toBe(1);
    expect((meta as any).traceId).toBe("trace-xyz");
    expect(typeof meta.created).toBe("number");
  });
});
