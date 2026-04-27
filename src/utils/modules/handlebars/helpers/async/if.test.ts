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

  it("should call options.fn if conditional is truthy and not empty", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    await ifFnAsync.call({}, true, { fn, inverse, hash: {} });
    expect(fn).toHaveBeenCalled();
    expect(inverse).not.toHaveBeenCalled();
  });

  it("should call options.inverse if conditional is falsy", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(true);
    await ifFnAsync.call({}, false, { fn, inverse, hash: {} });
    expect(inverse).toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
  });

  it("should resolve a promise conditional before evaluating", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    const promiseConditional = Promise.resolve("truthy value");
    await ifFnAsync.call({}, promiseConditional, { fn, inverse, hash: {} });
    expect(fn).toHaveBeenCalled();
    expect(inverse).not.toHaveBeenCalled();
  });

  it("should resolve a promise that resolves to falsy", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(true);
    const promiseConditional = Promise.resolve(false);
    await ifFnAsync.call({}, promiseConditional, { fn, inverse, hash: {} });
    expect(inverse).toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
  });

  it("should call conditional function if conditional is a function (non-promise)", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    const conditional = jest.fn().mockReturnValue("result");
    await ifFnAsync.call({}, conditional, { fn, inverse, hash: {} });
    expect(conditional).toHaveBeenCalled();
    expect(fn).toHaveBeenCalled();
  });

  it("should call options.fn if conditional is 0 and includeZero is true", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(false);
    await ifFnAsync.call({}, 0, { fn, inverse, hash: { includeZero: true } });
    expect(fn).toHaveBeenCalled();
    expect(inverse).not.toHaveBeenCalled();
  });

  it("should call options.inverse if conditional is 0 and includeZero is false", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(true);
    await ifFnAsync.call({}, 0, { fn, inverse, hash: { includeZero: false } });
    expect(inverse).toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
  });

  it("should call options.inverse if isEmpty returns true for conditional", async () => {
    (isEmpty as unknown as jest.Mock).mockReturnValue(true);
    await ifFnAsync.call({}, [], { fn, inverse, hash: {} });
    expect(inverse).toHaveBeenCalled();
    expect(fn).not.toHaveBeenCalled();
  });
});
