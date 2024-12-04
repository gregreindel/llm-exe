import { get } from "./get";

describe("get", () => {
  interface TestObj {
    [key: string]: any;
  }

  let obj: TestObj;

  beforeEach(() => {
    obj = {
      a: {
        b: {
          c: 1,
          d: null,
          e: undefined,
        },
      },
      f: [1, 2, { g: 3 }]
    };
  });

  it("should return default value if obj is null", () => {
    expect(get(null as any, 'a.b.c', 'default')).toBe('default');
  });

  it("should return default value if obj is undefined", () => {
    expect(get(undefined as any, 'a.b.c', 'default')).toBe('default');
  });

  it("should return value at the given path if obj is valid", () => {
    expect(get(obj, 'a.b.c')).toBe(1);
  });

  it("should return default value if path does not exist", () => {
    expect(get(obj, 'a.b.x', 'default')).toBe('default');
  });

  it("should return the default value if the result is null", () => {
    expect(get(obj, 'a.b.d', 'default')).toBe('default');
  });

  it("should return the default value if the result is undefined", () => {
    expect(get(obj, 'a.b.e', 'default')).toBe('default');
  });

  it("should work with paths as an array of keys", () => {
    expect(get(obj, ['a', 'b', 'c'])).toBe(1);
    expect(get(obj, ['f', 2, 'g'])).toBe(3);
  });

  it("should work with paths containing array indices", () => {
    expect(get(obj, 'f[2].g')).toBe(3);
    expect(get(obj, 'f[1]')).toBe(2);
  });

  it("should return default value for non-existing array index", () => {
    expect(get(obj, 'f[3]', 'default')).toBe('default');
  });

  it("should handle complex paths gracefully", () => {
    expect(get(obj, 'a[b][c]', 'default')).toBe(1);
    expect(get(obj, 'a.b.c', 'default')).toBe(1);
    expect(get(obj, 'f[2][g]', 'default')).toBe(3);
  });

  it("should return default if path is empty", () => {
    expect(get(obj, '', 'default')).toBe('default');
    expect(get(obj, [])).toBe(undefined);
  });
  it("should return the default value if the reduce function returns undefined or an unexpected value", () => {
    const malformedObj = { a: { b: undefined } };
    expect(get(malformedObj, 'a.b.c', 'default')).toBe('default');
  });
});