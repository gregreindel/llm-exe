import { eachFnAsync } from "./each";

describe("eachFnAsync", () => {
  const fn = jest.fn();
  const inverse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    fn.mockImplementation((item: any) => String(item));
  });

  it("should throw an error if options is not provided", async () => {
    await expect(
      (eachFnAsync as any).call({}, [1, 2, 3])
    ).rejects.toThrow("Must pass iterator to #each");
  });

  it("should iterate over an array", async () => {
    const result = await eachFnAsync.call({}, ["a", "b", "c"], {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(fn).toHaveBeenCalledTimes(3);
    expect(result).toBe("abc");
  });

  it("should call inverse when array is empty", async () => {
    inverse.mockReturnValue("empty");

    await eachFnAsync.call({}, [], {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(fn).not.toHaveBeenCalled();
    expect(inverse).toHaveBeenCalled();
  });

  it("should iterate over object keys", async () => {
    fn.mockImplementation((val: any) => String(val));

    const result = await eachFnAsync.call({}, { a: 1, b: 2 }, {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe("12");
  });

  it("should set data.first and data.last correctly for arrays", async () => {
    const calls: any[] = [];
    fn.mockImplementation((_item: any, opts: any) => {
      calls.push({ ...opts.data });
      return "";
    });

    await eachFnAsync.call({}, ["x", "y", "z"], {
      fn,
      inverse,
      data: {},
      ids: null,
    });

    expect(calls[0].first).toBe(true);
    expect(calls[0].last).toBe(false);
    expect(calls[1].first).toBe(false);
    expect(calls[1].last).toBe(false);
    expect(calls[2].first).toBe(false);
    expect(calls[2].last).toBe(true);
  });

  it("should call the argument if it is a function", async () => {
    const argFn = jest.fn().mockReturnValue(["a", "b"]);
    fn.mockImplementation((item: any) => String(item));

    const result = await eachFnAsync.call({}, argFn, {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(argFn).toHaveBeenCalled();
    expect(result).toBe("ab");
  });

  it("should handle a promise argument", async () => {
    fn.mockImplementation((item: any) => String(item));

    const result = await eachFnAsync.call({}, Promise.resolve([1, 2]), {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe("12");
  });

  it("should set contextPath when data and ids are provided", async () => {
    const calls: any[] = [];
    fn.mockImplementation((_item: any, opts: any) => {
      calls.push({ ...opts.data });
      return "";
    });

    await eachFnAsync.call({}, ["x"], {
      fn,
      inverse,
      data: { contextPath: "root" },
      ids: ["items"],
    });

    expect(calls[0].contextPath).toBe("root.items.0");
  });

  it("should iterate over an iterable (Symbol.iterator)", async () => {
    fn.mockImplementation((item: any) => String(item));

    const iterable = {
      [Symbol.iterator]: function* () {
        yield "a";
        yield "b";
      },
    };

    const result = await eachFnAsync.call({}, iterable, {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe("ab");
  });

  it("should call inverse for null/undefined/non-object input", async () => {
    inverse.mockReturnValue("nothing");

    await eachFnAsync.call({}, null, {
      fn,
      inverse,
      data: null,
      ids: null,
    });

    expect(fn).not.toHaveBeenCalled();
    expect(inverse).toHaveBeenCalled();
  });
});
