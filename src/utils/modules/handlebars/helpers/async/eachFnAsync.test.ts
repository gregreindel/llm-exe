import { eachFnAsync } from "@/utils/modules/handlebars/helpers/async/each";
import { appendContextPath } from "@/utils/modules/handlebars/utils/appendContextPath";
import { blockParams } from "@/utils/modules/handlebars/utils/blockParams";
import { createFrame } from "@/utils/modules/handlebars/utils/createFrame";
import { isPromise } from "@/utils/modules/isPromise";
import { isReadableStream } from "@/utils/modules/isReadableStream";

jest.mock("@/utils/modules/handlebars/utils/appendContextPath", () => ({
  appendContextPath: jest.fn(),
}));

jest.mock("@/utils/modules/handlebars/utils/blockParams", () => ({
  blockParams: jest.fn(),
}));

jest.mock("@/utils/modules/handlebars/utils/createFrame", () => ({
  createFrame: jest.fn(),
}));

jest.mock("@/utils/modules/isPromise", () => ({
  isPromise: jest.fn(),
}));

jest.mock("@/utils/modules/isReadableStream", () => ({
  isReadableStream: jest.fn(),
}));

describe("eachFnAsync", () => {
  const appendContextPathMock = appendContextPath as jest.Mock;
  const blockParamsMock = blockParams as jest.Mock;
  const createFrameMock = createFrame as jest.Mock;
  const isPromiseMock = isPromise as unknown as jest.Mock;
  const isReadableStreamMock = isReadableStream as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    isPromiseMock.mockReturnValue(false);
    isReadableStreamMock.mockReturnValue(false);
    blockParamsMock.mockReturnValue([]);
  });

  it("should throw if options is not provided", async () => {
    await expect(
      (eachFnAsync as any).call({}, [1, 2, 3])
    ).rejects.toThrow("Must pass iterator to #each");
  });

  it("should iterate over an array", async () => {
    const fn = jest.fn().mockImplementation((val) => `item:${val}`);
    const inverse = jest.fn();

    const options = { fn, inverse };
    const result = await eachFnAsync.call({}, ["a", "b", "c"], options);

    expect(fn).toHaveBeenCalledTimes(3);
    expect(result).toBe("item:aitem:bitem:c");
  });

  it("should call inverse when array is empty", async () => {
    const fn = jest.fn();
    const inverse = jest.fn().mockReturnValue("nothing");

    const options = { fn, inverse };
    const result = await eachFnAsync.call({}, [], options);

    expect(fn).not.toHaveBeenCalled();
    expect(inverse).toHaveBeenCalled();
    expect(result).toBe("nothing");
  });

  it("should iterate over object keys", async () => {
    const fn = jest.fn().mockImplementation((val) => `${val}`);
    const inverse = jest.fn();

    const options = { fn, inverse };
    const result = await eachFnAsync.call(
      {},
      { x: "one", y: "two", z: "three" },
      options
    );

    expect(fn).toHaveBeenCalledTimes(3);
    expect(result).toBe("onetwothree");
  });

  it("should set data.key, data.index, data.first, data.last for arrays", async () => {
    const capturedData: any[] = [];
    const fn = jest.fn().mockImplementation((_val, opts) => {
      capturedData.push({ ...opts.data });
      return "";
    });

    createFrameMock.mockReturnValue({});

    const options = { fn, inverse: jest.fn(), data: {} };
    await eachFnAsync.call({}, ["a", "b"], options);

    expect(capturedData[0]).toEqual(
      expect.objectContaining({ key: 0, index: 0, first: true, last: false })
    );
    expect(capturedData[1]).toEqual(
      expect.objectContaining({ key: 1, index: 1, first: false, last: true })
    );
  });

  it("should set data.last correctly for objects", async () => {
    const capturedData: any[] = [];
    const fn = jest.fn().mockImplementation((_val, opts) => {
      capturedData.push({ ...opts.data });
      return "";
    });

    createFrameMock.mockReturnValue({});

    const options = { fn, inverse: jest.fn(), data: {} };
    await eachFnAsync.call({}, { a: 1, b: 2 }, options);

    expect(capturedData).toHaveLength(2);
    expect(capturedData[0].last).toBe(false);
    expect(capturedData[1].last).toBe(true);
  });

  it("should set contextPath when data and ids are provided", async () => {
    const fn = jest.fn().mockReturnValue("ok");
    appendContextPathMock.mockReturnValue("root.items");

    createFrameMock.mockReturnValue({});

    const options = {
      fn,
      inverse: jest.fn(),
      data: { contextPath: "root" },
      ids: ["items"],
    };

    await eachFnAsync.call({}, ["val"], options);

    expect(appendContextPathMock).toHaveBeenCalledWith("root", "items");
    expect(fn).toHaveBeenCalled();
  });

  it("should resolve arg1 as a function if it is callable", async () => {
    const fn = jest.fn().mockImplementation((val) => `${val}`);
    const arg1Fn = jest.fn().mockReturnValue(["resolved"]);

    const options = { fn, inverse: jest.fn() };
    const result = await eachFnAsync.call({}, arg1Fn, options);

    expect(arg1Fn).toHaveBeenCalled();
    expect(result).toBe("resolved");
  });

  it("should await arg1 if it is a promise", async () => {
    isPromiseMock.mockReturnValue(true);
    const fn = jest.fn().mockImplementation((val) => `${val}`);

    const options = { fn, inverse: jest.fn() };
    const result = await eachFnAsync.call(
      {},
      Promise.resolve(["async"]),
      options
    );

    expect(result).toBe("async");
  });

  it("should iterate over an iterable (Symbol.iterator)", async () => {
    const fn = jest.fn().mockImplementation((val) => `${val}`);

    const iterable = {
      [Symbol.iterator]() {
        let i = 0;
        const items = ["x", "y"];
        return {
          next() {
            if (i < items.length) return { value: items[i++], done: false };
            return { value: undefined, done: true };
          },
        };
      },
    };

    const options = { fn, inverse: jest.fn() };
    const result = await eachFnAsync.call({}, iterable, options);

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe("xy");
  });

  it("should call inverse for null/undefined input", async () => {
    const fn = jest.fn();
    const inverse = jest.fn().mockReturnValue("empty");

    const options = { fn, inverse };
    const result = await eachFnAsync.call({}, null, options);

    expect(fn).not.toHaveBeenCalled();
    expect(inverse).toHaveBeenCalled();
    expect(result).toBe("empty");
  });

  it("should call inverse for primitive input", async () => {
    const fn = jest.fn();
    const inverse = jest.fn().mockReturnValue("not iterable");

    const options = { fn, inverse };
    const result = await eachFnAsync.call({}, 42, options);

    expect(fn).not.toHaveBeenCalled();
    expect(result).toBe("not iterable");
  });

  it("should iterate over a readable stream", async () => {
    isReadableStreamMock.mockReturnValue(true);

    const fn = jest.fn().mockImplementation((val) => `${val}`);

    let dataHandler: (item: any) => void = () => {};
    let endHandler: () => Promise<void> = async () => {};

    const mockStream = {
      on: jest.fn().mockImplementation(function (this: any, event: string, handler: any) {
        if (event === "data") {
          dataHandler = handler;
        } else if (event === "end") {
          endHandler = handler;
        }
        return this;
      }),
      once: jest.fn().mockImplementation(function (this: any) {
        return this;
      }),
    };

    const options = { fn, inverse: jest.fn() };
    const promise = eachFnAsync.call({}, mockStream, options);

    // Simulate stream events
    dataHandler("s1");
    dataHandler("s2");
    await endHandler();

    const result = await promise;

    expect(fn).toHaveBeenCalledTimes(2);
    expect(result).toBe("s1s2");
  });

  it("should pass blockParams for each iteration", async () => {
    blockParamsMock.mockReturnValue(["bp"]);
    const fn = jest.fn().mockReturnValue("");

    const options = { fn, inverse: jest.fn() };
    await eachFnAsync.call({}, ["a"], options);

    expect(blockParamsMock).toHaveBeenCalledWith(
      ["a", 0],
      ["0", null]
    );
  });
});
