import { _registerPartials } from "./registerPartials";

describe("_registerPartials", () => {
  let mockInstance: { registerPartial: jest.Mock };

  beforeEach(() => {
    mockInstance = { registerPartial: jest.fn() };
  });

  it("should register partials with valid name and template", () => {
    const partials = [{ name: "myPartial", template: "<div>content</div>" }];

    _registerPartials(partials, mockInstance as any);

    expect(mockInstance.registerPartial).toHaveBeenCalledWith(
      "myPartial",
      "<div>content</div>"
    );
  });

  it("should register multiple partials", () => {
    const partials = [
      { name: "partial1", template: "<p>one</p>" },
      { name: "partial2", template: "<p>two</p>" },
    ];

    _registerPartials(partials, mockInstance as any);

    expect(mockInstance.registerPartial).toHaveBeenCalledTimes(2);
    expect(mockInstance.registerPartial).toHaveBeenCalledWith("partial1", "<p>one</p>");
    expect(mockInstance.registerPartial).toHaveBeenCalledWith("partial2", "<p>two</p>");
  });

  it("should skip partials with missing name", () => {
    const partials = [{ template: "<div>content</div>" }];

    _registerPartials(partials as any, mockInstance as any);

    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should skip partials with non-string name", () => {
    const partials = [{ name: 42, template: "<div>content</div>" }];

    _registerPartials(partials as any, mockInstance as any);

    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should skip partials with non-string template", () => {
    const partials = [{ name: "myPartial", template: 123 }];

    _registerPartials(partials as any, mockInstance as any);

    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should skip partials with missing template", () => {
    const partials = [{ name: "myPartial" }];

    _registerPartials(partials as any, mockInstance as any);

    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should handle null partials array", () => {
    _registerPartials(null as any, mockInstance as any);

    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should handle undefined partials array", () => {
    _registerPartials(undefined as any, mockInstance as any);

    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should handle non-array partials value", () => {
    _registerPartials({} as any, mockInstance as any);

    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should handle empty partials array", () => {
    _registerPartials([], mockInstance as any);

    expect(mockInstance.registerPartial).not.toHaveBeenCalled();
  });

  it("should not register if instance is null/undefined", () => {
    const partials = [{ name: "myPartial", template: "<div>content</div>" }];

    expect(() => _registerPartials(partials, null as any)).not.toThrow();
    expect(() => _registerPartials(partials, undefined as any)).not.toThrow();
  });
});
