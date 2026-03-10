import { isReadableStream } from "./isReadableStream";

describe("isReadableStream", () => {
  it("should return true for an object with pipe and _read functions", () => {
    const stream = {
      pipe: () => {},
      _read: () => {},
    };
    expect(isReadableStream(stream)).toBe(true);
  });

  it("should return false for null", () => {
    expect(isReadableStream(null)).toBeFalsy();
  });

  it("should return false for undefined", () => {
    expect(isReadableStream(undefined)).toBeFalsy();
  });

  it("should return false for a string", () => {
    expect(isReadableStream("hello")).toBe(false);
  });

  it("should return false for a number", () => {
    expect(isReadableStream(42)).toBe(false);
  });

  it("should return false for an empty object", () => {
    expect(isReadableStream({})).toBe(false);
  });

  it("should return false for an object with only pipe", () => {
    expect(isReadableStream({ pipe: () => {} })).toBe(false);
  });

  it("should return false for an object with only _read", () => {
    expect(isReadableStream({ _read: () => {} })).toBe(false);
  });

  it("should return false when pipe is not a function", () => {
    expect(isReadableStream({ pipe: "not a function", _read: () => {} })).toBe(
      false
    );
  });

  it("should return false when _read is not a function", () => {
    expect(isReadableStream({ pipe: () => {}, _read: "not a function" })).toBe(
      false
    );
  });

  it("should return false for an array", () => {
    expect(isReadableStream([1, 2, 3])).toBe(false);
  });

  it("should return false for a boolean", () => {
    expect(isReadableStream(false)).toBeFalsy();
  });
});
