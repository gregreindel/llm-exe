import { eachFnAsync } from "./each";

function makeOptions(overrides: Record<string, any> = {}) {
  return {
    fn: jest.fn((item: any, _opts: any) => `[${JSON.stringify(item)}]`),
    inverse: jest.fn(() => "empty"),
    data: undefined as any,
    ids: undefined as any,
    ...overrides,
  };
}

describe("eachFnAsync", () => {
  it("iterates over an array", async () => {
    const opts = makeOptions();
    const result = await eachFnAsync.call({}, ["a", "b", "c"], opts);
    expect(result).toBe('[\"a\"][\"b\"][\"c\"]');
    expect(opts.fn).toHaveBeenCalledTimes(3);
  });

  it("iterates over an object", async () => {
    const opts = makeOptions();
    const result = await eachFnAsync.call({}, { x: 1, y: 2 }, opts);
    expect(result).toBe("[1][2]");
    expect(opts.fn).toHaveBeenCalledTimes(2);
  });

  it("calls inverse for empty array", async () => {
    const opts = makeOptions();
    await eachFnAsync.call({}, [], opts);
    expect(opts.inverse).toHaveBeenCalled();
  });

  it("calls inverse for null", async () => {
    const opts = makeOptions();
    await eachFnAsync.call({}, null, opts);
    expect(opts.inverse).toHaveBeenCalled();
  });

  it("calls inverse for undefined", async () => {
    const opts = makeOptions();
    await eachFnAsync.call({}, undefined, opts);
    expect(opts.inverse).toHaveBeenCalled();
  });

  it("resolves a promise argument before iterating", async () => {
    const opts = makeOptions();
    const result = await eachFnAsync.call(
      {},
      Promise.resolve(["x", "y"]),
      opts
    );
    expect(result).toBe('[\"x\"][\"y\"]');
    expect(opts.fn).toHaveBeenCalledTimes(2);
  });

  it("evaluates a function argument before iterating", async () => {
    const opts = makeOptions();
    const fn = () => [1, 2, 3];
    const result = await eachFnAsync.call({}, fn, opts);
    expect(result).toBe("[1][2][3]");
    expect(opts.fn).toHaveBeenCalledTimes(3);
  });

  it("passes data frame when data is provided", async () => {
    // Note: data is a single mutable object, so we can only reliably check
    // the final state after iteration completes
    const opts = makeOptions({ data: {} });
    await eachFnAsync.call({}, ["a", "b"], opts);

    // fn should have been called for each item
    expect(opts.fn).toHaveBeenCalledTimes(2);
    // Items are passed as first argument
    expect(opts.fn.mock.calls[0][0]).toBe("a");
    expect(opts.fn.mock.calls[1][0]).toBe("b");
    // Each call receives a data property in the second argument
    expect(opts.fn.mock.calls[0][1]).toHaveProperty("data");
    expect(opts.fn.mock.calls[1][1]).toHaveProperty("data");
  });

  it("tracks iteration with single-element array", async () => {
    const opts = makeOptions({ data: {} });
    await eachFnAsync.call({}, ["only"], opts);
    // Single element: first=true and last=true
    // Since data is mutable and only one call, we can check the final state
    const callData = opts.fn.mock.calls[0][1].data;
    expect(callData.key).toBe(0);
    expect(callData.index).toBe(0);
    expect(callData.first).toBe(true);
    expect(callData.last).toBe(true);
  });

  it("sets contextPath when data and ids are provided", async () => {
    const opts = makeOptions({ data: { contextPath: "root" }, ids: ["items"] });
    await eachFnAsync.call({}, ["val"], opts);
    // Single-element, so data reflects the only iteration
    const callData = opts.fn.mock.calls[0][1].data;
    expect(callData.contextPath).toBe("root.items.0");
  });

  it("handles object iteration with correct call count", async () => {
    const opts = makeOptions({ data: {} });
    await eachFnAsync.call({}, { a: 1, b: 2, c: 3 }, opts);
    expect(opts.fn).toHaveBeenCalledTimes(3);
    // Values should be passed as first argument
    expect(opts.fn.mock.calls[0][0]).toBe(1);
    expect(opts.fn.mock.calls[1][0]).toBe(2);
    expect(opts.fn.mock.calls[2][0]).toBe(3);
  });

  it("iterates over an iterable (Symbol.iterator)", async () => {
    const opts = makeOptions();
    const iterable = {
      [Symbol.iterator]: function* () {
        yield "one";
        yield "two";
      },
    };
    const result = await eachFnAsync.call({}, iterable, opts);
    expect(result).toBe('[\"one\"][\"two\"]');
    expect(opts.fn).toHaveBeenCalledTimes(2);
  });

  it("throws when options not provided", async () => {
    await expect(
      (eachFnAsync as any).call({}, ["a"])
    ).rejects.toThrow("Must pass iterator to #each");
  });
});
