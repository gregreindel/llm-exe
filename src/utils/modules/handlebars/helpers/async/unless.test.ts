import { unlessFnAsync } from "./unless";

function makeOptions() {
  return {
    fn: jest.fn((_ctx: any) => "truthy-block"),
    inverse: jest.fn((_ctx: any) => "inverse-block"),
    hash: {},
  };
}

describe("unlessFnAsync", () => {
  it("renders fn block (inverse of if) for falsy value", async () => {
    const opts = makeOptions();
    const result = await unlessFnAsync.call({}, false, opts);
    expect(result).toBe("truthy-block");
  });

  it("renders inverse block (fn of if) for truthy value", async () => {
    const opts = makeOptions();
    const result = await unlessFnAsync.call({}, true, opts);
    expect(result).toBe("inverse-block");
  });

  it("renders fn block for null", async () => {
    const opts = makeOptions();
    const result = await unlessFnAsync.call({}, null, opts);
    expect(result).toBe("truthy-block");
  });

  it("renders fn block for undefined", async () => {
    const opts = makeOptions();
    const result = await unlessFnAsync.call({}, undefined, opts);
    expect(result).toBe("truthy-block");
  });

  it("renders inverse block for non-empty string", async () => {
    const opts = makeOptions();
    const result = await unlessFnAsync.call({}, "hello", opts);
    expect(result).toBe("inverse-block");
  });

  it("awaits a promise conditional", async () => {
    const opts = makeOptions();
    const result = await unlessFnAsync.call({}, Promise.resolve(false), opts);
    expect(result).toBe("truthy-block");
  });

  it("throws when called with wrong number of arguments", async () => {
    await expect(
      (unlessFnAsync as any).call({})
    ).rejects.toThrow("#unless requires exactly one argument");
  });
});
