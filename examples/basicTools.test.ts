import { itWithUseLlmMocked } from "../utils/mock.helpers";
import { guards } from "..";
import { llmUsingToolsSimple } from "./basicTools";

describe("llmUsingToolsSimple", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const prompt =
    "Hello what is the weather at longitude 30.278044 and latitude -96.675568?";

  /**
   * This simple test will check if the function as-is is working as expected
   */
  it("Simple test - should call a tool when provided with tools", async () => {
    const response = await llmUsingToolsSimple(prompt, []);

    expect(Array.isArray(response)).toBe(true);

    const fnCall =
      Array.isArray(response) && response.find(guards.isFunctionCall);

    expect(guards.isFunctionCall(fnCall)).toBe(true);
    expect(guards.isFunctionCall(fnCall) && fnCall.name).toBe("getWeather");
    expect(guards.isFunctionCall(fnCall) && fnCall.input).toEqual({
      longitude: 30.278044,
      latitude: -96.675568,
    });
  });

  /**
   * Let's run it with different LLMs
   */
  itWithUseLlmMocked(
    "handle this simple instruction",
    [
      "anthropic.claude-3-7-sonnet",
      "google.gemini-2.0-flash",
      "xai.grok-2",
      "deepseek.chat",
    ],
    async (config: any) => {
      jest.resetModules();

      // clone exe and mock useLlm
      jest.doMock("llm-exe", () => {
        const real = jest.requireActual("llm-exe");
        return {
          ...real,
          useLlm: (_orig: string) => real.useLlm(config.key, config),
        };
      });

      const { llmUsingToolsSimple } = await import("./basicTools");
      const response = await llmUsingToolsSimple(prompt, []);

      expect(Array.isArray(response)).toBe(true);

      const fnCall =
        Array.isArray(response) && response.find(guards.isFunctionCall);

      expect(guards.isFunctionCall(fnCall)).toBe(true);
      expect(guards.isFunctionCall(fnCall) && fnCall.name).toBe("getWeather");
      expect(guards.isFunctionCall(fnCall) && fnCall.input).toEqual({
        longitude: 30.278044,
        latitude: -96.675568,
      });
    }
  );
});
