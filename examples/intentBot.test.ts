import { identifyIntent, intents } from "./intentBot";

describe("identifyIntent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should identify simple intent given content", async () => {
    const response = await identifyIntent({
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
