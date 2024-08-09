import { replaceTemplateString } from "@/utils";
import { hbsInTemplate } from "./hbsInTemplate";

jest.mock("@/utils", () => ({
  replaceTemplateString: jest.fn(),
}));

describe("hbsInTemplate", () => {
  const replaceTemplateStringMock = replaceTemplateString as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should replace template with data from 'this' context", () => {
    const contextData = { name: "John Doe", age: 30 };
    const templateString = "My name is {{name}} and I am {{age}} years old.";
    replaceTemplateStringMock.mockReturnValue("My name is John Doe and I am 30 years old.");

    const result = hbsInTemplate.call(contextData, templateString);

    expect(replaceTemplateStringMock).toHaveBeenCalledWith(templateString, contextData);
    expect(result).toBe("My name is John Doe and I am 30 years old.");
  });

  it("should handle empty template string", () => {
    const contextData = { name: "John Doe", age: 30 };
    const emptyTemplateString = "";
    replaceTemplateStringMock.mockReturnValue("");

    const result = hbsInTemplate.call(contextData, emptyTemplateString);

    expect(replaceTemplateStringMock).toHaveBeenCalledWith(emptyTemplateString, contextData);
    expect(result).toBe("");
  });

  it("should handle null template string", () => {
    const contextData = { name: "John Doe", age: 30 };
    const nullTemplateString = null;
    const result = hbsInTemplate.call(contextData, nullTemplateString as any);

    expect(replaceTemplateStringMock).toHaveBeenCalledWith(nullTemplateString, contextData);
    expect(result).toBe("");
  });

  it("should handle template string with no placeholders", () => {
    const contextData = { name: "John Doe", age: 30 };
    const templateWithoutPlaceholders = "Hello, World!";
    replaceTemplateStringMock.mockReturnValue("Hello, World!");
    const result = hbsInTemplate.call(contextData, templateWithoutPlaceholders);

    expect(replaceTemplateStringMock).toHaveBeenCalledWith(templateWithoutPlaceholders, contextData);
    expect(result).toBe("Hello, World!");
  });

  it("should handle undefined context data", () => {
    const undefinedContextData = undefined;
    const templateString = "My name is {{name}} and I am {{age}} years old.";
    replaceTemplateStringMock.mockReturnValue("My name is  and I am  years old.");

    const result = hbsInTemplate.call(undefinedContextData, templateString);

    expect(replaceTemplateStringMock).toHaveBeenCalledWith(templateString, undefinedContextData);
    expect(result).toBe("My name is  and I am  years old.");
  });
});