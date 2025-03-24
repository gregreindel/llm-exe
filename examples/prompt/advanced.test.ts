import {
  withReplacements,
  withReplacementsAndTypes,
  withReplacementsTwo,
} from "./advanced";

describe("withReplacements", () => {
  it("should format the prompt with the given agent name", () => {
    const result = withReplacements();
    expect(result.display).toEqual([
      { content: "Your name is Greg", role: "system" },
    ]);
  });
});

describe("withReplacementsTwo", () => {
  it("should format the prompt with the given agent name and fruits", () => {
    const result = withReplacementsTwo();
    expect(result.display).toEqual([
      { content: "Your name is Greg", role: "system" },
      {
        content: "Ask about one of these fruits:\n- apple\n- banana\n",
        role: "system",
      },
    ]);
  });
});

describe("withReplacementsAndTypes", () => {
  it("should format the prompt with the given actions and previous steps", () => {
    const result = withReplacementsAndTypes();
    expect(result.display).toEqual([
      {
        content:
          "You are an agent that can only perform the following actions:\n\n# Actions\nsay_hi (Provide an initial greeting.)\nsay_bye (Say goodbye at the end of a conversation.)\nask_question (Ask the user a question.)\nprovide_answer (Provide an answer to a question)\n\n# Previous Steps Taken\nThought: I should say hi\nAction: say_hi\n",
        role: "system",
      },
      { content: "Hey!", role: "user" },
      { content: "Hi, how are you?", role: "assistant" },
      { content: "Good. What day is it?", role: "user" },
      {
        content:
          "What step should we take? Must be one of: , say_hi, say_bye, ask_question, provide_answer.",
        role: "system",
      },
    ]);
  });
});
