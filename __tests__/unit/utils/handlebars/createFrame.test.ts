import { extend } from "@/utils/modules/extend";
import { createFrame } from "@/utils/modules/handlebars/utils/createFrame";

jest.mock("@/utils/modules/extend", () => ({
  extend: jest.fn(),
}));

describe("createFrame", () => {
  const extendMock = extend as jest.Mock<any>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new frame with the extended object", () => {
    const inputObject = { key: "value" };
    const extendedObject = { key: "value", _parent: {} };

    extendMock.mockReturnValueOnce(extendedObject);

    const result = createFrame(inputObject);

    expect(extendMock).toHaveBeenCalledWith({}, inputObject);
    expect(result).toBe(extendedObject);
    expect(result._parent).toBe(inputObject);
  });

  it("should create a frame with the _parent property set to the input object", () => {
    const inputObject = { key: "value" };
    const extendedObject: any = { key: "value" };

    extendMock.mockReturnValueOnce(extendedObject);

    const result = createFrame(inputObject);

    expect(result._parent).toBe(inputObject);
  });

  it("should handle an empty object", () => {
    const inputObject = {};
    const extendedObject: any = {};

    extendMock.mockReturnValueOnce(extendedObject);

    const result = createFrame(inputObject);

    expect(extendMock).toHaveBeenCalledWith({}, inputObject);
    expect(result._parent).toBe(inputObject);
  });

  it("should handle null properties gracefully", () => {
    const inputObject: any = { key: null };
    const extendedObject: any = { key: null };

    extendMock.mockReturnValueOnce(extendedObject);

    const result = createFrame(inputObject);

    expect(extendMock).toHaveBeenCalledWith({}, inputObject);
    expect(result._parent).toBe(inputObject);
  });

  it("should handle undefined properties gracefully", () => {
    const inputObject: any = { key: undefined };
    const extendedObject: any = { key: undefined };

    extendMock.mockReturnValueOnce(extendedObject);

    const result = createFrame(inputObject);

    expect(extendMock).toHaveBeenCalledWith({}, inputObject);
    expect(result._parent).toBe(inputObject);
  });
});