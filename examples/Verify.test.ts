import { useLlm } from "@/llm";
import { checkPolicy } from "./Verify";
import { IChatMessages } from "@/interfaces";

export const expected = {
  passed: false,
  results: [
    {
      statement: "The user has told us their age.",
      answer: "false",
      confidence: "95",
    },
    {
      statement: "The user has told us their name.",
      answer: "true",
      confidence: "80",
    },
  ],
};

describe("verifyBot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should verify (false) based on the questions/content", async () => {
    const llm = useLlm("openai.chat.v1", {
      model: "gpt-4o-mini",
      openAiApiKey: process.env.OPEN_AI_API_KEY,
    });

    // the input you get from somewhere
    const input = "";

    // a chat history, loaded from somewhere
    const chatHistory: IChatMessages = [
      { role: "user", content: "Hi I'm Greg" },
    ];

    // a list of statements we'd like to check
    const statements = [
      "The user has told us their age.",
      "The user has told us their name.",
    ];

    const response = await checkPolicy(llm, { input, chatHistory, statements });
    //   console.log("here", response)
    // make sure we got correct shape back
    expect(typeof response).toBe("object");
    expect(Array.isArray(response.results)).toBe(true);
    expect(typeof response.passed).toBe("boolean");

    // verify correct answer
    expect(response.passed).toBe(false);
    expect(response.results).toHaveLength(2);
  });

  it("should verify (true) based on the questions/content", async () => {
    const llm = useLlm("openai.chat.v1", {
      model: "gpt-4o-mini",
      openAiApiKey: process.env.OPEN_AI_API_KEY,
    });

    // the input you get from somewhere
    const input = "";

    // a chat history, loaded from somewhere
    const chatHistory: IChatMessages = [
      { role: "user", content: "Hi I'm Greg" },
      { role: "assistant", content: "Hi Greg, how are you?" },
      {
        role: "user",
        content: "Good! my birthday was yesterday, I turned 80!",
      },
    ];

    // a list of statements we'd like to check
    const statements = [
      "The user has told us their age.",
      "The user has told us their name.",
    ];

    const response = await checkPolicy(llm, { input, chatHistory, statements });
    //   console.log("here", response)
    // make sure we got correct shape back
    expect(typeof response).toBe("object");
    expect(Array.isArray(response.results)).toBe(true);
    expect(typeof response.passed).toBe("boolean");

    // verify correct answer
    expect(response.passed).toBe(true);
    expect(response.results).toHaveLength(2);
  });
});
