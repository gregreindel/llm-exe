import { withFnAsync } from "@/utils/modules/handlebars/helpers/async/with";
import { appendContextPath } from "@/utils/modules/handlebars/utils/appendContextPath";
import { blockParams } from "@/utils/modules/handlebars/utils/blockParams";
import { createFrame } from "@/utils/modules/handlebars/utils/createFrame";
import { isEmpty } from "@/utils/modules/isEmpty";
import { isPromise } from "@/utils/modules/isPromise";

jest.mock("@/utils/modules/handlebars/utils/appendContextPath", () => ({
  appendContextPath: jest.fn(),
}));

jest.mock("@/utils/modules/handlebars/utils/blockParams", () => ({
  blockParams: jest.fn(),
}));

jest.mock("@/utils/modules/handlebars/utils/createFrame", () => ({
  createFrame: jest.fn(),
}));

jest.mock("@/utils/modules/isEmpty", () => ({
  isEmpty: jest.fn(),
}));

jest.mock("@/utils/modules/isPromise", () => ({
  isPromise: jest.fn(),
}));

describe("withFnAsync", () => {
  const appendContextPathMock = appendContextPath as jest.Mock;
  const blockParamsMock = blockParams as jest.Mock;
  const createFrameMock = createFrame as jest.Mock;
  const isEmptyMock = isEmpty as unknown as jest.Mock;
  const isPromiseMock = isPromise as unknown as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if the number of arguments is not exactly two", async () => {
    await expect((withFnAsync as any).call({}, {}, {}, {})).rejects.toThrow("#with requires exactly one argument");
  });

  it("should resolve context if it is a function", async () => {
    const mockContextFunction = jest.fn().mockReturnValue({ key: "value" });
    isEmptyMock.mockReturnValue(false);

    await withFnAsync.call({}, mockContextFunction, { fn: jest.fn(), inverse: jest.fn() });
    
    expect(mockContextFunction).toBeCalled();
    expect(isEmptyMock).toBeCalledWith({ key: "value" });
  });

  it("should await context if it is a promise", async () => {
    const mockPromise = Promise.resolve({ key: "value" });
    isPromiseMock.mockReturnValue(true);
    isEmptyMock.mockReturnValue(false);

    await withFnAsync.call({}, mockPromise, { fn: jest.fn(), inverse: jest.fn() });
    
    expect(isPromiseMock).toBeCalledWith(mockPromise);
    expect(isEmptyMock).toBeCalledWith({ key: "value" });
  });

  it("should call fn if context is not empty", async () => {
    const mockFn = jest.fn();
    isEmptyMock.mockReturnValue(false);

    const options = {
      fn: mockFn,
      inverse: jest.fn(),
      data: { contextPath: "path" },
      ids: ["id1"],
    };

    createFrameMock.mockReturnValue({ contextPath: "newPath" });
    appendContextPathMock.mockReturnValue("appendedPath");
    blockParamsMock.mockReturnValue(["blockParam"]);

    await withFnAsync.call({}, { key: "value" }, options);

    expect(mockFn).toBeCalledWith({ key: "value" }, {
      data: { contextPath: "appendedPath" },
      blockParams: ["blockParam"],
    });
  });

  it("should call inverse if context is empty", async () => {
    const mockInverse = jest.fn();
    isEmptyMock.mockReturnValue(true);

    await withFnAsync.call({}, { key: "value" }, { fn: jest.fn(), inverse: mockInverse });

    expect(mockInverse).toBeCalled();
  });

  it("should not modify data if options.data is not provided", async () => {
    isEmptyMock.mockReturnValue(false);

    const options = {
      fn: jest.fn(),
      inverse: jest.fn(),
      ids: ["id1"],
    };

    await withFnAsync.call({}, { key: "value" }, options);

    expect(createFrameMock).not.toBeCalled();
    expect(appendContextPathMock).not.toBeCalled();
  });
});