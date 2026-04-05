import { ifFnAsync } from "./if";
import { isEmpty } from "@/utils/modules/isEmpty";

jest.mock("@/utils/modules/isEmpty");

describe("ifFnAsync", () => {
  const fn = jest.fn();
  const inverse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if arguments length is not 2", async () => {
    await expect((ifFnAsync as any).call({})).rejects.toThrow(
      "#if requires exactly one argument"
    );
  });

  it("should resolve a promise conditional before evaluating", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    fn.mockReturnValue("truthy result");

    const conditionalPromise = Promise.resolve("resolved value");
    await ifFnAsync.call({}, conditionalPromise, { fn, inverse, hash: {} });

    expect(fn).toHaveBeenCalled();
    expect(inverse).not.toHaveBeenCalled();
  });

  it("should call the conditional function if conditional is a function", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    fn.mockReturnValue("result");

    const conditional = jest.fn().mockReturnValue(true);
    await ifFnAsync.call({}, conditional, { fn, inverse, hash: {} });

    expect(conditional).toHaveBeenCalled();
    expect(fn).toHaveBeenCalled();
  });

  it("should call options.fn if conditional is truthy and not empty", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    fn.mockReturnValue("truthy");

    await ifFnAsync.call({}, true, { fn, inverse, hash: {} });

    expect(fn).toHaveBeenCalled();
    expect(inverse).not.toHaveBeenCalled();
  });

  it("should call options.inverse if conditional is falsy", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(true);
    inverse.mockReturnValue("falsy");

    await ifFnAsync.call({}, false, { fn, inverse, hash: {} });

    expect(inverse).toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
  });

  it("should call options.fn if conditional is 0 and includeZero is true", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    fn.mockReturnValue("zero included");

    await ifFnAsync.call({}, 0, { fn, inverse, hash: { includeZero: true } });

    expect(fn).toHaveBeenCalled();
    expect(inverse).not.toHaveBeenCalled();
  });

  it("should call options.inverse if conditional is 0 and includeZero is false", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(true);
    inverse.mockReturnValue("zero excluded");

    await ifFnAsync.call({}, 0, { fn, inverse, hash: { includeZero: false } });

    expect(inverse).toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
  });

  it("should handle a promise that resolves to a falsy value", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(true);
    inverse.mockReturnValue("inverse result");

    const conditionalPromise = Promise.resolve(null);
    await ifFnAsync.call({}, conditionalPromise, { fn, inverse, hash: {} });

    expect(inverse).toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
  });
});
