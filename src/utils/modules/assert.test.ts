import { assert } from "@/utils";

describe("assert", () => {
  it("assert should throw", () => {
    expect(() => assert(false, "Custom Message")).toThrowError("Custom Message");
  });
  it("assert should throw", () => {
    let condition: any;
    expect(() => assert(condition, "Custom Message")).toThrowError("Custom Message");
  });
  it("assert should throw", () => {
    let condition: any = null;
    expect(() => assert(condition, "Custom Message")).toThrowError("Custom Message");
  });
  it("assert should throw", () => {
    expect(() => assert(true, "Custom Message")).not.toThrowError("Custom Message");
  });
  it("assert should throw with default message", () => {
    expect(() => assert(false)).toThrowError("Assertion error");
  });
  it("assert should throw with default message", () => {
    expect(() => assert(false, new Error("Passed in error"))).toThrowError("Passed in error");
  });
});
