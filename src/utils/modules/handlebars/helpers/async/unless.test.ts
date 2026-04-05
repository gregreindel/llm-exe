import { unlessFnAsync } from "./unless";
import { ifFnAsync } from "./if";

jest.mock("./if");

describe("unlessFnAsync", () => {
  const fn = jest.fn();
  const inverse = jest.fn();
  const ifFnAsyncMock = ifFnAsync as jest.MockedFunction<typeof ifFnAsync>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error if arguments length is not 2", async () => {
    await expect((unlessFnAsync as any).call({})).rejects.toThrow(
      "#unless requires exactly one argument"
    );
  });

  it("should call ifFnAsync with fn and inverse swapped", async () => {
    ifFnAsyncMock.mockResolvedValue("result");

    const context = { key: "value" };
    const options = { fn, inverse, hash: { includeZero: true } };

    await unlessFnAsync.call(context, "conditional", options);

    expect(ifFnAsyncMock).toHaveBeenCalledWith("conditional", {
      fn: inverse,
      inverse: fn,
      hash: { includeZero: true },
    });
  });

  it("should return the result from ifFnAsync", async () => {
    ifFnAsyncMock.mockResolvedValue("unless result");

    const result = await unlessFnAsync.call({}, false, {
      fn,
      inverse,
      hash: {},
    });

    expect(result).toBe("unless result");
  });
});
