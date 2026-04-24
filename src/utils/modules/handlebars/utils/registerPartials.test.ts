import Handlebars from "handlebars";
import { _registerPartials } from "./registerPartials";

describe("_registerPartials", () => {
  let instance: typeof Handlebars;

  beforeEach(() => {
    instance = Handlebars.create();
  });

  it("should register valid partials on the instance", () => {
    _registerPartials([{ name: "myPartial", template: "<p>Hello</p>" }], instance);
    expect(instance.partials.myPartial).toBe("<p>Hello</p>");
  });

  it("should register multiple partials", () => {
    _registerPartials(
      [
        { name: "p1", template: "template1" },
        { name: "p2", template: "template2" },
      ],
      instance
    );
    expect(instance.partials.p1).toBe("template1");
    expect(instance.partials.p2).toBe("template2");
  });

  it("should skip partials with non-string name", () => {
    _registerPartials([{ name: 42, template: "test" }] as any, instance);
    expect((instance.partials as any)[42]).toBeUndefined();
  });

  it("should skip partials with non-string template", () => {
    _registerPartials([{ name: "bad", template: 123 }] as any, instance);
    expect(instance.partials.bad).toBeUndefined();
  });

  it("should skip partials with missing name", () => {
    _registerPartials([{ template: "test" }] as any, instance);
  });

  it("should skip partials with empty string name", () => {
    _registerPartials([{ name: "", template: "test" }], instance);
    expect(instance.partials[""]).toBeUndefined();
  });

  it("should handle null/undefined instance gracefully", () => {
    expect(() =>
      _registerPartials([{ name: "test", template: "t" }], null as any)
    ).not.toThrow();
  });

  it("should handle null partials array", () => {
    expect(() => _registerPartials(null as any, instance)).not.toThrow();
  });

  it("should handle undefined partials array", () => {
    expect(() => _registerPartials(undefined as any, instance)).not.toThrow();
  });

  it("should handle non-array partials argument", () => {
    expect(() => _registerPartials("not an array" as any, instance)).not.toThrow();
  });

  it("should handle empty partials array", () => {
    const initialPartials = { ...instance.partials };
    _registerPartials([], instance);
    expect(instance.partials).toEqual(initialPartials);
  });
});
