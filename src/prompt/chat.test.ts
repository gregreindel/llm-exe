import { BasePrompt, ChatPrompt } from "@/prompt";
import { assert } from "@/utils/modules/assert";

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
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
    ]);
  });

  it("parses detailed user message", () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage([
      {
        type: "text",
        text: "Hello",
      },
    ]);
    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "user" },
    ]);
  });

  it("parses detailed user message (async)", async () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage([
      {
        type: "text",
        text: "Hello",
      },
    ]);
    const format = await prompt.formatAsync({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "user" },
    ]);
  });

  it("parses detailed user message fallback", () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage([
      {
        type: "image",
        image_url: {
          url: "www.url.string",
        },
      },
    ]);
    const format = prompt.format({});
    expect(format).toMatchObject([
      {
        content: [{ type: "image", image_url: { url: "www.url.string" } }],
        role: "user",
      },
    ]);
  });

  it("parses detailed user message fallback (async)", async () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage([
      {
        type: "image",
        image_url: {
          url: "www.url.string",
        },
      },
    ]);
    const format = await prompt.formatAsync({});
    expect(format).toMatchObject([
      {
        content: [{ type: "image", image_url: { url: "www.url.string" } }],
        role: "user",
      },
    ]);
  });

  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "system");
    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      { content: [{ text: "World", type: "text" }], role: "system" },
    ]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addSystemMessage("World");
    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      { content: [{ text: "World", type: "text" }], role: "system" },
    ]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello {{replaceWithWorld}}");
    const format = prompt.format({ replaceWithWorld: "World" });
    expect(format).toMatchObject([
      { content: [{ text: "Hello World", type: "text" }], role: "system" },
    ]);
  });

  it("parses object to string (async)", async () => {
    async function replaceWithWorld() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("World");
        }, 200);
      });
    }
    const prompt = new ChatPrompt("Hello {{replaceWithWorld}}");
    const format = await prompt.formatAsync({ replaceWithWorld });
    expect(format).toMatchObject([
      { content: [{ text: "Hello World", type: "text" }], role: "system" },
    ]);
  });

  it("does allow template rendering in user messages by default", () => {
    const prompt = new ChatPrompt();
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`);
    const format = prompt.format({ replaceWithWorld: "World" });
    expect(format).toMatchObject([
      { content: [{ text: "Hello World", type: "text" }], role: "user" },
    ]);
  });

  it("does not allow template rendering in user messages if set", () => {
    const prompt = new ChatPrompt(undefined, {
      allowUnsafeUserTemplate: false,
    });
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`);
    const format = prompt.format({ replaceWithWorld: "World" });
    expect(format).toMatchObject([
      {
        content: [{ text: "Hello {{replaceWithWorld}}", type: "text" }],
        role: "user",
      },
    ]);
  });

  it("does not allow template rendering in user messages (async)", async () => {
    const prompt = new ChatPrompt(undefined, {
      allowUnsafeUserTemplate: false,
    });
    async function replaceWithWorld() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("World");
        }, 200);
      });
    }
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`);
    const format = await prompt.formatAsync({ replaceWithWorld });
    expect(format).toMatchObject([
      {
        content: [{ text: "Hello {{replaceWithWorld}}", type: "text" }],
        role: "user",
      },
    ]);
  });

  it("does allow template rendering in user messages with allowUnsafeUserTemplate", () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`);
    const format = prompt.format({ replaceWithWorld: "World" });
    expect(format).toMatchObject([
      { content: [{ text: "Hello World", type: "text" }], role: "user" },
    ]);
  });

  it("does allow template rendering in user messages with allowUnsafeUserTemplate (async)", async () => {
    async function replaceWithWorld() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("World");
        }, 200);
      });
    }

    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`);
    const format = await prompt.formatAsync({ replaceWithWorld });
    expect(format).toMatchObject([
      { content: [{ text: "Hello World", type: "text" }], role: "user" },
    ]);
  });

  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addUserMessage("World");
    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      { content: [{ text: "World", type: "text" }], role: "user" },
    ]);
  });
  it("parses object to string", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addUserMessage("World", "Greg");
    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      {
        content: [{ text: "World", type: "text" }],
        role: "user",
        name: "Greg",
      },
    ]);
  });
  it("addAssistantMessage to add assistant message", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addAssistantMessage("World");
    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      { content: [{ text: "World", type: "text" }], role: "assistant" },
    ]);
  });
  it("validate defaults to true", () => {
    const prompt = new ChatPrompt("Hello");
    expect(prompt.validate()).toBe(true);
  });

  it("addToPrompt to add assistant message", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "assistant");
    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      { content: [{ text: "World", type: "text" }], role: "assistant" },
    ]);
  });
  it("addToPrompt to add user message", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "user");
    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      { content: [{ text: "World", type: "text" }], role: "user" },
    ]);
  });
  it("addToPrompt to add user message with name", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "user", "Greg");
    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      {
        content: [{ text: "World", type: "text" }],
        role: "user",
        name: "Greg",
      },
    ]);
  });

  it("addToPrompt to add function message with name", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("Output", "function", "test_fn");
    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      {
        content: [{ text: "Output", type: "text" }],
        role: "function",
        name: "test_fn",
      },
    ]);
  });

  it("addToPrompt to add function message with name (async)", async () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("Output", "function", "test_fn");
    const format = await prompt.formatAsync({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      {
        content: [{ text: "Output", type: "text" }],
        role: "function",
        name: "test_fn",
      },
    ]);
  });

  it("addToPrompt to add function_call message with name", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("{}", "function_call", "test_fn");

    assert(prompt.messages[1].role === "assistant");

    const format = prompt.format({});
    expect(format).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      {
        content: [],
        role: "assistant",
        function_call: {
          name: "test_fn",
          arguments: "{}",
        },
      },
    ]);
  });

  it("can add messages from history", () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addFromHistory([
      { content: "Message user", role: "user" },
      { content: "Message assistant", role: "assistant" },
      { content: "Message system", role: "system" },
      {
        content: null,
        role: "assistant",
        function_call: { name: "test_fn", arguments: "{}" },
      },
      { content: "Function Output", name: "test_fn", role: "function" },
    ]);

    expect(prompt.format({})).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      { content: [{ text: "Message user", type: "text" }], role: "user" },
      {
        content: [{ text: "Message assistant", type: "text" }],
        role: "assistant",
      },
      { content: [{ text: "Message system", type: "text" }], role: "system" },
      {
        content: [],
        role: "assistant",
        function_call: { name: "test_fn", arguments: "{}" },
      },
      {
        content: [{ text: "Function Output", type: "text" }],
        name: "test_fn",
        role: "function",
      },
    ]);
  });

  it("can add messages from history (async)", async () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addFromHistory([
      { content: "Message user", role: "user" },
      { content: "Message assistant", role: "assistant" },
      { content: "Message system", role: "system" },
      {
        content: null,
        role: "assistant",
        function_call: { name: "test_fn", arguments: "{}" },
      },
      { content: "Function Output", name: "test_fn", role: "function" },
    ]);

    const formatted = await prompt.formatAsync({});

    expect(formatted).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      { content: [{ text: "Message user", type: "text" }], role: "user" },
      {
        content: [{ text: "Message assistant", type: "text" }],
        role: "assistant",
      },
      { content: [{ text: "Message system", type: "text" }], role: "system" },
      {
        content: [],
        role: "assistant",
        function_call: { name: "test_fn", arguments: "{}" },
      },
      {
        content: [{ text: "Function Output", type: "text" }],
        name: "test_fn",
        role: "function",
      },
    ]);
  });

  it("can add messages from history with function message including tool_call_id", () => {
    const prompt = new ChatPrompt();

    prompt.addFromHistory([
      { content: "User message", role: "user" },
      {
        content: null,
        role: "assistant",
        function_call: { name: "test_fn", arguments: "{}" },
      },
      {
        content: "Function result",
        name: "test_fn",
        role: "function",
        tool_call_id: "call_456",
      },
    ]);

    expect(prompt.format({})).toMatchObject([
      { content: [{ text: "User message", type: "text" }], role: "user" },
      {
        content: [],
        role: "assistant",
        function_call: { name: "test_fn", arguments: "{}" },
      },
      {
        content: [{ text: "Function result", type: "text" }],
        name: "test_fn",
        role: "function",
        tool_call_id: "call_456",
      },
    ]);
  });

  it("handles messages from history with new OpenAI tool format", () => {
    const prompt = new ChatPrompt();

    // This is what users are getting from OpenAI API
    prompt.addFromHistory([
      { content: "What's the weather?", role: "user" },
      {
        content: [],
        role: "assistant",
        tool_calls: [
          {
            id: "call_123",
            type: "function",
            function: { name: "get_weather", arguments: '{"location":"NYC"}' },
          },
        ],
      },
      { content: "72F sunny", role: "tool", tool_call_id: "call_123" },
      { content: "It's 72F and sunny in NYC.", role: "assistant" },
    ]);

    const formatted = prompt.format({});

    // Should convert to internal format
    expect(formatted).toMatchObject([
      {
        content: [{ text: "What's the weather?", type: "text" }],
        role: "user",
      },
      { content: [], role: "assistant" },
      {
        content: [],
        function_call: { name: "get_weather", arguments: '{"location":"NYC"}' },
        role: "assistant",
      },
      {
        content: [{ text: "72F sunny", type: "text" }],
        name: "function",
        role: "function",
        tool_call_id: "call_123",
      },
      {
        content: [{ text: "It's 72F and sunny in NYC.", type: "text" }],
        role: "assistant",
      },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder", () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder");

    expect(
      prompt.format({
        myPlaceholder: [
          { content: [{ text: "Message user", type: "text" }], role: "user" },
          {
            content: [{ text: "Message assistant", type: "text" }],
            role: "assistant",
          },
          {
            content: [{ text: "Message system", type: "text" }],
            role: "system",
          },
          {
            content: [],
            role: "assistant",
            function_call: { name: "test_fn", arguments: "{}" },
          },
          { content: "Function Output", name: "test_fn", role: "function" },
        ],
      })
    ).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      { content: [{ text: "Message user", type: "text" }], role: "user" },
      {
        content: [{ text: "Message assistant", type: "text" }],
        role: "assistant",
      },
      { content: [{ text: "Message system", type: "text" }], role: "system" },
      {
        content: [],
        role: "assistant",
        function_call: { name: "test_fn", arguments: "{}" },
      },
      {
        content: [{ text: "Function Output", type: "text" }],
        name: "test_fn",
        role: "function",
      },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder (async)", async () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder");

    const formatted = await prompt.formatAsync({
      myPlaceholder: [
        { content: [{ text: "Message user", type: "text" }], role: "user" },
        {
          content: [{ text: "Message assistant", type: "text" }],
          role: "assistant",
        },
        { content: [{ text: "Message system", type: "text" }], role: "system" },
        {
          content: [],
          role: "assistant",
          function_call: { name: "test_fn", arguments: "{}" },
        },
        { content: "Function Output", name: "test_fn", role: "function" },
      ],
    });
    expect(formatted).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      { content: [{ text: "Message user", type: "text" }], role: "user" },
      {
        content: [{ text: "Message assistant", type: "text" }],
        role: "assistant",
      },
      { content: [{ text: "Message system", type: "text" }], role: "system" },
      {
        content: [],
        role: "assistant",
        function_call: { name: "test_fn", arguments: "{}" },
      },
      {
        content: [{ text: "Function Output", type: "text" }],
        name: "test_fn",
        role: "function",
      },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder with user", () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder", { user: "NotGreg" });

    expect(
      prompt.format({
        myPlaceholder: [
          { content: "Message user", role: "user", name: "Greg" },
          { content: "Message assistant", role: "assistant" },
        ],
      })
    ).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      {
        content: [{ text: "Message user", type: "text" }],
        role: "user",
        name: "NotGreg",
      },
      {
        content: [{ text: "Message assistant", type: "text" }],
        role: "assistant",
      },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder with user (async)", async () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder", { user: "NotGreg" });
    const formatted = await prompt.formatAsync({
      myPlaceholder: [
        {
          content: [{ text: "Message user", type: "text" }],
          role: "user",
          name: "Greg",
        },
        {
          content: [{ text: "Message assistant", type: "text" }],
          role: "assistant",
        },
      ],
    });

    expect(formatted).toMatchObject([
      { content: [{ text: "Hello", type: "text" }], role: "system" },
      {
        content: [{ text: "Message user", type: "text" }],
        role: "user",
        name: "NotGreg",
      },
      {
        content: [{ text: "Message assistant", type: "text" }],
        role: "assistant",
      },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder with options", () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder", {
      assistant: "Support",
      user: "Customer",
    });

    expect(prompt.messages).toMatchObject([
      { role: "system", content: [{ text: "Hello", type: "text" }] },
      {
        role: "placeholder",
        content: [
          {
            text: "{{> DialogueHistory key='myPlaceholder' assistant='Support' user='Customer'}}",
            type: "text",
          },
        ],
      },
    ]);
  });

  it("can add user messages from addMessagePlaceholder defaults to user", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text");
    expect(prompt.format({})).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      { content: [{ type: "text", text: "Some Plain Text" }], role: "user" },
    ]);
  });

  it("can add user messages from addMessagePlaceholder defaults to user (async)", async () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text");
    const formatted = await prompt.formatAsync({});
    expect(formatted).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      { content: [{ type: "text", text: "Some Plain Text" }], role: "user" },
    ]);
  });

  it("can add user messages from addMessagePlaceholder", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "user");
    expect(prompt.format({})).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      { content: [{ type: "text", text: "Some Plain Text" }], role: "user" },
    ]);
  });

  it("can add user messages from addMessagePlaceholder (async)", async () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "user");
    const formatted = await prompt.formatAsync({});
    expect(formatted).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      { content: [{ type: "text", text: "Some Plain Text" }], role: "user" },
    ]);
  });

  it("can add user messages  with name from addMessagePlaceholder", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "user", "Greg");
    expect(prompt.format({})).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      {
        content: [{ type: "text", text: "Some Plain Text" }],
        role: "user",
        name: "Greg",
      },
    ]);
  });

  it("can add user messages  with name from addMessagePlaceholder (async)", async () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "user", "Greg");
    const formatted = await prompt.formatAsync({});
    expect(formatted).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      {
        content: [{ type: "text", text: "Some Plain Text" }],
        role: "user",
        name: "Greg",
      },
    ]);
  });

  it("can add user messages from addMessagePlaceholder and they get replaced", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("{{userInput}}", "user");
    expect(prompt.format({ userInput: "Some Plain Text" })).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      { content: [{ type: "text", text: "Some Plain Text" }], role: "user" },
    ]);
  });

  it("can add user messages from addMessagePlaceholder and they get replaced (async)", async () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("{{userInput}}", "user");
    const formatted = await prompt.formatAsync({
      userInput: "Some Plain Text",
    });
    expect(formatted).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      { content: [{ type: "text", text: "Some Plain Text" }], role: "user" },
    ]);
  });

  it("can add assistant messages from addMessagePlaceholder", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "assistant");
    expect(prompt.format({})).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      {
        content: [{ type: "text", text: "Some Plain Text" }],
        role: "assistant",
      },
    ]);
  });
  it("can add system messages from addMessagePlaceholder", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "system");
    expect(prompt.format({})).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      { content: [{ type: "text", text: "Some Plain Text" }], role: "system" },
    ]);
  });

  it("can add custom user name to messages from addMessagePlaceholder", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "user", "Greg");
    expect(prompt.format({})).toMatchObject([
      { content: [{ type: "text", text: "Hello" }], role: "system" },
      {
        content: [{ type: "text", text: "Some Plain Text" }],
        role: "user",
        name: "Greg",
      },
    ]);
  });

  describe("addFromHistory", () => {
    it("handles null history gracefully", () => {
      const prompt = new ChatPrompt("Hello");
      const result = prompt.addFromHistory(null as any);
      expect(result).toBe(prompt); // Should return this for chaining
      expect(prompt.messages).toHaveLength(1); // Only the initial message
    });

    it("handles undefined history gracefully", () => {
      const prompt = new ChatPrompt("Hello");
      const result = prompt.addFromHistory(undefined as any);
      expect(result).toBe(prompt);
      expect(prompt.messages).toHaveLength(1);
    });

    it("handles non-array history gracefully", () => {
      const prompt = new ChatPrompt("Hello");
      const result = prompt.addFromHistory("not an array" as any);
      expect(result).toBe(prompt);
      expect(prompt.messages).toHaveLength(1);
    });
  });

  describe("format with non-text content parts", () => {
    it("preserves non-text content parts in function messages", () => {
      const prompt = new ChatPrompt("Hello");
      // Add a function message with mixed content
      prompt.messages.push({
        role: "function",
        content: [
          { type: "text", text: "Function result: {{result}}" },
          { type: "image", image_url: { url: "data:image/png;base64,xyz" } }
        ],
        name: "analyze_image",
        tool_call_id: undefined,
        function_call: undefined
      });
      
      const formatted = prompt.format({ result: "success" });
      expect(formatted[1].content).toHaveLength(2);
      expect(formatted[1].content[0]).toMatchObject({ type: "text", text: "Function result: success" });
      expect(formatted[1].content[1]).toMatchObject({ 
        type: "image", 
        image_url: { url: "data:image/png;base64,xyz" } 
      });
    });

    it("preserves non-text content parts in function messages (async)", async () => {
      const prompt = new ChatPrompt("Hello");
      // Add a function message with mixed content
      prompt.messages.push({
        role: "function",
        content: [
          { type: "text", text: "Function result: {{result}}" },
          { type: "audio", url: "audio.mp3" }
        ],
        name: "process_audio",
        tool_call_id: undefined,
        function_call: undefined
      });
      
      const formatted = await prompt.formatAsync({ result: "processed" });
      expect(formatted[1].content).toHaveLength(2);
      expect(formatted[1].content[0]).toMatchObject({ type: "text", text: "Function result: processed" });
      expect(formatted[1].content[1]).toMatchObject({ 
        type: "audio", 
        url: "audio.mp3"
      });
    });

    it("preserves non-text content in non-template roles", () => {
      const prompt = new ChatPrompt("Hello", { allowUnsafeUserTemplate: false });
      // Add a user message with mixed content when template parsing is disabled
      prompt.messages.push({
        role: "user",
        content: [
          { type: "text", text: "Look at this {{shouldNotParse}}" },
          { type: "video", url: "video.mp4" }
        ],
        name: undefined,
        tool_call_id: undefined,
        function_call: undefined
      });
      
      const formatted = prompt.format({ shouldNotParse: "REPLACED" });
      expect(formatted[1].content).toHaveLength(2);
      // Text should not be parsed when allowUnsafeUserTemplate is false
      expect(formatted[1].content[0].text).toContain("{{shouldNotParse}}");
      expect(formatted[1].content[1]).toMatchObject({ 
        type: "video", 
        url: "video.mp4"
      });
    });

    it("preserves non-text content in non-template roles (async)", async () => {
      const prompt = new ChatPrompt("Hello", { allowUnsafeUserTemplate: false });
      // Add a user message with mixed content when template parsing is disabled
      prompt.messages.push({
        role: "user",
        content: [
          { type: "text", text: "Check this {{shouldNotParse}}" },
          { type: "document", url: "document.pdf" }
        ],
        name: undefined,
        tool_call_id: undefined,
        function_call: undefined
      });
      
      const formatted = await prompt.formatAsync({ shouldNotParse: "REPLACED" });
      expect(formatted[1].content).toHaveLength(2);
      // Text should not be parsed when allowUnsafeUserTemplate is false
      expect(formatted[1].content[0].text).toContain("{{shouldNotParse}}");
      expect(formatted[1].content[1]).toMatchObject({ 
        type: "document", 
        url: "document.pdf"
      });
    });

    it("preserves non-text content parts in assistant messages", () => {
      const prompt = new ChatPrompt("Hello");
      // Add a message with mixed content directly to test the non-text preservation path
      prompt.messages.push({
        role: "assistant",
        content: [
          { type: "text", text: "Here's an analysis:" },
          { type: "tool_use", id: "tool_123", name: "analyze", input: {} }
        ],
        name: undefined,
        tool_call_id: undefined,
        function_call: undefined
      });
      
      const formatted = prompt.format({});
      expect(formatted[1].content).toHaveLength(2);
      expect(formatted[1].content[0]).toMatchObject({ type: "text", text: "Here's an analysis:" });
      expect(formatted[1].content[1]).toMatchObject({ 
        type: "tool_use", 
        id: "tool_123", 
        name: "analyze", 
        input: {} 
      });
    });

    it("preserves non-text content when formatting user messages", () => {
      const prompt = new ChatPrompt("Hello");
      // Add message directly to test the format path with non-text content
      prompt.messages.push({
        role: "user",
        content: [
          { type: "text", text: "What's in this {{thing}}?" },
          { type: "image", image_url: { url: "data:image/png;base64,abc" } }
        ],
        name: undefined,
        tool_call_id: undefined,
        function_call: undefined
      });
      
      const formatted = prompt.format({ thing: "image" });
      expect(formatted[1].content).toHaveLength(2);
      expect(formatted[1].content[0]).toMatchObject({ type: "text", text: "What's in this image?" });
      expect(formatted[1].content[1]).toMatchObject({ 
        type: "image", 
        image_url: { url: "data:image/png;base64,abc" } 
      });
    });

    it("handles non-text content in format method", () => {
      const prompt = new ChatPrompt("System message");
      // Add message with non-text content directly
      prompt.messages.push({
        role: "assistant",
        content: [
          { type: "text", text: "Result: {{status}}" },
          { type: "function_call", function_call: { name: "search", arguments: "{}" } }
        ],
        name: undefined,
        tool_call_id: undefined,
        function_call: undefined
      });
      
      const formatted = prompt.format({ status: "complete" });
      expect(formatted[1].content).toHaveLength(2);
      expect(formatted[1].content[0]).toMatchObject({ type: "text", text: "Result: complete" });
      expect(formatted[1].content[1]).toMatchObject({ 
        type: "function_call", 
        function_call: { name: "search", arguments: "{}" } 
      });
    });

    it("handles both string and array content in different messages", () => {
      const prompt = new ChatPrompt("System");
      // First message with string content
      prompt.messages.push({
        role: "system",
        content: [{ type: "text", text: "Simple {{var}}" }],
        name: undefined,
        tool_call_id: undefined,
        function_call: undefined
      });
      
      // Second message with array content including non-text parts
      prompt.messages.push({
        role: "assistant",
        content: [
          { type: "text", text: "Response {{status}}" },
          { type: "tool_use", id: "123", name: "search", input: {} }
        ],
        name: undefined,
        tool_call_id: undefined,
        function_call: undefined
      });
      
      const formatted = prompt.format({ var: "replaced", status: "complete" });
      expect(formatted[1].content[0]).toMatchObject({ type: "text", text: "Simple replaced" });
      expect(formatted[2].content[0]).toMatchObject({ type: "text", text: "Response complete" });
      expect(formatted[2].content[1]).toMatchObject({ 
        type: "tool_use",
        id: "123",
        name: "search",
        input: {}
      });
    });
  });
});
