import { _registerPartials } from "@/utils/modules/handlebars/utils/registerPartials";

describe("_registerPartials", () => {
  const mockInstance = {
    registerPartial: jest.fn(),
  } as unknown as typeof Handlebars;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register partials with valid name and template", () => {
    const partials = [
      { name: "myPartial", template: "<div>{{content}}</div>" },
    ];
    _registerPartials(partials, mockInstance);
    expect(mockInstance.registerPartial).toHaveBeenCalledWith(
      "myPartial",
      "<div>{{content}}</div>"
    );
  });

  it("should register multiple partials", () => {
    const partials = [
      { name: "partial1", template: "a" },
      { name: "partial2", template: "b" },
    ];
    _registerPartials(partials, mockInstance);
    expect(mockInstance.registerPartial).toHaveBeenCalledTimes(2);
  });

  it("should skip partials without a name", () => {
    const partials = [
      { name: "", template: "content" },
      { template: "content" },
    ];
    _registerPartials(partials as any, mockInstance);
    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should skip partials with non-string name", () => {
    const partials = [
      { name: 123, template: "content" },
    ];
    _registerPartials(partials as any, mockInstance);
    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should skip partials without a string template", () => {
    const partials = [
      { name: "myPartial", template: 123 },
      { name: "myPartial2" },
    ];
    _registerPartials(partials as any, mockInstance);
    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should handle null input", () => {
    _registerPartials(null as any, mockInstance);
    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should handle undefined input", () => {
    _registerPartials(undefined as any, mockInstance);
    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should handle non-array input", () => {
    _registerPartials("not an array" as any, mockInstance);
    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should handle empty array", () => {
    _registerPartials([], mockInstance);
    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should not register when instance is falsy", () => {
    const partials = [
      { name: "myPartial", template: "content" },
    ];
    _registerPartials(partials, null as any);
    // Should not throw
  });
});
