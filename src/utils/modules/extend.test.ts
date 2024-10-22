import { extend } from "@/utils/modules/extend";

describe("extend", () => {
  let target: Record<string, any>;

  beforeEach(() => {
    target = { a: 1 };
  });

  it("should handle a single source object", () => {
    const source = { b: 2 };
    const result = extend(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should override properties from the source object", () => {
    const source = { a: 2 };
    const result = extend(target, source);
    expect(result).toEqual({ a: 2 });
  });

  it("should handle no source object provided", () => {
    const result = extend(target);
    expect(result).toEqual({ a: 1 });
  });

  it("should not fail on empty source objects", () => {
    const result = extend(target, {});
    expect(result).toEqual({ a: 1 });
  });

  it("should handle non-enumerable properties", () => {
    const source = { b: 2 };
    Object.defineProperty(source, "c", {
      value: 3,
      enumerable: false,
    });
    const result = extend(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it("should not add properties from prototype chain", () => {
    const source = Object.create({ prototypeProp: 3 });
    source.b = 2;
    const result = extend(target, source);
    expect(result).toEqual({ a: 1, b: 2 });
    expect(result).not.toHaveProperty("prototypeProp");
  });
});