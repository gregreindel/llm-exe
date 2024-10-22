import { deepClone } from "@/utils/modules/deepClone";
import { withDefaultModel } from "./_utils.withDefaultModel";

jest.mock("@/utils/modules/deepClone", () => ({
  deepClone: jest.fn(),
}));

describe("withDefaultModel", () => {
  const deepCloneMock = deepClone as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should set the default model when options.model exists", () => {
    const inputObj: any = {
      options: {
        model: {
          default: "oldModel"
        }
      },
      mapBody: {
        model: {
            key: "model",
          default: "oldModel"
        }
      }
    };
    const expectedObj: any = {
      options: {
        model: {
          default: "newModel"
        }
      },
      mapBody: {
        model: {
            key: "model",
          default: "newModel"
        }
      }
    };
    
    deepCloneMock.mockReturnValue({ ...inputObj });

    const result = withDefaultModel(inputObj, "newModel");
    expect(result).toEqual(expectedObj);
    expect(deepCloneMock).toHaveBeenCalledWith(inputObj);
  });

  it("should create model with default when options.model does not exist", () => {
    const inputObj: any = {
      options: {},
      mapBody: {
        model: {
            key: "model",

          default: "oldModel"
        }
      }
    };
    const expectedObj: any = {
      options: {
        model: {
          default: "newModel"
        }
      },
      mapBody: {
        model: {
            key: "model",

          default: "newModel"
        }
      }
    };

    deepCloneMock.mockReturnValue({ ...inputObj });
    
    const result = withDefaultModel(inputObj, "newModel");
    expect(result).toEqual(expectedObj);
    expect(deepCloneMock).toHaveBeenCalledWith(inputObj);
  });

  it("should create model with default when mapBody.model does not exist", () => {
    const inputObj: any = {
      options: {
        model: {
          default: "oldModel"
        }
      },
      mapBody: {}
    };
    const expectedObj: any = {
      options: {
        model: {

          default: "newModel"
        }
      },
      mapBody: {
        model: {
          key: "model",
          default: "newModel"
        }
      }
    };

    deepCloneMock.mockReturnValue({ ...inputObj });

    const result = withDefaultModel(inputObj, "newModel");
    expect(result).toEqual(expectedObj);
    expect(deepCloneMock).toHaveBeenCalledWith(inputObj);
  });

  it("should create both options.model and mapBody.model when both do not exist", () => {
    const inputObj: any = {
      options: {},
      mapBody: {}
    };
    const expectedObj: any = {
      options: {
        model: {
          default: "newModel"
        }
      },
      mapBody: {
        model: {
          key: "model",
          default: "newModel"
        }
      }
    };

    deepCloneMock.mockReturnValue({ ...inputObj });
    
    const result = withDefaultModel(inputObj, "newModel");
    expect(result).toEqual(expectedObj);
    expect(deepCloneMock).toHaveBeenCalledWith(inputObj);
  });
});