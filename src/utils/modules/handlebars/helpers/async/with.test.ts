import { withFnAsync } from "./with";

jest.mock("@/utils/modules/isEmpty", () => ({
  isEmpty: jest.fn((val: any) => {
    if (val === null || val === undefined || val === "") return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  }),
}));

describe("withFnAsync", () => {
  const fn = jest.fn();
  const inverse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if arguments length is not 2", async () => {
    await expect((withFnAsync as any).call({})).rejects.toThrow(
      "#with requires exactly one argument"
    );
  });

  it("should resolve a promise context before evaluating", async () => {
    fn.mockReturnValue("with result");

    const contextPromise = Promise.resolve({ name: "test" });
    await withFnAsync.call({}, contextPromise, {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(fn).toHaveBeenCalledWith(
      { name: "test" },
      expect.objectContaining({ blockParams: expect.anything() })
    );
    expect(inverse).not.toHaveBeenCalled();
  });

  it("should call the context function if context is a function", async () => {
    fn.mockReturnValue("fn result");

    const contextFn = jest.fn().mockReturnValue({ key: "value" });
    await withFnAsync.call({}, contextFn, {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(contextFn).toHaveBeenCalled();
    expect(fn).toHaveBeenCalledWith(
      { key: "value" },
      expect.objectContaining({ blockParams: expect.anything() })
    );
  });

  it("should call options.fn with context when context is not empty", async () => {
    fn.mockReturnValue("result");

    await withFnAsync.call({}, { name: "test" }, {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(fn).toHaveBeenCalledWith(
      { name: "test" },
      expect.objectContaining({ blockParams: expect.anything() })
    );
    expect(inverse).not.toHaveBeenCalled();
  });

  it("should call options.inverse when context is empty", async () => {
    inverse.mockReturnValue("inverse result");

    const thisContext = { some: "context" };
    await withFnAsync.call(thisContext, null, {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(inverse).toHaveBeenCalledWith(thisContext);
    expect(fn).not.toHaveBeenCalled();
  });

  it("should set contextPath when data and ids are provided", async () => {
    fn.mockReturnValue("result");

    await withFnAsync.call({}, { name: "test" }, {
      fn,
      inverse,
      data: { contextPath: "root" },
      ids: ["child"],
    });

    expect(fn).toHaveBeenCalledWith(
      { name: "test" },
      expect.objectContaining({
        data: expect.objectContaining({
          contextPath: "root.child",
        }),
      })
    );
  });

  it("should handle a promise that resolves to empty", async () => {
    inverse.mockReturnValue("inverse");

    const thisContext = {};
    await withFnAsync.call(thisContext, Promise.resolve(null), {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(inverse).toHaveBeenCalledWith(thisContext);
    expect(fn).not.toHaveBeenCalled();
  });
});
