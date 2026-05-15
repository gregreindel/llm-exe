import { _registerHelpers } from "@/utils/modules/handlebars/utils/registerHelpers";

describe("_registerHelpers", () => {
  const mockInstance = {
    registerHelper: jest.fn(),
  } as unknown as typeof Handlebars;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register helpers with valid name and handler", () => {
    const helpers = [
      { name: "myHelper", handler: () => "result" },
    ];
    _registerHelpers(helpers, mockInstance);
    expect(mockInstance.registerHelper).toHaveBeenCalledWith(
      "myHelper",
      helpers[0].handler
    );
  });

  it("should register multiple helpers", () => {
    const helpers = [
      { name: "helper1", handler: () => "a" },
      { name: "helper2", handler: () => "b" },
      { name: "helper3", handler: () => "c" },
    ];
    _registerHelpers(helpers, mockInstance);
    expect(mockInstance.registerHelper).toHaveBeenCalledTimes(3);
  });

  it("should skip helpers without a name", () => {
    const helpers = [
      { name: "", handler: () => "result" },
      { handler: () => "result" },
    ];
    _registerHelpers(helpers as any, mockInstance);
    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should skip helpers with non-string name", () => {
    const helpers = [
      { name: 123, handler: () => "result" },
    ];
    _registerHelpers(helpers as any, mockInstance);
    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should skip helpers without a handler function", () => {
    const helpers = [
      { name: "myHelper", handler: "not a function" },
      { name: "myHelper2" },
    ];
    _registerHelpers(helpers as any, mockInstance);
    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should handle null input", () => {
    _registerHelpers(null as any, mockInstance);
    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should handle undefined input", () => {
    _registerHelpers(undefined as any, mockInstance);
    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should handle non-array input", () => {
    _registerHelpers("not an array" as any, mockInstance);
    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should handle empty array", () => {
    _registerHelpers([], mockInstance);
    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should not register when instance is falsy", () => {
    const helpers = [
      { name: "myHelper", handler: () => "result" },
    ];
    _registerHelpers(helpers, null as any);
    // Should not throw
  });
});
