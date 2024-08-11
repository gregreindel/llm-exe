import {
  maybeParseJSON,
  maybeStringifyJSON,
} from "@/utils";
import { indentJson } from "./indentJson";
import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";

jest.mock("@/utils/modules/replaceTemplateString", () => ({
  replaceTemplateString: jest.fn(),
}));
jest.mock("@/utils", () => ({
  maybeParseJSON: jest.fn(),
  maybeStringifyJSON: jest.fn(),
}));

describe("indentJson", () => {
  const maybeParseJSONMock = maybeParseJSON as jest.Mock;
  const maybeStringifyJSONMock = maybeStringifyJSON as jest.Mock;
  const replaceTemplateStringMock = replaceTemplateString as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    replaceTemplateStringMock.mockReset()
  });

  it("should return the replaced template string when arg1 is not an object", () => {
    replaceTemplateStringMock.mockReturnValue("replaced");

    const result = indentJson.call({}, "testString" as any);

    expect(replaceTemplateStringMock).toHaveBeenCalledWith("testString", {});
    expect(result).toEqual("replaced");
  });

  it("should parse and stringify JSON with indentation when arg1 is an object and collapse is false", () => {
    const arg = { key: "value" };
    const replacedString = '{"key":"value"}';
    const replacedObject = { key: "value" };

    maybeStringifyJSONMock.mockReturnValue(replacedString);
    replaceTemplateStringMock.mockReturnValueOnce(replacedString);
    maybeParseJSONMock.mockReturnValue(replacedObject);

    const result = indentJson.call({}, arg);

    expect(maybeStringifyJSONMock).toHaveBeenCalledWith(arg);
    expect(replaceTemplateStringMock).toHaveBeenCalledWith(replacedString, {});
    expect(maybeParseJSONMock).toHaveBeenCalledWith(replacedString);
    expect(result).toEqual(JSON.stringify(replacedObject, null, 2));
  });

  it("should parse and stringify JSON without indentation when arg1 is an object and collapse is true", () => {
    const arg = { key: "value" };
    const replacedString = '{"key":"value"}';
    const replacedObject = { key: "value" };

    maybeStringifyJSONMock.mockReturnValue(replacedString);
    replaceTemplateStringMock.mockReturnValueOnce(replacedString);
    maybeParseJSONMock.mockReturnValue(replacedObject);

    const result = indentJson.call({}, arg, "true");

    expect(maybeStringifyJSONMock).toHaveBeenCalledWith(arg);
    expect(replaceTemplateStringMock).toHaveBeenCalledWith(replacedString, {});
    expect(maybeParseJSONMock).toHaveBeenCalledWith(replacedString);
    expect(result).toEqual(JSON.stringify(replacedObject));
  });

  it("should handle null inputs gracefully", () => {
    replaceTemplateStringMock.mockReturnValueOnce("");
    maybeStringifyJSONMock.mockReturnValue("");
    maybeParseJSONMock.mockReturnValue({});

    const result = indentJson.call({}, null as any);

    expect(replaceTemplateStringMock).toHaveBeenCalledWith("", {});
    expect(result).toEqual("{}");
  });

  it("should handle undefined inputs gracefully", () => {
    replaceTemplateStringMock.mockReturnValueOnce("");
    maybeStringifyJSONMock.mockReturnValue("");
    maybeParseJSONMock.mockReturnValue({});
  
    const result = indentJson.call({}, undefined as any);
  
    expect(replaceTemplateStringMock).toHaveBeenCalledWith("", {});
    expect(result).toEqual("");
  });
});