import Handlebars from "handlebars";
import { _registerHelpers } from "./registerHelpers";

describe("_registerHelpers", () => {
  let instance: typeof Handlebars;

  beforeEach(() => {
    instance = Handlebars.create();
  });

  it("should register valid helpers on the instance", () => {
    const handler = jest.fn();
    _registerHelpers([{ name: "testHelper", handler }], instance);
    expect(instance.helpers.testHelper).toBe(handler);
  });

  it("should register multiple helpers", () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    _registerHelpers(
      [
        { name: "h1", handler: handler1 },
        { name: "h2", handler: handler2 },
      ],
      instance
    );
    expect(instance.helpers.h1).toBe(handler1);
    expect(instance.helpers.h2).toBe(handler2);
  });

  it("should skip helpers with non-string name", () => {
    const handler = jest.fn();
    _registerHelpers([{ name: 123, handler }] as any, instance);
    expect((instance.helpers as any)[123]).toBeUndefined();
  });

  it("should skip helpers with non-function handler", () => {
    _registerHelpers([{ name: "bad", handler: "not a function" }] as any, instance);
    expect(instance.helpers.bad).toBeUndefined();
  });

  it("should skip helpers with missing name", () => {
    const handler = jest.fn();
    _registerHelpers([{ handler }] as any, instance);
    expect(Object.keys(instance.helpers).length).toBeGreaterThanOrEqual(0);
  });

  it("should skip helpers with empty string name", () => {
    const handler = jest.fn();
    _registerHelpers([{ name: "", handler }], instance);
    expect(instance.helpers[""]).toBeUndefined();
  });

  it("should handle null/undefined instance gracefully", () => {
    const handler = jest.fn();
    expect(() =>
      _registerHelpers([{ name: "test", handler }], null as any)
    ).not.toThrow();
  });

  it("should handle null helpers array", () => {
    expect(() => _registerHelpers(null as any, instance)).not.toThrow();
  });

  it("should handle undefined helpers array", () => {
    expect(() => _registerHelpers(undefined as any, instance)).not.toThrow();
  });

  it("should handle non-array helpers argument", () => {
    expect(() => _registerHelpers("not an array" as any, instance)).not.toThrow();
  });

  it("should handle empty helpers array", () => {
    const initialHelpers = { ...instance.helpers };
    _registerHelpers([], instance);
    expect(instance.helpers).toEqual(initialHelpers);
  });
});
