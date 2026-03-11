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
    expect(isReadableStream("stream")).toBeFalsy();
  });

  it("should return false for a number", () => {
    expect(isReadableStream(42)).toBeFalsy();
  });

  it("should return false for an object missing pipe", () => {
    expect(isReadableStream({ _read: () => {} })).toBeFalsy();
  });

  it("should return false for an object missing _read", () => {
    expect(isReadableStream({ pipe: () => {} })).toBeFalsy();
  });

  it("should return false for an object where pipe is not a function", () => {
    expect(isReadableStream({ pipe: "not a function", _read: () => {} })).toBeFalsy();
  });

  it("should return false for an object where _read is not a function", () => {
    expect(isReadableStream({ pipe: () => {}, _read: "not a function" })).toBeFalsy();
  });

  it("should return false for an empty object", () => {
    expect(isReadableStream({})).toBeFalsy();
  });

  it("should return false for an array", () => {
    expect(isReadableStream([])).toBeFalsy();
  });

  it("should return true for an object with additional properties", () => {
    const stream = {
      pipe: () => {},
      _read: () => {},
      destroy: () => {},
      readable: true,
    };
    expect(isReadableStream(stream)).toBe(true);
  });
});
