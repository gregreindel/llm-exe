import { get as mockedGet } from "@/utils/modules/get";
import { schemaExampleWith } from "@/utils/modules/schemaExampleWith";
import {
  maybeParseJSON,
  maybeStringifyJSON,
} from "@/utils/modules/json";
import { jsonSchemaExample } from "./jsonSchemaExample";
import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";

jest.mock("@/utils/modules/get", () => ({
  get: jest.fn(),
}));

jest.mock("@/utils/modules/replaceTemplateString", () => ({
  replaceTemplateString: jest.fn(),
}));

jest.mock("@/utils/modules/json", () => ({
  maybeParseJSON: jest.fn(),
  maybeStringifyJSON: jest.fn(),
}));

jest.mock("@/utils/modules/schemaExampleWith", () => ({
  schemaExampleWith: jest.fn(),
}));

describe("jsonSchemaExample", () => {
  const mockedGetMock = mockedGet as jest.Mock;
  const maybeParseJSONMock = maybeParseJSON as jest.Mock;
  const maybeStringifyJSONMock = maybeStringifyJSON as jest.Mock;
  const replaceTemplateStringMock = replaceTemplateString as jest.Mock;
  const schemaExampleWithMock = schemaExampleWith as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return empty string when schema is null", () => {
    mockedGetMock.mockReturnValue(null);

    const result = jsonSchemaExample.call({}, "", "", "false");
    expect(result).toEqual("");
  });

  it("should return empty string when schema does not have type", () => {
    mockedGetMock.mockReturnValue({});

    const result = jsonSchemaExample.call({}, "", "", "false");
    expect(result).toEqual("");
  });

  it("should return empty string when result is not an object", () => {
    mockedGetMock.mockReturnValue({ type: "object" });
    schemaExampleWithMock.mockReturnValue("result");

    const result = jsonSchemaExample.call({}, "", "", "false");
    expect(result).toEqual("");
  });

  it("should return stringified result when collapse is true", () => {
    const schema = { type: "object" };
    const exampleResult = { key: "value" };
    const replacedResult = { replacedKey: "replacedValue" };

    mockedGetMock.mockReturnValue(schema);
    schemaExampleWithMock.mockReturnValue(exampleResult);
    maybeStringifyJSONMock.mockReturnValue(JSON.stringify(exampleResult));
    replaceTemplateStringMock.mockReturnValue(JSON.stringify(replacedResult));
    maybeParseJSONMock.mockReturnValue(replacedResult);

    const result = jsonSchemaExample.call({}, "", "", "true");
    expect(result).toEqual(JSON.stringify(replacedResult));
  });

  it("should return prettified stringified result when collapse is false", () => {
    const schema = { type: "object" };
    const exampleResult = { key: "value" };
    const replacedResult = { replacedKey: "replacedValue" };

    mockedGetMock.mockReturnValue(schema);
    schemaExampleWithMock.mockReturnValue(exampleResult);
    maybeStringifyJSONMock.mockReturnValue(JSON.stringify(exampleResult));
    replaceTemplateStringMock.mockReturnValue(JSON.stringify(replacedResult));
    maybeParseJSONMock.mockReturnValue(replacedResult);

    const result = jsonSchemaExample.call({}, "", "", "false");
    expect(result).toEqual(JSON.stringify(replacedResult, null, 2));
  });
});
