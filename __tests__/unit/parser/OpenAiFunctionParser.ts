import { BaseParser, OpenAiFunctionParser, StringParser } from "@/parser";

/**
 * Tests the OpenAiFunctionParser class
 */
describe("llm-exe:parser/OpenAiFunctionParser", () => {
  it("creates class with expected properties", () => {
    const parser = new OpenAiFunctionParser({ parser: new StringParser() });
    expect(parser).toBeInstanceOf(BaseParser);
    expect(parser).toBeInstanceOf(OpenAiFunctionParser);
    expect(parser).toHaveProperty("name");
    expect(parser.name).toEqual("openAiFunction");
  });
  it("parses simple string correctly", () => {
    const parser = new OpenAiFunctionParser({ parser: new StringParser() });
    expect(parser.parse([{text: "Hello", type: "text"}])).toEqual("Hello");
  });
  it("parses simple string correctly", () => {
    const parser = new OpenAiFunctionParser({ parser: new StringParser() });
    expect(
      parser.parse([
        {
          // function_call: {
          type: "function_use",
          name: "test_function",
          input: {},
          // }
        },
      ])
    ).toEqual({
      name: "test_function",
      arguments: {},
    });
  });
});
