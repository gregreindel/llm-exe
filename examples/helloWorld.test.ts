import { useOllamaModels } from "utils/mock.ollama";
import { useAnthropicModel } from "../utils/mock.anthropic";
import { testUsingModels, getLlmForScenario, debug } from "../utils/mock.helpers";
import { useOpenAiModels } from "../utils/mock.openai";
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
      useOllamaModels(["meta-3.3", "deepseek-r1"]),
      useOpenAiModels(["gpt-4o-mini", "gpt-4o", "gpt-4", "gpt-3.5-turbo"]),
      useAnthropicModel("claude-3-5-haiku-latest"),
    ],
    async (props: any) => {
      const llm = getLlmForScenario(props, {});
      const hello = await helloWorld(llm, "Hello");
      debug(`${props.shorthand} ${hello}`)
      expect(
        hello.toLowerCase().indexOf("Hello World, you said Hello".toLowerCase())
      ).toBeGreaterThan(-1);
    }
  );
});
