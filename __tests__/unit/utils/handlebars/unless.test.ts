import { ifFnAsync } from "@/utils/modules/handlebars/helpers/async/if";
import { unlessFnAsync } from "@/utils/modules/handlebars/helpers/async/unless";

jest.mock("@/utils/modules/handlebars/helpers/async/if", () => ({
  ifFnAsync: jest.fn(),
}));

describe("unlessFnAsync", () => {
  const ifFnAsyncMock = ifFnAsync as jest.Mock;

  const options = {
    fn: jest.fn().mockReturnValue("fn result"),
    inverse: jest.fn().mockReturnValue("inverse result"),
    hash: {
      key: "value",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw an error when called with incorrect number of arguments", async () => {
    await expect((unlessFnAsync as any).call({}, true)).rejects.toThrow(
      "#unless requires exactly one argument"
    );
  });

  it("should call ifFnAsync with correct arguments when conditional is true", async () => {
    const context = {
      key: "context value"
    };
    
    const conditional = true;
    
    await unlessFnAsync.call(context, conditional, options);

    expect(ifFnAsyncMock).toHaveBeenCalledWith(conditional, {
      fn: options.inverse,
      inverse: options.fn,
      hash: options.hash,
    });
  });

  it("should call ifFnAsync with correct arguments when conditional is false", async () => {
    const context = {
      key: "context value"
    };
    
    const conditional = false;

    await unlessFnAsync.call(context, conditional, options);

    expect(ifFnAsyncMock).toHaveBeenCalledWith(conditional, {
      fn: options.inverse,
      inverse: options.fn,
      hash: options.hash,
    });
  });

  it("should correctly handle the provided context", async () => {
    const context = {
      key: "context value"
    };

    const conditional = true;
    ifFnAsyncMock.mockResolvedValue("resolved value");

    const result = await unlessFnAsync.call(context, conditional, options);

    expect(ifFnAsyncMock).toHaveBeenCalledWith(conditional, {
      fn: options.inverse,
      inverse: options.fn,
      hash: options.hash,
    });

    expect(result).toBe("resolved value");
  });

  it("should return the result of ifFnAsync", async () => {
    const conditional = true;
    ifFnAsyncMock.mockResolvedValue("expected result");

    const result = await unlessFnAsync.call({}, conditional, options);

    expect(result).toBe("expected result");
  });
});