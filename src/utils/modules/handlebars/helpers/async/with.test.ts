import { withFnAsync } from "./with";

function makeOptions(overrides: Record<string, any> = {}) {
  return {
    fn: jest.fn((_ctx: any) => `with:${JSON.stringify(_ctx)}`),
    inverse: jest.fn((_ctx: any) => "inverse"),
    data: undefined as any,
    ids: undefined as any,
    ...overrides,
  };
}

describe("withFnAsync", () => {
  it("renders fn block with the provided context", async () => {
    const opts = makeOptions();
    const result = await withFnAsync.call({}, { name: "test" }, opts);
    expect(result).toBe('with:{"name":"test"}');
    expect(opts.fn).toHaveBeenCalledWith(
      { name: "test" },
      expect.objectContaining({})
    );
  });

  it("renders inverse block when context is empty", async () => {
    const opts = makeOptions();
    const result = await withFnAsync.call({}, null, opts);
    expect(result).toBe("inverse");
    expect(opts.inverse).toHaveBeenCalled();
  });

  it("renders inverse block when context is undefined", async () => {
    const opts = makeOptions();
    const result = await withFnAsync.call({}, undefined, opts);
    expect(result).toBe("inverse");
  });

  it("renders inverse block when context is empty string", async () => {
    const opts = makeOptions();
    const result = await withFnAsync.call({}, "", opts);
    expect(result).toBe("inverse");
  });

  it("renders inverse block for empty array", async () => {
    const opts = makeOptions();
    const result = await withFnAsync.call({}, [], opts);
    expect(result).toBe("inverse");
  });

  it("awaits a promise context", async () => {
    const opts = makeOptions();
    const result = await withFnAsync.call(
      {},
      Promise.resolve({ key: "val" }),
      opts
    );
    expect(result).toBe('with:{"key":"val"}');
  });

  it("resolves promise to falsy value and renders inverse", async () => {
    const opts = makeOptions();
    const result = await withFnAsync.call({}, Promise.resolve(null), opts);
    expect(result).toBe("inverse");
  });

  it("evaluates function context using this", async () => {
    const opts = makeOptions();
    const self = { data: { a: 1 } };
    const fn = function (this: any) {
      return this.data;
    };
    const result = await withFnAsync.call(self, fn, opts);
    expect(result).toBe('with:{"a":1}');
  });

  it("passes data and blockParams when data and ids are provided", async () => {
    const opts = makeOptions({
      data: { contextPath: "root" },
      ids: ["child"],
    });
    await withFnAsync.call({}, { val: 1 }, opts);
    expect(opts.fn).toHaveBeenCalledWith(
      { val: 1 },
      expect.objectContaining({
        data: expect.objectContaining({ contextPath: "root.child" }),
        blockParams: expect.any(Object),
      })
    );
  });

  it("throws when called with wrong number of arguments", async () => {
    await expect((withFnAsync as any).call({})).rejects.toThrow(
      "#with requires exactly one argument"
    );
  });
});
