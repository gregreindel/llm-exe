import { useLlm } from "llm-exe";
import { identifyIntent, intents } from "./intentBot";

describe("extractBot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should identify simple intent given content", async () => {
    const llm = useLlm("openai.chat.v1", {
      model: "gpt-4o-mini",
      openAiApiKey: process.env.OPENAI_API_KEY,
    });

    const response = await identifyIntent(llm, {
      input: "I'm Greg",
      chatHistory: [
        {
          role: "user",
          content: "Hello! Do you have a bmw available for next week?",
        },
      ],
      intents,
    });

    expect(response.intent).toBe("rent_car");
    expect(Array.isArray(response.intents)).toBe(true);
  });
});
