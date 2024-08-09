import { BaseStateItem, Dialogue, createDialogue } from "@/state";
import { IChatUserMessage } from "@/types";
import { assert } from "@/utils";

/**
 * Tests Dialogue
 */
describe("llm-exe:state/Dialogue", () => {
  it("defaults to text dialogue", () => {
    const dialogue = createDialogue("main");
    expect(dialogue).toBeInstanceOf(Dialogue);
    expect(dialogue).toBeInstanceOf(BaseStateItem);
  });

  it("defaults to text dialogue", () => {
    const dialogue = new Dialogue("main");
    expect(dialogue).toBeInstanceOf(Dialogue);
    expect(dialogue).toHaveProperty("name");
    expect(dialogue.name).toEqual("main");
  });
  it("can set user message on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setUserMessage("Hello, anybody home?");
    const history = dialogue.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].content).toEqual("Hello, anybody home?");
    expect(history[0].role).toEqual("user");
  });
  it("can set user message with name on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setUserMessage("Hello, anybody home?", "Greg");
    const history = dialogue.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].content).toEqual("Hello, anybody home?");
    expect(history[0].role).toEqual("user");
    if (history[0].role === "user") {
      expect(history[0]?.name).toEqual("Greg");
    }
  });
  it("does not set empty user message on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setUserMessage("");
    const history = dialogue.getHistory();
    expect(history).toHaveLength(0);
  });
  it("can set assistant message on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setAssistantMessage("Hello, anybody home?");
    const history = dialogue.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].content).toEqual("Hello, anybody home?");
    expect(history[0].role).toEqual("assistant");
  });
  it("does not set assistant user message on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setAssistantMessage("");
    const history = dialogue.getHistory();
    expect(history).toHaveLength(0);
  });
  it("can set system message on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setSystemMessage("Hello, anybody home?");
    const history = dialogue.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].content).toEqual("Hello, anybody home?");
    expect(history[0].role).toEqual("system");
  });
  it("does not set system user message on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setSystemMessage("");
    const history = dialogue.getHistory();
    expect(history).toHaveLength(0);
  });

  it("can set function message on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setFunctionMessage(`{}`, "test_fn");
    const history = dialogue.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].content).toEqual("{}");
    expect(history[0].role).toEqual("function");
    assert(history[0].role === "function");
    expect(history[0].name).toEqual("test_fn");
  });

  it("can set function_call message on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setFunctionCallMessage({
      function_call: { name: "test_fn", arguments: '{arg1: "Hello"}' },
    });
    const history = dialogue.getHistory();
    expect(history).toHaveLength(1);

    expect(history[0].role).toEqual("assistant");
    assert(history[0].role === "assistant");
    assert(history[0].content === null);
    expect(history[0].function_call).toEqual({
      name: "test_fn",
      arguments: '{arg1: "Hello"}',
    });
  });

  it("setFunctionMessage is chainable", () => {
    const dialogue = new Dialogue("main");
    expect(dialogue.setFunctionMessage(`{}`, "test_fn")).toBeInstanceOf(
      Dialogue
    );
  });

  it("setFunctionMessage is chainable", () => {
    const dialogue = new Dialogue("main");
    expect(dialogue.setFunctionMessage(`{}`, "test_fn")).toBeInstanceOf(
      Dialogue
    );
  });

  it("can set all messages on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setSystemMessage("This is the system message.");
    dialogue.setUserMessage("This is the user message");
    dialogue.setAssistantMessage("Hello, this is the assistant");
    const history = dialogue.getHistory();
    expect(history).toHaveLength(3);
    expect(history[0].content).toEqual("This is the system message.");
    expect(history[0].role).toEqual("system");

    expect(history[1].content).toEqual("This is the user message");
    expect(history[1].role).toEqual("user");

    expect(history[2].content).toEqual("Hello, this is the assistant");
    expect(history[2].role).toEqual("assistant");
  });
  it("does not set system user message on state", () => {
    const dialogue = new Dialogue("main");
    dialogue.setMessageTurn("Hi, anyone there?", "Yes! we're always here");
    const history = dialogue.getHistory();
    expect(history).toHaveLength(2);

    expect(history[0].content).toEqual("Hi, anyone there?");
    expect(history[0].role).toEqual("user");

    expect(history[1].content).toEqual("Yes! we're always here");
    expect(history[1].role).toEqual("assistant");
  });
  it("can set multiple messages from history", () => {
    const dialogue = new Dialogue("main");

    dialogue.setHistory([
      {
        role: "user",
        content: "Hello?",
      },
      {
        role: "assistant",
        content: "Hello!!",
      },
      {
        role: "system",
        content: "Stop saying hello",
      },
    ]);

    const history = dialogue.getHistory();
    expect(history).toHaveLength(3);

    expect(history[0].content).toEqual("Hello?");
    expect(history[0].role).toEqual("user");

    expect(history[1].content).toEqual("Hello!!");
    expect(history[1].role).toEqual("assistant");

    expect(history[2].content).toEqual("Stop saying hello");
    expect(history[2].role).toEqual("system");
  });
  it("can set multiple messages from history", () => {
    const dialogue = new Dialogue("main");

    dialogue.setHistory([
      {
        role: "user",
        content: "Hello?",
        name: "Greg",
      },
    ]);

    const history = dialogue.getHistory();
    expect(history).toHaveLength(1);

    expect(history[0].content).toEqual("Hello?");
    expect(history[0].role).toEqual("user");
    expect((history[0] as IChatUserMessage).name).toEqual("Greg");
  });

  it("can set multiple messages with functions from history", () => {
    const dialogue = new Dialogue("main");

    dialogue.setHistory([
      {
        role: "user",
        content: "Hello?",
      },
      {
        role: "assistant",
        content: null,
        function_call: {
          name: "test_fn",
          arguments: "{}",
        },
      },
      {
        role: "function",
        content: "Output",
        name: "test_fn",
      },
      {
        role: "system",
        content: "Stop saying hello",
      },
    ]);

    const history = dialogue.getHistory();
    expect(history).toHaveLength(4);

    expect(history[0].content).toEqual("Hello?");
    expect(history[0].role).toEqual("user");

    expect(history[1].content).toEqual(null);
    expect(history[1].role).toEqual("assistant");
    assert(history[1].role === "assistant")
    expect(history[1].function_call?.name).toEqual("test_fn");
    expect(history[1].function_call?.arguments).toEqual("{}");

    assert(history[2].role === "function")
    expect(history[2].role).toEqual("function");
    expect(history[2].name).toEqual("test_fn");
    expect(history[2].content).toEqual("Output");

    expect(history[3].content).toEqual("Stop saying hello");
    expect(history[3].role).toEqual("system");
  });

  it("can serialize state item", () => {
    const dialogue = new Dialogue("main");
    dialogue.setMessageTurn("Hi, anyone there?", "Yes! we're always here");
    expect(dialogue.serialize()).toEqual({
      class: "Dialogue",
      name: "main",
      value: [
        { role: "user", content: "Hi, anyone there?" },
        { role: "assistant", content: "Yes! we're always here" },
      ],
    });
  });
});
