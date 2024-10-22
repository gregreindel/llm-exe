import { getOr } from "./getOr";

describe("getOr", () => {

  it("should return arg1 when arg1 is defined and not an empty string", () => {
    expect(getOr("value1", "value2")).toBe("value1");
  });

  it("should return arg2 when arg1 is undefined", () => {
    expect(getOr(undefined as any, "value2")).toBe("value2");
  });

  it("should return arg2 when arg1 is an empty string", () => {
    expect(getOr("", "value2")).toBe("value2");
  });

  it("should return arg1 when both arg1 and arg2 are non-empty strings", () => {
    expect(getOr("value1", "value2")).toBe("value1");
  });

  it("should return arg2 when both arg1 and arg2 are empty strings", () => {
    // Special edge case and weird usage but for full coverage
    expect(getOr("", "")).toBe("");
  });

  it("should return arg2 when both arg1 is undefined and arg2 is empty string", () => {
    // Special edge case and weird usage but for full coverage
    expect(getOr(undefined as any, "")).toBe("");
  });

  it("should return arg1 when arg1 is a non-empty string and arg2 is an empty string", () => {
    // Special edge case and weird usage but for full coverage
    expect(getOr("value1", "")).toBe("value1");
  });

});