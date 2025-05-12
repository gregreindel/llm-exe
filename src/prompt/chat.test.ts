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
    expect(format).toEqual([{ content: "Hello", role: "system" }]);
  });


  it("parses detailed user message", () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage([{
      type: "text",
      text: "Hello"
    }])
    const format = prompt.format({});
    expect(format).toEqual([{"content": [{"text": "Hello", "type": "text"}], "role": "user"}]);
  });

  it("parses detailed user message (async)", async () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage([{
      type: "text",
      text: "Hello"
    }])
    const format = await prompt.formatAsync({});
    expect(format).toEqual([{"content": [{"text": "Hello", "type": "text"}], "role": "user"}]);
  });

  it("parses detailed user message fallback", () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage([{
      type: "image",
      image_url: {
        url: "www.url.string"
      }
    }])
    const format = prompt.format({});
    expect(format).toEqual([{"content": [{"type": "image", image_url: { url: "www.url.string"} }], "role": "user"}]);
  });

  it("parses detailed user message fallback (async)", async () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage([{
      type: "image",
      image_url: {
        url: "www.url.string"
      }
    }])
    const format = await prompt.formatAsync({});
    expect(format).toEqual([{"content": [{"type": "image", image_url: { url: "www.url.string"} }], "role": "user"}]);
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
    expect(format).toEqual([{ content: "Hello World", role: "system" }]);
  });

  it("does allow template rendering in user messages by default", () => {
    const prompt = new ChatPrompt();
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`);
    const format = prompt.format({ replaceWithWorld: "World" });
    expect(format).toEqual([
      { content: "Hello World", role: "user" },
    ]);
  });


  it("does not allow template rendering in user messages if set", () => {
    const prompt = new ChatPrompt(undefined, { allowUnsafeUserTemplate: false });
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`);
    const format = prompt.format({ replaceWithWorld: "World" });
    expect(format).toEqual([
      { content: "Hello {{replaceWithWorld}}", role: "user" },
    ]);
  });


  it("does not allow template rendering in user messages (async)", async () => {
    const prompt = new ChatPrompt(undefined, { allowUnsafeUserTemplate: false });
    async function replaceWithWorld() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("World");
        }, 200);
      });
    }
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`);
    const format = await prompt.formatAsync({ replaceWithWorld });
    expect(format).toEqual([
      { content: "Hello {{replaceWithWorld}}", role: "user" },
    ]);
  });

  it("does allow template rendering in user messages with allowUnsafeUserTemplate", () => {
    const prompt = new ChatPrompt("", { allowUnsafeUserTemplate: true });
    prompt.addUserMessage(`Hello {{replaceWithWorld}}`);
    const format = prompt.format({ replaceWithWorld: "World" });
    expect(format).toEqual([{ content: "Hello World", role: "user" }]);
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
  it("addAssistantMessage to add assistant message", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addAssistantMessage("World");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "assistant" },
    ]);
  });
  it("validate defaults to true", () => {
    const prompt = new ChatPrompt("Hello");
    expect(prompt.validate()).toEqual(true);
  });

  it("addToPrompt to add assistant message", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "assistant");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "assistant" },
    ]);
  });
  it("addToPrompt to add user message", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "user");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "user" },
    ]);
  });
  it("addToPrompt to add user message with name", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("World", "user", "Greg");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "World", role: "user", name: "Greg" },
    ]);
  });

  it("addToPrompt to add function message with name", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("Output", "function", "test_fn");
    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "Output", role: "function", name: "test_fn" },
    ]);
  });


  it("addToPrompt to add function message with name (async)", async () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("Output", "function", "test_fn");
    const format = await prompt.formatAsync({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      { content: "Output", role: "function", name: "test_fn" },
    ]);
  });

  it("addToPrompt to add function_call message with name", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addToPrompt("{}", "function_call", "test_fn");

    assert(prompt.messages[1].role === "assistant");

    const format = prompt.format({});
    expect(format).toEqual([
      { content: "Hello", role: "system" },
      {
        content: null,
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
      { content: null, role: "assistant", function_call: { name: "test_fn", arguments: "{}"} },
      { content: "Function Output", name: "test_fn", role: "function" },
    ]);

    expect(prompt.format({})).toEqual([
      { content: "Hello", role: "system" },
      { content: "Message user", role: "user" },
      { content: "Message assistant", role: "assistant" },
      { content: "Message system", role: "system" },
      { content: null, role: "assistant", function_call: { name: "test_fn", arguments: "{}"} },
      { content: "Function Output", name: "test_fn", role: "function" },
    ]);
  });

  it("can add messages from history (async)", async () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addFromHistory([
      { content: "Message user", role: "user" },
      { content: "Message assistant", role: "assistant" },
      { content: "Message system", role: "system" },
      { content: null, role: "assistant", function_call: { name: "test_fn", arguments: "{}"} },
      { content: "Function Output", name: "test_fn", role: "function" },
    ]);

    const formatted = await prompt.formatAsync({})

    expect(formatted).toEqual([
      { content: "Hello", role: "system" },
      { content: "Message user", role: "user" },
      { content: "Message assistant", role: "assistant" },
      { content: "Message system", role: "system" },
      { content: null, role: "assistant", function_call: { name: "test_fn", arguments: "{}"} },
      { content: "Function Output", name: "test_fn", role: "function" },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder", () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder");

    expect(
      prompt.format({
        myPlaceholder: [
          { content: "Message user", role: "user" },
          { content: "Message assistant", role: "assistant" },
          { content: "Message system", role: "system" },
          { content: null, role: "assistant", function_call: { name: "test_fn", arguments: "{}"} },
          { content: "Function Output", name: "test_fn", role: "function" },
        ],
      })
    ).toEqual([
      { content: "Hello", role: "system" },
      { content: "Message user", role: "user" },
      { content: "Message assistant", role: "assistant" },
      { content: "Message system", role: "system" },
      { content: null, role: "assistant", function_call: { name: "test_fn", arguments: "{}"} },
      { content: "Function Output", name: "test_fn", role: "function" },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder (async)", async () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder");

    const formatted = await prompt.formatAsync({
      myPlaceholder: [
        { content: "Message user", role: "user" },
        { content: "Message assistant", role: "assistant" },
        { content: "Message system", role: "system" },
        { content: null, role: "assistant", function_call: { name: "test_fn", arguments: "{}"} },
        { content: "Function Output", name: "test_fn", role: "function" },
      ],
    })
    expect(
      formatted
    ).toEqual([
      { content: "Hello", role: "system" },
      { content: "Message user", role: "user" },
      { content: "Message assistant", role: "assistant" },
      { content: "Message system", role: "system" },
      { content: null, role: "assistant", function_call: { name: "test_fn", arguments: "{}"} },
      { content: "Function Output", name: "test_fn", role: "function" },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder with user", () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder", { user: "NotGreg"});

    expect(
      prompt.format({
        myPlaceholder: [
          { content: "Message user", role: "user", name: "Greg" },
          { content: "Message assistant", role: "assistant" },
        ],
      })
    ).toEqual([
      { content: "Hello", role: "system" },
      { content: "Message user", role: "user", name: "NotGreg" },
      { content: "Message assistant", role: "assistant" },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder with user (async)", async () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder", { user: "NotGreg"});
    const formatted = await  prompt.formatAsync({
      myPlaceholder: [
        { content: "Message user", role: "user", name: "Greg" },
        { content: "Message assistant", role: "assistant" },
      ],
    })

    expect(
     formatted
    ).toEqual([
      { content: "Hello", role: "system" },
      { content: "Message user", role: "user", name: "NotGreg" },
      { content: "Message assistant", role: "assistant" },
    ]);
  });

  it("can add messages from addChatHistoryPlaceholder with options", () => {
    const prompt = new ChatPrompt("Hello");

    prompt.addChatHistoryPlaceholder("myPlaceholder", {
      assistant: "Support",
      user: "Customer",
    });

    expect(prompt.messages).toEqual([
      { role: "system", content: "Hello" },
      {
        role: "placeholder",
        content:
          "{{> DialogueHistory key='myPlaceholder' assistant='Support' user='Customer'}}",
      },
    ]);
  });
  
  it("can add user messages from addMessagePlaceholder defaults to user", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text");
    expect(prompt.format({})).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "user" },
    ]);
  });

  it("can add user messages from addMessagePlaceholder defaults to user (async)", async () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text");
    const formatted = await prompt.formatAsync({})
    expect(formatted).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "user" },
    ]);
  });

  it("can add user messages from addMessagePlaceholder", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "user");
    expect(prompt.format({})).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "user" },
    ]);
  });

  it("can add user messages from addMessagePlaceholder (async)", async () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "user");
    const formatted = await prompt.formatAsync({})
    expect(formatted).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "user" },
    ]);
  });


  it("can add user messages  with name from addMessagePlaceholder", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "user", "Greg");
    expect(prompt.format({})).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "user", name: "Greg" },
    ]);
  });


  it("can add user messages  with name from addMessagePlaceholder (async)", async () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "user", "Greg");
    const formatted = await prompt.formatAsync({})
    expect(formatted).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "user", name: "Greg" },
    ]);
  });

  it("can add user messages from addMessagePlaceholder and they get replaced", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("{{userInput}}", "user");
    expect(prompt.format({ userInput: "Some Plain Text" })).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "user" },
    ]);
  });


  it("can add user messages from addMessagePlaceholder and they get replaced (async)", async () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("{{userInput}}", "user");
    const formatted = await prompt.formatAsync({ userInput: "Some Plain Text" })
    expect(formatted).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "user" },
    ]);
  });

  it("can add assistant messages from addMessagePlaceholder", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "assistant");
    expect(prompt.format({})).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "assistant" },
    ]);
  });
  it("can add system messages from addMessagePlaceholder", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "system");
    expect(prompt.format({})).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "system" },
    ]);
  });

  it("can add custom user name to messages from addMessagePlaceholder", () => {
    const prompt = new ChatPrompt("Hello");
    prompt.addMessagePlaceholder("Some Plain Text", "user", "Greg");
    expect(prompt.format({})).toEqual([
      { content: "Hello", role: "system" },
      { content: "Some Plain Text", role: "user", name: "Greg" },
    ]);
  });
});
