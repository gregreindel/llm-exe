import { isEmpty } from "@/utils/modules/isEmpty";

describe("isEmpty", () => {
  it("should return true for null", () => {
    expect(isEmpty(null)).toBe(true);
  });

  it("should return true for undefined", () => {
    expect(isEmpty(undefined)).toBe(true);
  });

  it("should return true for an empty string", () => {
    expect(isEmpty("")).toBe(true);
  });

  it("should return false for a non-empty string", () => {
    expect(isEmpty("hello")).toBe(false);
  });

  it("should return true for an empty array", () => {
    expect(isEmpty([])).toBe(true);
  });

  it("should return false for a non-empty array", () => {
    expect(isEmpty([1, 2, 3])).toBe(false);
  });

  it("should return false for an object", () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });

  it("should return true for a boolean value of false", () => {
    expect(isEmpty(false)).toBe(true);
  });

  it("should return false for a boolean value of true", () => {
    expect(isEmpty(true)).toBe(false);
  });

  it("should return false for the number 0", () => {
    expect(isEmpty(0)).toBe(false);
  });

  it("should return false for a non-zero number", () => {
    expect(isEmpty(42)).toBe(false);
  });
});