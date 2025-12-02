import { anthropicPromptSanitize } from "@/llm/config/anthropic/promptSanitize";
import { bedrock } from "@/llm/config/bedrock";
import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";

// Mock the external dependencies
jest.mock("@/utils/modules/replaceTemplateString", () => ({
  replaceTemplateString: jest.fn(),
}));

jest.mock("@/llm/config/anthropic/promptSanitize", () => ({
  anthropicPromptSanitize: jest.fn(),
}));

const replaceTemplateStringMock = replaceTemplateString as jest.Mock;
const anthropicPromptSanitizeMock = anthropicPromptSanitize as jest.Mock;

describe("bedrock configuration", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    process.env = { ...OLD_ENV, AWS_REGION: "us-west-2" };
  });

  afterAll(() => {
    process.env = OLD_ENV;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("amazon:anthropic.chat.v1 configuration", () => {
    it("should have the correct endpoint with AWS region placeholder", () => {
      expect(bedrock["amazon:anthropic.chat.v1"].endpoint).toBe(
        "https://bedrock-runtime.{{awsRegion}}.amazonaws.com/model/{{model}}/invoke"
      );
    });

    it("should have the correct default mapBody values", () => {
      expect(
        bedrock["amazon:anthropic.chat.v1"].mapBody.maxTokens.default
      ).toBe(10000);
      expect(
        bedrock["amazon:anthropic.chat.v1"].mapBody.anthropic_version.default
      ).toBe("bedrock-2023-05-31");
    });
    it("should transform prompt using anthropicPromptSanitize", () => {
      const messages = "test message";
      anthropicPromptSanitizeMock.mockReturnValue("transformd message");
      const cn = bedrock["amazon:anthropic.chat.v1"];
      const transformd = cn?.mapBody?.prompt?.transform
        ? cn?.mapBody?.prompt?.transform(messages, {}, {})
        : () => {};
      expect(transformd).toBe("transformd message");
      expect(anthropicPromptSanitizeMock).toHaveBeenCalledWith(
        messages,
        {},
        {}
      );
    });
  });

  describe("amazon:meta.chat.v1 configuration", () => {
    it("should have the correct endpoint with AWS region placeholder", () => {
      expect(bedrock["amazon:meta.chat.v1"].endpoint).toBe(
        "https://bedrock-runtime.{{awsRegion}}.amazonaws.com/model/{{model}}/invoke"
      );
    });

    it("should have the correct default mapBody values", () => {
      expect(bedrock["amazon:meta.chat.v1"].mapBody.maxTokens.default).toBe(
        2048
      );
    });

    it("should transform prompt appropriately", () => {
      const stringPrompt = "test string message";
      const objectMessages = [{ msg: "message1" }, { msg: "message2" }];
      const replacedString = "replaced string";

      replaceTemplateStringMock.mockReturnValue(replacedString);
      const fn1 = bedrock["amazon:meta.chat.v1"];
      const transformString = fn1.mapBody.prompt.transform
        ? fn1.mapBody.prompt.transform(stringPrompt, {}, {})
        : () => {};
      expect(transformString).toBe(stringPrompt);
      const fn2 = bedrock["amazon:meta.chat.v1"];
      const transformObject = fn2?.mapBody?.prompt?.transform
        ? fn2?.mapBody?.prompt?.transform(objectMessages, {}, {})
        : () => {};
      expect(transformObject).toBe(replacedString);
      expect(replaceTemplateStringMock).toHaveBeenCalledWith(
        "{{>DialogueHistory key='messages'}}",
        { messages: objectMessages }
      );
    });
  });
});
