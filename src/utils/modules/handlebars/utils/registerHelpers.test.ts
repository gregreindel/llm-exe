import { _registerHelpers } from "./registerHelpers";

describe("_registerHelpers", () => {
  let mockInstance: { registerHelper: jest.Mock };

  beforeEach(() => {
    mockInstance = { registerHelper: jest.fn() };
  });

  it("should register helpers with valid name and handler", () => {
    const handler = jest.fn();
    const helpers = [{ name: "myHelper", handler }];

    _registerHelpers(helpers, mockInstance as any);

    expect(mockInstance.registerHelper).toHaveBeenCalledWith("myHelper", handler);
  });

  it("should register multiple helpers", () => {
    const handler1 = jest.fn();
    const handler2 = jest.fn();
    const helpers = [
      { name: "helper1", handler: handler1 },
      { name: "helper2", handler: handler2 },
    ];

    _registerHelpers(helpers, mockInstance as any);

    expect(mockInstance.registerHelper).toHaveBeenCalledTimes(2);
    expect(mockInstance.registerHelper).toHaveBeenCalledWith("helper1", handler1);
    expect(mockInstance.registerHelper).toHaveBeenCalledWith("helper2", handler2);
  });

  it("should skip helpers with missing name", () => {
    const helpers = [{ handler: jest.fn() }];

    _registerHelpers(helpers as any, mockInstance as any);

    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should skip helpers with non-string name", () => {
    const helpers = [{ name: 123, handler: jest.fn() }];

    _registerHelpers(helpers as any, mockInstance as any);

    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should skip helpers with non-function handler", () => {
    const helpers = [{ name: "myHelper", handler: "not a function" }];

    _registerHelpers(helpers as any, mockInstance as any);

    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should handle null helpers array", () => {
    _registerHelpers(null as any, mockInstance as any);

    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should handle undefined helpers array", () => {
    _registerHelpers(undefined as any, mockInstance as any);

    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should handle non-array helpers value", () => {
    _registerHelpers("not an array" as any, mockInstance as any);

    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should handle empty helpers array", () => {
    _registerHelpers([], mockInstance as any);

    expect(mockInstance.registerHelper).not.toHaveBeenCalled();
  });

  it("should not register if instance is null/undefined", () => {
    const helpers = [{ name: "myHelper", handler: jest.fn() }];

    expect(() => _registerHelpers(helpers, null as any)).not.toThrow();
    expect(() => _registerHelpers(helpers, undefined as any)).not.toThrow();
  });
});
