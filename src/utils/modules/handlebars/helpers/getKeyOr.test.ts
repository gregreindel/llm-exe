import { get } from "@/utils";
import { getKeyOr } from "./getKeyOr";

jest.mock("@/utils", () => ({
  get: jest.fn(),
}));

describe("getKeyOr", () => {
  const getMock = get as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the result of get if it is defined and non-empty", () => {
    const context = { someKey: "someValue" };
    getMock.mockImplementation((ctx, key) => ctx[key]);

    const result = getKeyOr.call(context, "someKey", "defaultValue");

    expect(result).toEqual("someValue");
    expect(getMock).toHaveBeenCalledWith(context, "someKey");
  });

  it("should return the default value if the result of get is undefined", () => {
    const context = { someKey: undefined };
    getMock.mockImplementation((ctx, key) => ctx[key]);

    const result = getKeyOr.call(context, "someKey", "defaultValue");

    expect(result).toEqual("defaultValue");
    expect(getMock).toHaveBeenCalledWith(context, "someKey");
  });

  it("should return the default value if the result of get is an empty string", () => {
    const context = { someKey: "" };
    getMock.mockImplementation((ctx, key) => ctx[key]);

    const result = getKeyOr.call(context, "someKey", "defaultValue");

    expect(result).toEqual("defaultValue");
    expect(getMock).toHaveBeenCalledWith(context, "someKey");
  });

  it("should return the default value if the key does not exist in context", () => {
    const context = { anotherKey: "someValue" };
    getMock.mockImplementation((ctx, key) => ctx[key]);

    const result = getKeyOr.call(context, "missingKey", "defaultValue");

    expect(result).toEqual("defaultValue");
    expect(getMock).toHaveBeenCalledWith(context, "missingKey");
  });

  it("should handle null or undefined context safely", () => {
    getMock.mockImplementation((ctx, key) => ctx ? ctx[key] : undefined);

    let result = getKeyOr.call(null, "someKey", "defaultValue");
    expect(result).toEqual("defaultValue");
    expect(getMock).toHaveBeenCalledWith(null, "someKey");

    result = getKeyOr.call(undefined, "someKey", "defaultValue");
    expect(result).toEqual("defaultValue");
    expect(getMock).toHaveBeenCalledWith(undefined, "someKey");
  });
});