import { pick } from "./pick";

describe("pick function", () => {
  interface TestObject {
    name: string;
    age: number;
    job: string;
    active: boolean;
  }

  let obj: TestObject;

  beforeEach(() => {
    obj = { name: "John", age: 30, job: "Developer", active: true };
  });

  it("should pick the specified keys from the object", () => {
    const result = pick(obj, ["name", "job"]);
    expect(result).toEqual({ name: "John", job: "Developer" });
  });

  it("should return an empty object if none of the keys are present", () => {
    const result = pick(obj, ["salary"] as any);
    expect(result).toEqual({});
  });

  it("should return an empty object if keys array is empty", () => {
    const result = pick(obj, []);
    expect(result).toEqual({});
  });

  it("should handle a key that exists and a key that does not exist", () => {
    const result = pick(obj, ["name", "salary"] as any);
    expect(result).toEqual({ name: "John" });
  });

  it("should handle an empty object", () => {
    const result = pick({} as any, ["name"]);
    expect(result).toEqual({});
  });
  
  it("should handle null as object", () => {
    const result = pick(null as any, ["name"]);
    expect(result).toEqual({});
  });

  it("should handle undefined as object", () => {
    const result = pick(undefined as any, ["name"]);
    expect(result).toEqual({});
  });

  it("should not mutate the original object", () => {
    const originalObj = { ...obj };
    pick(obj, ["name", "job"]);
    expect(obj).toEqual(originalObj);
  });
});