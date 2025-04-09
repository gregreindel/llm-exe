import { useLlm } from "llm-exe";
import { helloWorldReasoning } from "./helloWorldReasoning";


describe("verifyBot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should verify (false) based on the questions/content", async () => {
    const llm = useLlm("deepseek.chat.v1", {
      model: "deepseek-chat",
      deepseekApiKey: process.env.DEEPSEEK_API_KEY,
    });

    // the input you get from somewhere
    const input = "Hi can you hear me?";

    const hello = await  helloWorldReasoning(llm, input)

    console.log(hello)

  });
});
