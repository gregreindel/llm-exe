import { ifFnAsync } from "./if";

describe("ifFnAsync", () => {
  const makeMockOptions = (hash: Record<string, any> = {}) => ({
    fn: jest.fn().mockReturnValue("truthy-branch"),
    inverse: jest.fn().mockReturnValue("falsy-branch"),
    hash,
  });

  it("should render fn branch for truthy conditional", async () => {
    const options = makeMockOptions();
    const ctx = { some: "context" };
    const result = await ifFnAsync.call(ctx, "hello", options);
    expect(result).toBe("truthy-branch");
    expect(options.fn).toHaveBeenCalledWith(ctx);
    expect(options.inverse).not.toHaveBeenCalled();
  });

  it("should render inverse branch for falsy conditional", async () => {
    const options = makeMockOptions();
    const ctx = {};
    const result = await ifFnAsync.call(ctx, false, options);
    expect(result).toBe("falsy-branch");
    expect(options.inverse).toHaveBeenCalledWith(ctx);
    expect(options.fn).not.toHaveBeenCalled();
  });

  it("should render inverse branch for empty string", async () => {
    const options = makeMockOptions();
    const result = await ifFnAsync.call({}, "", options);
    expect(result).toBe("falsy-branch");
  });

  it("should render inverse branch for null", async () => {
    const options = makeMockOptions();
    const result = await ifFnAsync.call({}, null, options);
    expect(result).toBe("falsy-branch");
  });

  it("should render inverse branch for undefined", async () => {
    const options = makeMockOptions();
    const result = await ifFnAsync.call({}, undefined, options);
    expect(result).toBe("falsy-branch");
  });

  it("should render inverse branch for 0 without includeZero", async () => {
    const options = makeMockOptions();
    const result = await ifFnAsync.call({}, 0, options);
    expect(result).toBe("falsy-branch");
  });

  it("should render fn branch for 0 with includeZero", async () => {
    const options = makeMockOptions({ includeZero: true });
    const result = await ifFnAsync.call({}, 0, options);
    expect(result).toBe("truthy-branch");
  });

  it("should render inverse for empty array", async () => {
    const options = makeMockOptions();
    const result = await ifFnAsync.call({}, [], options);
    expect(result).toBe("falsy-branch");
  });

  it("should resolve promise conditionals", async () => {
    const options = makeMockOptions();
    const result = await ifFnAsync.call({}, Promise.resolve("truthy"), options);
    expect(result).toBe("truthy-branch");
  });

  it("should resolve promise that resolves to falsy", async () => {
    const options = makeMockOptions();
    const result = await ifFnAsync.call({}, Promise.resolve(false), options);
    expect(result).toBe("falsy-branch");
  });

  it("should call function conditionals with correct this context", async () => {
    const options = makeMockOptions();
    const ctx = { value: "test" };
    const conditional = function (this: any) {
      return this.value;
    };
    const result = await ifFnAsync.call(ctx, conditional, options);
    expect(result).toBe("truthy-branch");
  });

  it("should call function conditionals that return falsy", async () => {
    const options = makeMockOptions();
    const conditional = jest.fn().mockReturnValue(null);
    const result = await ifFnAsync.call({}, conditional, options);
    expect(result).toBe("falsy-branch");
  });

  it("should throw when called with no arguments", async () => {
    await expect(
      (ifFnAsync as any).call({})
    ).rejects.toThrow("#if requires exactly one argument");
  });

  it("should throw when called with too many arguments", async () => {
    const options = makeMockOptions();
    await expect(
      (ifFnAsync as any).call({}, true, options, "extra")
    ).rejects.toThrow("#if requires exactly one argument");
  });
});
