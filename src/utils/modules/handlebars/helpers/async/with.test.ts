import { withFnAsync } from "./with";
import { isEmpty } from "@/utils/modules/isEmpty";

jest.mock("@/utils/modules/isEmpty");

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

  it("should call options.fn with context when context is not empty", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    fn.mockReturnValue("rendered");
    const result = await withFnAsync.call({}, { name: "test" }, { fn, inverse, data: null, ids: null });
    expect(fn).toHaveBeenCalledWith(
      { name: "test" },
      expect.objectContaining({ data: null })
    );
    expect(result).toBe("rendered");
  });

  it("should call options.inverse when context is empty", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(true);
    inverse.mockReturnValue("empty");
    const thisContext = { foo: "bar" };
    const result = await withFnAsync.call(thisContext, null, { fn, inverse, data: null, ids: null });
    expect(inverse).toHaveBeenCalledWith(thisContext);
    expect(result).toBe("empty");
  });

  it("should resolve a promise context before evaluating", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    fn.mockReturnValue("resolved");
    const promiseContext = Promise.resolve({ key: "value" });
    const result = await withFnAsync.call({}, promiseContext, { fn, inverse, data: null, ids: null });
    expect(fn).toHaveBeenCalledWith(
      { key: "value" },
      expect.anything()
    );
    expect(result).toBe("resolved");
  });

  it("should resolve a promise that resolves to empty", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(true);
    inverse.mockReturnValue("nope");
    const promiseContext = Promise.resolve(null);
    const result = await withFnAsync.call({}, promiseContext, { fn, inverse, data: null, ids: null });
    expect(inverse).toHaveBeenCalled();
    expect(result).toBe("nope");
  });

  it("should call function context if context is a function (non-promise)", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    fn.mockReturnValue("from-fn");
    const contextFn = jest.fn().mockReturnValue({ x: 1 });
    const result = await withFnAsync.call({}, contextFn, { fn, inverse, data: null, ids: null });
    expect(contextFn).toHaveBeenCalled();
    expect(fn).toHaveBeenCalledWith(
      { x: 1 },
      expect.anything()
    );
    expect(result).toBe("from-fn");
  });

  it("should create a frame and set contextPath when data and ids are provided", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    fn.mockReturnValue("with-context-path");
    const options = {
      fn,
      inverse,
      data: { contextPath: "root" },
      ids: ["child"],
    };
    const result = await withFnAsync.call({}, { a: 1 }, options);
    expect(fn).toHaveBeenCalledWith(
      { a: 1 },
      expect.objectContaining({
        data: expect.objectContaining({ contextPath: "root.child" }),
      })
    );
    expect(result).toBe("with-context-path");
  });

  it("should pass data without contextPath when ids are not provided", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    fn.mockReturnValue("no-ids");
    const options = {
      fn,
      inverse,
      data: { contextPath: "root" },
      ids: null,
    };
    const result = await withFnAsync.call({}, { b: 2 }, options);
    expect(fn).toHaveBeenCalledWith(
      { b: 2 },
      expect.objectContaining({ data: expect.any(Object) })
    );
    expect(result).toBe("no-ids");
  });
});
