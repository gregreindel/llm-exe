import { itWithUseLlmMocked } from "../utils/mock.helpers";
import { helloWorld } from "./helloWorld";

describe("helloWorld", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * The user will provide an input, you need to reply only with:
   * "Hello World, you said <and then insert here what they said>"
   *
   * So we check the response for this
   */

  /**
   * This simple test will check if the function as-is is working as expected
   */
  it("Simple test - should extract variables from the content", async () => {
    const hello = await helloWorld("Hello");
    expect(
      hello.toLowerCase().indexOf("Hello World, you said Hello".toLowerCase())
    ).toBeGreaterThan(-1);
  });

  /**
   * Let's run it with different LLMs
   */
  itWithUseLlmMocked(
    "handle this simple instruction",
    [
      "anthropic.claude-3-5-sonnet",
      // "openai.gpt-4o-mini",
      // "google.gemini-2.0-flash",
      // "xai.grok-2",
      // "deepseek.chat",
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

      const { helloWorld } = await import("./helloWorld");
      const hello = await helloWorld("Hello");
      console.log(`${config.key}:`, hello);
      expect(
        hello.toLowerCase().indexOf("Hello World, you said Hello".toLowerCase())
      ).toBeGreaterThan(-1);
    }
  );
});
