import { Readable } from "stream";
import { appendContextPath } from "@/utils/modules/handlebars/utils/appendContextPath";
import { blockParams } from "@/utils/modules/handlebars/utils/blockParams";
import { isPromise } from "@/utils/modules/isPromise";
import { createFrame } from "@/utils/modules/handlebars/utils/createFrame";
import { eachFnAsync } from "@/utils/modules/handlebars/helpers/async/each";

jest.mock("@/utils/modules/handlebars/utils/appendContextPath");
jest.mock("@/utils/modules/handlebars/utils/blockParams");
jest.mock("@/utils/modules/isPromise");
jest.mock("@/utils/modules/handlebars/utils/createFrame");

describe("eachFnAsync", () => {
  const appendContextPathMock = appendContextPath as jest.Mock;
  const blockParamsMock = blockParams as jest.Mock;
  const isPromiseMock = isPromise as unknown as jest.Mock;
  const createFrameMock = createFrame as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw error when options are not passed", async () => {
    await expect(eachFnAsync.call({}, {}, null)).rejects.toThrow(
      "Must pass iterator to #each"
    );
  });

  it("should handle array context", async () => {
    const context = [1, 2, 3];
    const options = {
      fn: jest.fn().mockResolvedValue("fn_call"),
      inverse: jest.fn().mockReturnValue("inverse_call"),
      data: {},
      ids: ["id1"],
    };
    appendContextPathMock.mockReturnValue("context.path");

    const result = await eachFnAsync.call({}, context, options);

    expect(appendContextPathMock).toHaveBeenCalledWith(undefined, "id1");
    expect(createFrameMock).toHaveBeenCalledWith(options.data);
    expect(blockParamsMock).toHaveBeenCalledTimes(3);
    expect(options.fn).toHaveBeenCalledTimes(3);
    expect(result).toBe("fn_callfn_callfn_call");
  });

  it("should handle object context", async () => {
    const context = { key1: "value1", key2: "value2" };
    const options = {
      fn: jest.fn().mockResolvedValue("fn_call"),
      inverse: jest.fn().mockReturnValue("inverse_call"),
      data: {},
      ids: ["id1"],
    };
    appendContextPathMock.mockReturnValue("context.path");

    const result = await eachFnAsync.call({}, context, options);

    expect(appendContextPathMock).toHaveBeenCalledWith(undefined, "id1");
    expect(createFrameMock).toHaveBeenCalledWith(options.data);
    expect(blockParamsMock).toHaveBeenCalledTimes(2);
    expect(options.fn).toHaveBeenCalledTimes(2);
    expect(result).toBe("fn_callfn_call");
  });

  it("should handle promise context", async () => {
    const context = Promise.resolve([1, 2, 3]);
    const options = {
      fn: jest.fn().mockResolvedValue("fn_call"),
      inverse: jest.fn().mockReturnValue("inverse_call"),
      data: {},
      ids: ["id1"],
    };
    appendContextPathMock.mockReturnValue("context.path");
    isPromiseMock.mockReturnValue(true);

    const result = await eachFnAsync.call({}, context, options);

    expect(isPromiseMock).toHaveBeenCalledWith(context);
    expect(appendContextPathMock).toHaveBeenCalledWith(undefined, "id1");
    expect(createFrameMock).toHaveBeenCalledWith(options.data);
    expect(blockParamsMock).toHaveBeenCalledTimes(3);
    expect(options.fn).toHaveBeenCalledTimes(3);
    expect(result).toBe("fn_callfn_callfn_call");
  });

  it("should handle iterator context", async () => {
    const context = new Set([1, 2, 3]);
    const options = {
      fn: jest.fn().mockResolvedValue("fn_call"),
      inverse: jest.fn().mockReturnValue("inverse_call"),
      data: {},
      ids: ["id1"],
    };
    appendContextPathMock.mockReturnValue("context.path");

    const result = await eachFnAsync.call({}, context, options);

    expect(appendContextPathMock).toHaveBeenCalledWith(undefined, "id1");
    expect(createFrameMock).toHaveBeenCalledWith(options.data);
    expect(blockParamsMock).toHaveBeenCalledTimes(3);
    expect(options.fn).toHaveBeenCalledTimes(3);
    expect(result).toBe("fn_callfn_callfn_call");
  });

  it("should handle Readable stream context", async () => {
    const context = new Readable({
      read() {
        this.push("item1");
        this.push("item2");
        this.push(null);
      },
    });
    const options = {
      fn: jest.fn().mockResolvedValue("fn_call"),
      inverse: jest.fn().mockReturnValue("inverse_call"),
      data: {},
      ids: ["id1"],
    };
    appendContextPathMock.mockReturnValue("context.path");

    const result = await eachFnAsync.call({}, context, options);

    expect(appendContextPathMock).toHaveBeenCalledWith(undefined, "id1");
    expect(createFrameMock).toHaveBeenCalledWith(options.data);
    expect(blockParamsMock).toHaveBeenCalledTimes(2);
    expect(options.fn).toHaveBeenCalledTimes(2);
    expect(result).toBe("fn_callfn_call");
  });

  it("should handle empty context with inverse", async () => {
    const context: any = [];
    const options = {
      fn: jest.fn().mockResolvedValue("fn_call"),
      inverse: jest.fn().mockReturnValue("inverse_call"),
      data: {},
      ids: ["id1"],
    };
    appendContextPathMock.mockReturnValue("context.path");

    const result = await eachFnAsync.call({}, context, options);

    expect(appendContextPathMock).toHaveBeenCalledWith(undefined, "id1");
    expect(createFrameMock).toHaveBeenCalledWith(options.data);
    expect(blockParamsMock).not.toHaveBeenCalled();
    expect(options.inverse).toHaveBeenCalledTimes(2);
    expect(result).toBe("inverse_call");
  });

  it("should handle function context", async () => {
    const context = jest.fn().mockReturnValue([1, 2, 3]);
    const options = {
      fn: jest.fn().mockResolvedValue("fn_call"),
      inverse: jest.fn().mockReturnValue("inverse_call"),
      data: {},
      ids: ["id1"],
    };
    appendContextPathMock.mockReturnValue("context.path");
  
    const result = await eachFnAsync.call({}, context, options);
  
    expect(context).toHaveBeenCalled();
    expect(appendContextPathMock).toHaveBeenCalledWith(undefined, "id1");
    expect(createFrameMock).toHaveBeenCalledWith(options.data);
    expect(blockParamsMock).toHaveBeenCalledTimes(3);
    expect(options.fn).toHaveBeenCalledTimes(3);
    expect(result).toBe("fn_callfn_callfn_call");
  });
  
  it("should populate data correctly during iteration", async () => {
    const context = [1];
    const options = {
      fn: jest.fn().mockResolvedValue("fn_call"),
      inverse: jest.fn().mockReturnValue("inverse_call"),
      data: {},
      ids: ["id1"],
    };
    appendContextPathMock.mockReturnValue("context.path");
    createFrameMock.mockReturnValue({});
    blockParamsMock.mockReturnValue([["context.path.0", null]]);
  
    await eachFnAsync.call({}, context, options);
  
    expect(createFrameMock).toHaveBeenCalledWith(options.data);
    expect(blockParamsMock).toHaveBeenCalledWith([1, 0], ["context.path.0", null]);
    expect(options.fn).toHaveBeenCalledWith(1, {
      blockParams: [["context.path.0", null]],
      data: {
        contextPath: "context.path.0",
        first: true,
        index: 0,
        key: 0,
        last: true,
      },
    });
  });

  it("should handle error in Readable stream context", async () => {
    const context = new Readable({
      read() {
        this.emit("error", new Error("stream error"));
      },
    });
    const options = {
      fn: jest.fn().mockResolvedValue("fn_call"),
      inverse: jest.fn().mockReturnValue("inverse_call"),
      data: {},
      ids: ["id1"],
    };
    appendContextPathMock.mockReturnValue("context.path");
  
    await expect(eachFnAsync.call({}, context, options)).rejects.toThrow("stream error");
  
    expect(appendContextPathMock).toHaveBeenCalledWith(undefined, "id1");
    expect(createFrameMock).toHaveBeenCalledWith(options.data);
    expect(blockParamsMock).not.toHaveBeenCalled();
    expect(options.fn).not.toHaveBeenCalled();
    expect(options.inverse).not.toHaveBeenCalled();
  });
});