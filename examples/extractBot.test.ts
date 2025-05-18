import { type IChatMessages, utils } from "llm-exe";
import { extractInformation } from "./extractBot";

describe("extractBot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("Simple test - should extract variables from the content", async () => {
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
      ] as IChatMessages,
      mostRecentMessage: "I'm Greg",
    };

    const schema = utils.defineSchema({
      type: "object",
      properties: {
        firstName: {
          type: "string",
          description: "What is the user's first name?",
        },
      },
      required: ["firstName"],
      additionalProperties: false,
    });

    const execute = await extractInformation(input, schema);

    expect(execute.firstName).toBe("Greg");
  });
});
