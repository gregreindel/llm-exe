import { isPromise } from "@/utils/modules/isPromise";

describe("isPromise", () => {
  it("should return true for a native promise", () => {
    const promise = new Promise((resolve) => resolve("test"));
    expect(isPromise(promise)).toBe(true);
  });

  it("should return true for an async function", () => {
    const asyncFunc = async () => "test";
    expect(isPromise(asyncFunc())).toBe(true);
  });

  it("should return true for an object with a then method", () => {
    const thenable = { then: () => {} };
    expect(isPromise(thenable)).toBe(true);
  });

  it("should return false for a non-object non-function value (e.g., string)", () => {
    expect(isPromise("not a promise")).toBe(false);
  });

  it("should return false for a non-object non-function value (e.g., number)", () => {
    expect(isPromise(42)).toBe(false);
  });

  it("should return false for null", () => {
    expect(isPromise(null)).toBe(false);
  });

  it("should return false for undefined", () => {
    expect(isPromise(undefined)).toBe(false);
  });

  it("should return false for a plain object without then method", () => {
    const plainObject = { key: "value" };
    expect(isPromise(plainObject)).toBe(false);
  });

  it("should return false for a function without then method", () => {
    const func = () => {};
    expect(isPromise(func)).toBe(false);
  });

  it("should return false for an array", () => {
    const arr = [1, 2, 3];
    expect(isPromise(arr)).toBe(false);
  });
});