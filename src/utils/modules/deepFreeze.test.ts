import { deepFreeze } from "@/utils/modules/deepFreeze";

describe("deepFreeze", () => {
  it("should return null if null is provided", () => {
    const result = deepFreeze(null);
    expect(result).toBeNull();
  });

  it("should return undefined if undefined is provided", () => {
    const result = deepFreeze(undefined);
    expect(result).toBeUndefined();
  });

  it("should freeze Date objects correctly", () => {
    const date = new Date();
    const result = deepFreeze(date);
    expect(result).toEqual(date);
    expect(result).not.toBe(date);
  });

  it("should freeze arrays correctly", () => {
    const array = [1, { a: "a" }, [3, 4]];
    const result = deepFreeze(array);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result[1])).toBe(true);
    expect(Object.isFrozen(result[2])).toBe(true);
  });

  it("should freeze objects correctly", () => {
    const obj = { a: 1, b: { c: 2 }, d: [3, 4] };
    const result = deepFreeze(obj);
    expect(Object.isFrozen(result)).toBe(true);
    expect(Object.isFrozen(result.b)).toBe(true);
    expect(Object.isFrozen(result.d)).toBe(true);
  });

  it("should handle primitive types correctly", () => {
    const number = 42;
    const str = "hello";
    const bool = true;
    const symbol = Symbol("sym");
    const bigint = BigInt(123);
    const func = () => {};

    expect(deepFreeze(number)).toBe(number);
    expect(deepFreeze(str)).toBe(str);
    expect(deepFreeze(bool)).toBe(bool);
    expect(deepFreeze(symbol)).toBe(symbol);
    expect(deepFreeze(bigint)).toBe(bigint);
    expect(deepFreeze(func)).toBe(func);
  });
});