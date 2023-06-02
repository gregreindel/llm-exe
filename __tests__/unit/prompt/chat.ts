import { BasePrompt, ChatPrompt } from "@/prompt";

/**
 * Tests the ChatPrompt class
 */
describe("llm-exe:prompt/ChatPrompt", () => {
  it("creates class with expected properties", () => {
    const prompt = new ChatPrompt();
    expect(prompt).toBeInstanceOf(BasePrompt);
    expect(prompt).toBeInstanceOf(ChatPrompt);
    expect(prompt).toHaveProperty("type");
    expect(prompt.type).toEqual("chat");

    expect(prompt).toHaveProperty("messages");
    expect(prompt.messages).toEqual([]);

    expect(prompt).toHaveProperty("partials");
    expect(prompt.partials).toEqual([]);

    expect(prompt).toHaveProperty("helpers");
    expect(prompt.helpers).toEqual([]);

    expect(prompt).toHaveProperty("type");
    expect(prompt).toHaveProperty("addToPrompt");
    expect(prompt).toHaveProperty("addSystemMessage");
    expect(prompt).toHaveProperty("format");
    expect(prompt).toHaveProperty("registerPartial");
    expect(prompt).toHaveProperty("registerHelpers");
    expect(prompt).toHaveProperty("validate");
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    const format = prompt.format({});
    expect(format).toEqual([{ content: "Hello", role: "system" }]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "system");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "system" },
    ]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addSystemMessage("World");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "system" },
    ]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello {{replaceWithWorld}}");
    const format = prompt.format({ replaceWithWorld: "World" });
    expect(format).toEqual([{ content: "Hello World", role: "system" }]);
  });

  it("does not allow template rendering in user messages", () => {
    const prompt = new ChatPrompt();
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`)
    const format = prompt.format({ replaceWithWorld: "World" });
    expect(format).toEqual([{ content: "Hello {{replaceWithWorld}}", role: "user" }]);
  });

  it("does allow template rendering in user messages with allowUnsafeUserTemplate", () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true});
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`)
    const format = prompt.format({ replaceWithWorld: "World" });
    expect(format).toEqual([{ content: "Hello World", role: "user" }]);
  });

  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addUserMessage("World");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "user" },
    ]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addUserMessage("World", "Greg");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "user", name: "Greg" },
    ]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addAssistantMessage("World");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "assistant" },
    ]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    expect(prompt.validate()).toEqual(true);
  });
  
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "assistant");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "assistant" },
    ]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "user");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "user" },
    ]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "user", "Greg");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "user", name: "Greg" },
    ]);
  });

  it("can add messages from history", () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addFromHistory([
      { content: "Message user", role: "user" },
      { content: "Message assistant", role: "assistant" },
      { content: "Message system", role: "system" },
    ]);

    expect(prompt.format({})).toEqual([
      { content: "Hello", role: "system" },
      { content: "Message user", role: "user" },
      { content: "Message assistant", role: "assistant" },
      { content: "Message system", role: "system" },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder", () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder");

    expect(prompt.format({
      myPlaceholder: [
        { content: "Message user", role: "user" },
        { content: "Message assistant", role: "assistant" },
        { content: "Message system", role: "system" },
      ]
    })).toEqual([
      { content: "Hello", role: "system" },
      { content: "Message user", role: "user" },
      { content: "Message assistant", role: "assistant" },
      { content: "Message system", role: "system" },
    ]);
  });
  


});
