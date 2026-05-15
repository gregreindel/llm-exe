import { isEmpty } from "@/utils/modules/isEmpty";
import { isPromise } from "@/utils/modules/isPromise";
import { ifFnAsync } from "@/utils/modules/handlebars/helpers/async/if";

jest.mock("@/utils/modules/isEmpty");
jest.mock("@/utils/modules/isPromise");

describe("ifFnAsync", () => {
  const isEmptyMock = isEmpty as unknown as jest.Mock;
  const isPromiseMock = isPromise as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    isEmptyMock.mockReturnValue(false);
    isPromiseMock.mockReturnValue(false);
  });

  const makeOptions = (hash: Record<string, any> = {}) => ({
    fn: jest.fn().mockReturnValue("fn result"),
    inverse: jest.fn().mockReturnValue("inverse result"),
    hash,
  });

  it("should throw when called with incorrect number of arguments", async () => {
    await expect((ifFnAsync as any).call({})).rejects.toThrow(
      "#if requires exactly one argument"
    );
  });

  it("should render fn when conditional is truthy", async () => {
    const options = makeOptions();
    const ctx = {};
    const result = await ifFnAsync.call(ctx, "truthy", options);
    expect(result).toBe("fn result");
    expect(options.fn).toHaveBeenCalledWith(ctx);
  });

  it("should render inverse when conditional is falsy", async () => {
    const options = makeOptions();
    const ctx = {};
    const result = await ifFnAsync.call(ctx, false, options);
    expect(result).toBe("inverse result");
    expect(options.inverse).toHaveBeenCalledWith(ctx);
  });

  it("should render inverse when conditional is empty", async () => {
    isEmptyMock.mockReturnValue(true);
    const options = makeOptions();
    const ctx = {};
    const result = await ifFnAsync.call(ctx, "something", options);
    expect(result).toBe("inverse result");
    expect(isEmptyMock).toHaveBeenCalledWith("something");
  });

  it("should await promise conditionals", async () => {
    isPromiseMock.mockReturnValue(true);
    const options = makeOptions();
    const ctx = {};
    const conditional = Promise.resolve("resolved value");
    const result = await ifFnAsync.call(ctx, conditional, options);
    expect(isPromiseMock).toHaveBeenCalledWith(conditional);
    expect(result).toBe("fn result");
  });

  it("should await promise that resolves to falsy", async () => {
    isPromiseMock.mockReturnValue(true);
    const options = makeOptions();
    const ctx = {};
    const conditional = Promise.resolve(false);
    const result = await ifFnAsync.call(ctx, conditional, options);
    expect(result).toBe("inverse result");
  });

  it("should call function conditionals", async () => {
    const conditionalFn = jest.fn().mockReturnValue("called value");
    const options = makeOptions();
    const ctx = { key: "value" };
    const result = await ifFnAsync.call(ctx, conditionalFn, options);
    expect(conditionalFn).toHaveBeenCalled();
    expect(result).toBe("fn result");
  });

  it("should treat 0 as falsy without includeZero", async () => {
    const options = makeOptions();
    const ctx = {};
    const result = await ifFnAsync.call(ctx, 0, options);
    expect(result).toBe("inverse result");
  });

  it("should treat 0 as truthy with includeZero", async () => {
    const options = makeOptions({ includeZero: true });
    const ctx = {};
    const result = await ifFnAsync.call(ctx, 0, options);
    expect(result).toBe("fn result");
  });

  it("should render inverse for empty string", async () => {
    const options = makeOptions();
    const ctx = {};
    const result = await ifFnAsync.call(ctx, "", options);
    expect(result).toBe("inverse result");
  });

  it("should render inverse for null", async () => {
    const options = makeOptions();
    const ctx = {};
    const result = await ifFnAsync.call(ctx, null, options);
    expect(result).toBe("inverse result");
  });

  it("should render inverse for undefined", async () => {
    const options = makeOptions();
    const ctx = {};
    const result = await ifFnAsync.call(ctx, undefined, options);
    expect(result).toBe("inverse result");
  });
});
