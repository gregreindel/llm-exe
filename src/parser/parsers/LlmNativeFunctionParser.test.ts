import { BaseParser, LlmNativeFunctionParser, StringParser } from "@/parser";
import { mockOutputResultObject } from "../../../utils/mock.helpers";

/**
 * Tests the LlmNativeFunctionParser class
 */
describe("llm-exe:parser/LlmNativeFunctionParser", () => {
  it("creates class with expected properties", () => {
    const parser = new LlmNativeFunctionParser({ parser: new StringParser() });
    expect(parser).toBeInstanceOf(BaseParser);
    expect(parser).toBeInstanceOf(LlmNativeFunctionParser);
    expect(parser).toHaveProperty("name");
    expect(parser.name).toEqual("openAiFunction");
  });
  it("parses simple string correctly", () => {
    const parser = new LlmNativeFunctionParser({ parser: new StringParser() });
    expect(
      parser.parse(mockOutputResultObject([{ text: "Hello", type: "text" }]))
    ).toEqual("Hello");
  });
  it("parses simple string correctly", () => {
    const parser = new LlmNativeFunctionParser({ parser: new StringParser() });
    expect(
      parser.parse(
        mockOutputResultObject([
          {
            type: "function_use",
            name: "test_function",
            input: {},
          },
        ])
      )
    ).toEqual({
      name: "test_function",
      arguments: {},
    });
  });
});
