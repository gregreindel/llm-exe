import { ifFnAsync } from "@/utils/modules/handlebars/helpers/async/if";
import { isEmpty } from "@/utils/modules/isEmpty";
import { isPromise } from "@/utils/modules/isPromise";

jest.mock("@/utils/modules/isEmpty", () => ({
  isEmpty: jest.fn(),
}));

jest.mock("@/utils/modules/isPromise", () => ({
  isPromise: jest.fn(),
}));

describe("ifFnAsync", () => {
  const isEmptyMock = isEmpty as unknown as jest.Mock;
  const isPromiseMock = isPromise as unknown as jest.Mock;

  // Mocking HandlebarsOptions
  const mockFn = jest.fn();
  const mockInverse = jest.fn();
  const options = {
    fn: mockFn,
    inverse: mockInverse,
    hash: {}
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if number of arguments is not equal to 2", async () => {
    await expect((ifFnAsync as any).call({}, {}, {}, 123)).rejects.toThrow("#if requires exactly one argument");
  });

  it("should handle conditional as a function", async () => {
    const conditional = jest.fn().mockReturnValue(true);
    
    await ifFnAsync.call({}, conditional, options);
    expect(conditional).toHaveBeenCalled();
    expect(mockFn).toHaveBeenCalled();
  });

  it("should handle conditional as a promise", async () => {
    isPromiseMock.mockReturnValue(true);
    const conditional = Promise.resolve(true);
    
    await ifFnAsync.call({}, conditional, options);
    expect(mockFn).toHaveBeenCalled();
  });

  it("should handle zero when includeZero is false", async () => {
    const conditional = 0;
    (options.hash as any).includeZero = false;
    isEmptyMock.mockReturnValue(false);

    await ifFnAsync.call({}, conditional, options);
    expect(mockInverse).toHaveBeenCalled();
  });

  it("should handle zero when includeZero is true", async () => {
    const conditional = 0;
    (options.hash as any).includeZero = true;
    isEmptyMock.mockReturnValue(false);

    await ifFnAsync.call({}, conditional, options);
    expect(mockFn).toHaveBeenCalled();
  });

  it("should call inverse if conditional is empty", async () => {
    const conditional = null;
    isEmptyMock.mockReturnValue(true);

    await ifFnAsync.call({}, conditional, options);
    expect(mockInverse).toHaveBeenCalled();
  });

  it("should call fn if conditional is truthy and not empty", async () => {
    const conditional = "not empty";
    isEmptyMock.mockReturnValue(false);

    await ifFnAsync.call({}, conditional, options);
    expect(mockFn).toHaveBeenCalled();
  });
});