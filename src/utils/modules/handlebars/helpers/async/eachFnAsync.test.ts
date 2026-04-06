import { eachFnAsync } from "@/utils/modules/handlebars/helpers/async/each";

describe("eachFnAsync", () => {
  const makeFn = () =>
    jest.fn((value: any, _opts: any) => `[${value}]`);
  const makeInverse = () => jest.fn(() => "(empty)");

  function makeOptions(overrides: Record<string, any> = {}) {
    return {
      fn: makeFn(),
      inverse: makeInverse(),
      data: {},
      ids: undefined as string[] | undefined,
      ...overrides,
    };
  }

  it("should throw if options is not provided", async () => {
    await expect(
      (eachFnAsync as any).call({}, [1, 2, 3])
    ).rejects.toThrow("Must pass iterator to #each");
  });

  describe("arrays", () => {
    it("should iterate over an array", async () => {
      const options = makeOptions();
      const result = await eachFnAsync.call({}, ["a", "b", "c"], options);
      expect(options.fn).toHaveBeenCalledTimes(3);
      expect(result).toBe("[a][b][c]");
    });

    it("should set data.first and data.last correctly", async () => {
      const fn = jest.fn((_val: any, opts: any) => {
        return `${opts.data.first ? "F" : ""}${opts.data.last ? "L" : ""}`;
      });
      const options = makeOptions({ fn });
      const result = await eachFnAsync.call({}, ["a", "b", "c"], options);
      expect(result).toBe("FL");
    });

    it("should set data.index and data.key for arrays", async () => {
      const fn = jest.fn((_val: any, opts: any) => {
        return `${opts.data.key}:${opts.data.index},`;
      });
      const options = makeOptions({ fn });
      const result = await eachFnAsync.call({}, ["x", "y"], options);
      expect(result).toBe("0:0,1:1,");
    });

    it("should handle empty array and call inverse", async () => {
      const options = makeOptions();
      await eachFnAsync.call({}, [], options);
      expect(options.fn).not.toHaveBeenCalled();
      expect(options.inverse).toHaveBeenCalled();
    });

    it("should handle sparse arrays", async () => {
      const arr = [1, , 3]; // eslint-disable-line no-sparse-arrays
      const options = makeOptions();
      const result = await eachFnAsync.call({}, arr, options);
      // Index 1 is not "in" arr, so it's skipped
      expect(options.fn).toHaveBeenCalledTimes(2);
      expect(result).toBe("[1][3]");
    });
  });

  describe("objects", () => {
    it("should iterate over object keys", async () => {
      const fn = jest.fn((val: any, opts: any) => `${opts.data.key}=${val};`);
      const options = makeOptions({ fn });
      const result = await eachFnAsync.call(
        {},
        { a: 1, b: 2, c: 3 },
        options
      );
      expect(fn).toHaveBeenCalledTimes(3);
      expect(result).toBe("a=1;b=2;c=3;");
    });

    it("should mark last item for objects", async () => {
      const fn = jest.fn((_val: any, opts: any) => {
        return opts.data.last ? "LAST" : "-";
      });
      const options = makeOptions({ fn });
      const result = await eachFnAsync.call({}, { x: 1, y: 2 }, options);
      expect(result).toBe("-LAST");
    });

    it("should handle empty object and call inverse", async () => {
      const options = makeOptions();
      await eachFnAsync.call({}, {}, options);
      expect(options.fn).not.toHaveBeenCalled();
      expect(options.inverse).toHaveBeenCalled();
    });
  });

  describe("iterables", () => {
    it("should iterate over Symbol.iterator iterables", async () => {
      const iterable = {
        [Symbol.iterator]() {
          let i = 0;
          const values = ["x", "y", "z"];
          return {
            next() {
              return i < values.length
                ? { value: values[i++], done: false }
                : { done: true };
            },
          };
        },
      };
      const options = makeOptions();
      const result = await eachFnAsync.call({}, iterable, options);
      expect(options.fn).toHaveBeenCalledTimes(3);
      expect(result).toBe("[x][y][z]");
    });
  });

  describe("promises", () => {
    it("should resolve a promise before iterating", async () => {
      const options = makeOptions();
      const result = await eachFnAsync.call(
        {},
        Promise.resolve(["p1", "p2"]),
        options
      );
      expect(options.fn).toHaveBeenCalledTimes(2);
      expect(result).toBe("[p1][p2]");
    });
  });

  describe("function argument", () => {
    it("should call arg1 if it is a function and iterate its result", async () => {
      const options = makeOptions();
      const argFn = function (this: any) {
        return ["f1", "f2"];
      };
      const result = await eachFnAsync.call({}, argFn, options);
      expect(options.fn).toHaveBeenCalledTimes(2);
      expect(result).toBe("[f1][f2]");
    });
  });

  describe("contextPath", () => {
    it("should set contextPath when data and ids are provided", async () => {
      const fn = jest.fn((_val: any, opts: any) => {
        return `${opts.data.contextPath || "none"},`;
      });
      const options = makeOptions({
        fn,
        data: { contextPath: "root" },
        ids: ["items"],
      });
      const result = await eachFnAsync.call({}, ["a"], options);
      expect(result).toBe("root.items.0,");
    });
  });

  describe("non-iterable values", () => {
    it("should call inverse for null", async () => {
      const options = makeOptions();
      await eachFnAsync.call({}, null, options);
      expect(options.fn).not.toHaveBeenCalled();
      expect(options.inverse).toHaveBeenCalled();
    });

    it("should call inverse for undefined", async () => {
      const options = makeOptions();
      await eachFnAsync.call({}, undefined, options);
      expect(options.fn).not.toHaveBeenCalled();
      expect(options.inverse).toHaveBeenCalled();
    });

    it("should call inverse for a number", async () => {
      const options = makeOptions();
      await eachFnAsync.call({}, 42, options);
      expect(options.fn).not.toHaveBeenCalled();
      expect(options.inverse).toHaveBeenCalled();
    });

    it("should call inverse for a boolean", async () => {
      const options = makeOptions();
      await eachFnAsync.call({}, false, options);
      expect(options.fn).not.toHaveBeenCalled();
      expect(options.inverse).toHaveBeenCalled();
    });
  });

  describe("no data", () => {
    it("should work without options.data", async () => {
      const fn = jest.fn((val: any) => `(${val})`);
      const options = {
        fn,
        inverse: makeInverse(),
      };
      const result = await eachFnAsync.call({}, ["a", "b"], options);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(result).toBe("(a)(b)");
    });
  });

  describe("blockParams", () => {
    it("should pass blockParams with value and key", async () => {
      const fn = jest.fn((_val: any, opts: any) => {
        return JSON.stringify(opts.blockParams) + ";";
      });
      const options = makeOptions({ fn });
      await eachFnAsync.call({}, ["x"], options);
      expect(fn).toHaveBeenCalledTimes(1);
      const call = fn.mock.calls[0][1];
      expect(call.blockParams).toBeDefined();
    });
  });
});
