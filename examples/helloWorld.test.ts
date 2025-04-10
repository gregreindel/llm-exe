// import { useOpenAiModels } from "../utils/mock.openai";
// import { useAnthropicModel } from "../utils/mock.anthropic";
// import { useGoogleGeminiModels } from "../utils/mock.google";
import {
  testUsingModels,
  getLlmForScenario,
  debug,
  useModels,
} from "../utils/mock.helpers";
import { helloWorld } from "./helloWorld";

describe("verifyBot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * The user will provide an input, you need to reply only with:
   * "Hello World, you said <and then insert here what they said>"
   *
   * So we check the response for this
   */
  testUsingModels(
    "handle this simple instruction",
    [
      useModels([
        "anthropic.claude-3-5-sonnet",
        "openai.gpt-4o-mini",
        "google.gemini-2.0-flash",
        "xai.grok-2",
        "deepseek.chat"
      ]),
    ],
    async (props: any) => {
      const llm = getLlmForScenario(props, {});
      const hello = await helloWorld(llm, "Hello");
      debug(`${props.shorthand} ${hello}`);
      expect(
        hello.toLowerCase().indexOf("Hello World, you said Hello".toLowerCase())
      ).toBeGreaterThan(-1);
    }
  );
});
