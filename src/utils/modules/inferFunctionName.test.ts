import { inferFunctionName } from "./inferFunctionName";

describe("inferFunctionName", () => {
  it("should return the function name for a named function with no prefix", () => {
    function testFunction() {}
    const result = inferFunctionName(testFunction, "defaultName");
    expect(result).toBe("testFunction");
  });

  it("should return the function name for a named function with a prefix", () => {
    function testFunction() {}
    const boundFunction = testFunction.bind({});
    const result = inferFunctionName(boundFunction, "defaultName");
    expect(result).toBe("testFunction");
  });

  it('should return the function name without "bound" prefix for a named function with "bound" prefix', () => {
    const func = function testFunc() {};
    const defaultName = "defaultName";
    const result = inferFunctionName(func.bind({}), defaultName);
    expect(result).toBe("testFunc");
  });

  it("should return default name for anonymous function when no name is provided", () => {
    const defaultName = "defaultName";
    expect(inferFunctionName(() => {}, defaultName)).toEqual(defaultName);
  });

  it("should return default name when input is not a function", () => {
    const defaultName = "defaultName";
    expect(inferFunctionName(null, defaultName)).toBe(defaultName);
    expect(inferFunctionName(undefined, defaultName)).toBe(defaultName);
    expect(inferFunctionName("string", defaultName)).toBe(defaultName);
    expect(inferFunctionName(123, defaultName)).toBe(defaultName);
    expect(inferFunctionName({}, defaultName)).toBe(defaultName);
    expect(inferFunctionName([], defaultName)).toBe(defaultName);
  });
});
