import { deepClone } from "@/utils/modules/deepClone";

describe("deepClone", () => {
  it("should handle null", () => {
    const result = deepClone(null);
    expect(result).toBeNull();
  });

  it("should handle undefined", () => {
    const result = deepClone(undefined);
    expect(result).toBeUndefined();
  });

  it("should handle Date", () => {
    const date = new Date();
    const clonedDate = deepClone(date);
    expect(clonedDate).toEqual(date);
    expect(clonedDate).not.toBe(date); // Ensure it's a different instance
  });

  it("should handle Array", () => {
    const array = [1, "test", { foo: "bar" }, [2, 3]];
    const clonedArray = deepClone(array);
    expect(clonedArray).toEqual(array);
    expect(clonedArray).not.toBe(array); // Ensure it's a different instance
    expect(clonedArray[2]).not.toBe(array[2]); // Ensure nested objects are different instances
    expect(clonedArray[3]).not.toBe(array[3]); // Ensure nested arrays are different instances
  });

  it("should handle Object", () => {
    const obj = { a: 1, b: "test", c: { foo: "bar" }, d: [4, 5] };
    const clonedObj = deepClone(obj);
    expect(clonedObj).toEqual(obj);
    expect(clonedObj).not.toBe(obj); // Ensure it's a different instance
    expect(clonedObj.c).not.toBe(obj.c); // Ensure nested objects are different instances
    expect(clonedObj.d).not.toBe(obj.d); // Ensure nested arrays are different instances
  });

  it("should handle primitive types (number, string, boolean, symbol, bigint, function)", () => {
    const num = 42;
    expect(deepClone(num)).toBe(num);

    const str = "hello";
    expect(deepClone(str)).toBe(str);

    const bool = true;
    expect(deepClone(bool)).toBe(bool);

    const sym = Symbol("sym");
    expect(deepClone(sym)).toBe(sym);

    const bigInt = BigInt(9007199254740991);
    expect(deepClone(bigInt)).toBe(bigInt);

    const func = (x: number) => x * 2;
    expect(deepClone(func)).toBe(func);
  });
});