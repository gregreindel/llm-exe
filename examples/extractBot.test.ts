import { useLlm } from "@/llm";
import { extractInformation } from "./extractBot";
import { defineSchema } from "@/utils";

describe("extractBot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should extract variables from the content", async () => {
    
    const llm = useLlm("openai.chat.v1", {
      model: "gpt-4o-mini",
      openAiApiKey: process.env.OPEN_AI_API_KEY,
    });

    const input = {
      chatHistory: [
        {
          role: "user",
          content: "Hello!",
        },
        {
          role: "assistant",
          content: "Hi what is your name?",
        },
      ] as any,
      mostRecentMessage: "I'm Greg",
    };


    const schema = defineSchema({
      type: "object",
      properties: {
        firstName: {
          type: "string",
          description: "What is the user's first name?",
        },
      },
      required: ["firstName"],
    })

    const execute = await extractInformation(llm, input, schema);

    expect(execute.firstName).toBe("Greg");
  });
});
