import { eachFnAsync } from "./each";

describe("eachFnAsync", () => {
  const fn = jest.fn();
  const inverse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if options is not passed", async () => {
    await expect((eachFnAsync as any).call({}, [])).rejects.toThrow(
      "Must pass iterator to #each"
    );
  });

  it("should iterate over an array", async () => {
    fn.mockImplementation((value) => `[${value}]`);
    const result = await eachFnAsync.call({}, ["a", "b", "c"], {
      fn,
      inverse,
      data: null,
      ids: null,
    });
    expect(fn).toHaveBeenCalledTimes(3);
    expect(result).toBe("[a][b][c]");
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
    fn.mockImplementation((value) => `(${value})`);
    const result = await eachFnAsync.call({}, { x: 1, y: 2 }, {
      fn,
      inverse,
      data: null,
      ids: null,
    });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe("(1)(2)");
  });

  it("should set data.first and data.last correctly for arrays", async () => {
    const calls: any[] = [];
    fn.mockImplementation((_value, opts) => {
      calls.push({ ...opts.data });
      return "";
    });
    await eachFnAsync.call({}, ["a", "b", "c"], {
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

  it("should set data.last correctly for object iteration", async () => {
    const calls: any[] = [];
    fn.mockImplementation((_value, opts) => {
      calls.push({ key: opts.data.key, last: opts.data.last });
      return "";
    });
    await eachFnAsync.call({}, { a: 1, b: 2 }, {
      fn,
      inverse,
      data: {},
      ids: null,
    });
    expect(calls[0].key).toBe("a");
    expect(calls[0].last).toBe(false);
    expect(calls[1].key).toBe("b");
    expect(calls[1].last).toBe(true);
  });

  it("should resolve a promise arg before iterating", async () => {
    fn.mockImplementation((value) => `${value}`);
    const promiseArg = Promise.resolve(["x", "y"]);
    const result = await eachFnAsync.call({}, promiseArg, {
      fn,
      inverse,
      data: null,
      ids: null,
    });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe("xy");
  });

  it("should call arg1 if it is a function", async () => {
    fn.mockImplementation((value) => `${value}`);
    const argFn = jest.fn().mockReturnValue(["p", "q"]);
    const result = await eachFnAsync.call({}, argFn, {
      fn,
      inverse,
      data: null,
      ids: null,
    });
    expect(argFn).toHaveBeenCalled();
    expect(result).toBe("pq");
  });

  it("should iterate over a Symbol.iterator iterable", async () => {
    fn.mockImplementation((value) => `${value}`);
    const iterable = {
      [Symbol.iterator]() {
        let i = 0;
        const items = [10, 20, 30];
        return {
          next() {
            if (i < items.length) {
              return { value: items[i++], done: false };
            }
            return { value: undefined, done: true };
          },
        };
      },
    };
    const result = await eachFnAsync.call({}, iterable, {
      fn,
      inverse,
      data: null,
      ids: null,
    });
    expect(fn).toHaveBeenCalledTimes(3);
    expect(result).toBe("102030");
  });

  it("should set contextPath when data and ids are provided", async () => {
    const calls: any[] = [];
    fn.mockImplementation((_value, opts) => {
      calls.push({ contextPath: opts.data.contextPath });
      return "";
    });
    await eachFnAsync.call({}, ["a"], {
      fn,
      inverse,
      data: { contextPath: "root" },
      ids: ["items"],
    });
    expect(calls[0].contextPath).toBe("root.items.0");
  });

  it("should call inverse when arg1 is null", async () => {
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

  it("should call inverse when arg1 is undefined", async () => {
    inverse.mockReturnValue("nothing");
    await eachFnAsync.call({}, undefined, {
      fn,
      inverse,
      data: null,
      ids: null,
    });
    expect(fn).not.toHaveBeenCalled();
    expect(inverse).toHaveBeenCalled();
  });

  it("should handle a single-element array", async () => {
    const calls: any[] = [];
    fn.mockImplementation((_value, opts) => {
      calls.push({ first: opts.data.first, last: opts.data.last });
      return "x";
    });
    const result = await eachFnAsync.call({}, ["only"], {
      fn,
      inverse,
      data: {},
      ids: null,
    });
    expect(result).toBe("x");
    expect(calls[0].first).toBe(true);
    expect(calls[0].last).toBe(true);
  });

  it("should iterate over a readable stream", async () => {
    fn.mockImplementation((value) => `${value}`);
    const { Readable } = require("stream");
    const readable = new Readable({
      objectMode: true,
      read() {
        this.push("s1");
        this.push("s2");
        this.push(null);
      },
    });
    const result = await eachFnAsync.call({}, readable, {
      fn,
      inverse,
      data: null,
      ids: null,
    });
    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe("s1s2");
  });

  it("should handle a readable stream error", async () => {
    const { Readable } = require("stream");
    const readable = new Readable({
      objectMode: true,
      read() {
        this.destroy(new Error("stream error"));
      },
    });
    await expect(
      eachFnAsync.call({}, readable, {
        fn,
        inverse,
        data: null,
        ids: null,
      })
    ).rejects.toThrow("stream error");
  });

  it("should handle a single-key object", async () => {
    const calls: any[] = [];
    fn.mockImplementation((_value, opts) => {
      calls.push({ key: opts.data.key, last: opts.data.last });
      return "v";
    });
    const result = await eachFnAsync.call({}, { only: 1 }, {
      fn,
      inverse,
      data: {},
      ids: null,
    });
    expect(result).toBe("v");
    expect(calls[0].key).toBe("only");
    expect(calls[0].last).toBe(true);
  });
});
