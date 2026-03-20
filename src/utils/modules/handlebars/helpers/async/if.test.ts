import { ifFnAsync } from "./if";

function makeOptions(overrides: Partial<{ hash: Record<string, any> }> = {}) {
  return {
    fn: jest.fn((_ctx: any) => "truthy"),
    inverse: jest.fn((_ctx: any) => "falsy"),
    hash: {},
    ...overrides,
  };
}

describe("ifFnAsync", () => {
  it("renders fn block for truthy value", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, true, opts);
    expect(result).toBe("truthy");
    expect(opts.fn).toHaveBeenCalled();
    expect(opts.inverse).not.toHaveBeenCalled();
  });

  it("renders inverse block for falsy value", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, false, opts);
    expect(result).toBe("falsy");
    expect(opts.inverse).toHaveBeenCalled();
    expect(opts.fn).not.toHaveBeenCalled();
  });

  it("renders inverse block for null", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, null, opts);
    expect(result).toBe("falsy");
  });

  it("renders inverse block for undefined", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, undefined, opts);
    expect(result).toBe("falsy");
  });

  it("renders inverse block for empty string", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, "", opts);
    expect(result).toBe("falsy");
  });

  it("renders fn block for non-empty string", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, "hello", opts);
    expect(result).toBe("truthy");
  });

  it("renders inverse block for empty array", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, [], opts);
    expect(result).toBe("falsy");
  });

  it("renders fn block for non-empty array", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, [1], opts);
    expect(result).toBe("truthy");
  });

  it("renders inverse block for zero without includeZero", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, 0, opts);
    expect(result).toBe("falsy");
  });

  it("renders fn block for zero with includeZero", async () => {
    const opts = makeOptions({ hash: { includeZero: true } });
    const result = await ifFnAsync.call({}, 0, opts);
    expect(result).toBe("truthy");
  });

  it("awaits a promise conditional", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, Promise.resolve("yes"), opts);
    expect(result).toBe("truthy");
  });

  it("renders inverse for a promise that resolves falsy", async () => {
    const opts = makeOptions();
    const result = await ifFnAsync.call({}, Promise.resolve(null), opts);
    expect(result).toBe("falsy");
  });

  it("evaluates function conditionals using this context", async () => {
    const opts = makeOptions();
    const context = { value: "hi" };
    const fn = function (this: any) {
      return this.value;
    };
    const result = await ifFnAsync.call(context, fn, opts);
    expect(result).toBe("truthy");
  });

  it("throws when called with wrong number of arguments", async () => {
    // Simulate calling with no arguments (only options)
    // ifFnAsync checks arguments.length !== 2
    await expect(
      (ifFnAsync as any).call({})
    ).rejects.toThrow("#if requires exactly one argument");
  });
});
