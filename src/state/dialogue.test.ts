import { BaseStateItem, Dialogue, createDialogue } from "@/state";
import { IChatUserMessage } from "@/types";
import { assert } from "@/utils/modules/assert";

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

    expect(history[0].role).toEqual("function_call");
    assert(history[0].role === "function_call");
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
        role: "function_call",
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
    expect(history[1].role).toEqual("function_call");
    assert(history[1].role === "function_call");
    expect(history[1].function_call?.name).toEqual("test_fn");
    expect(history[1].function_call?.arguments).toEqual("{}");

    assert(history[2].role === "function");
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

  describe("OutputResultsText handling", () => {
    it("can set assistant message with OutputResultsText object", () => {
      const dialogue = new Dialogue("main");
      const outputResult = {
        type: "text" as const,
        text: "Hello from output result",
      };
      dialogue.setAssistantMessage(outputResult);
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].content).toEqual("Hello from output result");
      expect(history[0].role).toEqual("assistant");
    });
  });

  describe("Tool methods", () => {
    it("setToolCallMessage creates function_call message", () => {
      const dialogue = new Dialogue("main");
      dialogue.setToolCallMessage("testTool", '{"param": "value"}', "tool-123");
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toEqual("function_call");
      assert(history[0].role === "function_call");
      expect(history[0].function_call).toEqual({
        name: "testTool",
        arguments: '{"param": "value"}',
        id: "tool-123",
      });
    });

    it("setToolCallMessage without id", () => {
      const dialogue = new Dialogue("main");
      dialogue.setToolCallMessage("testTool", '{"param": "value"}');
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toEqual("function_call");
      assert(history[0].role === "function_call");
      expect(history[0].function_call).toEqual({
        name: "testTool",
        arguments: '{"param": "value"}',
        id: undefined,
      });
    });

    it("setToolMessage creates function message", () => {
      const dialogue = new Dialogue("main");
      dialogue.setToolMessage("Tool response", "testTool", "tool-123");
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toEqual("function");
      assert(history[0].role === "function");
      expect(history[0].name).toEqual("testTool");
      expect(history[0].content).toEqual("Tool response");
      expect(history[0].id).toEqual("tool-123");
    });

    it("setToolMessage without id", () => {
      const dialogue = new Dialogue("main");
      dialogue.setToolMessage("Tool response", "testTool");
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toEqual("function");
      assert(history[0].role === "function");
      expect(history[0].name).toEqual("testTool");
      expect(history[0].content).toEqual("Tool response");
      expect(history[0].id).toEqual(undefined);
    });
  });

  describe("Error handling", () => {
    it("throws error when setFunctionCallMessage called without function_call", () => {
      const dialogue = new Dialogue("main");
      expect(() => {
        dialogue.setFunctionCallMessage(null as any);
      }).toThrow("Invalid arguments");
    });

    it("throws error when setFunctionCallMessage called with invalid input", () => {
      const dialogue = new Dialogue("main");
      expect(() => {
        dialogue.setFunctionCallMessage({ function_call: null as any });
      }).toThrow("Invalid arguments");
    });
  });

  describe("setHistory edge cases", () => {
    it("handles model role as assistant", () => {
      const dialogue = new Dialogue("main");
      dialogue.setHistory([
        {
          role: "model",
          content: "Model response",
        },
      ]);
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toEqual("assistant");
      expect(history[0].content).toEqual("Model response");
    });

    it("handles unknown role in setHistory", () => {
      const dialogue = new Dialogue("main");
      dialogue.setHistory([
        {
          role: "custom-role" as any,
          content: "Custom content",
        },
      ]);
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toEqual("custom-role");
      expect(history[0].content).toEqual("Custom content");
    });

    it("handles unknown role with no content in setHistory", () => {
      const dialogue = new Dialogue("main");
      dialogue.setHistory([
        {
          role: "custom-role" as any,
        } as any,
      ]);
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toEqual("custom-role");
      expect(history[0].content).toEqual("");
    });

    it("handles function_call with id in setHistory", () => {
      const dialogue = new Dialogue("main");
      dialogue.setHistory([
        {
          role: "function_call",
          content: null,
          function_call: {
            name: "testFunc",
            arguments: '{"test": true}',
            id: "func-456",
          },
        },
      ]);
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toEqual("function_call");
      assert(history[0].role === "function_call");
      expect(history[0].function_call?.id).toEqual("func-456");
    });
  });

  describe("Additional coverage", () => {
    it("setUserMessage with detailed content array", () => {
      const dialogue = new Dialogue("main");
      const detailedContent = [
        { type: "text" as const, text: "Hello" },
        { type: "image_url" as const, image_url: { url: "https://example.com/image.jpg" } },
      ];
      dialogue.setUserMessage(detailedContent);
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toEqual("user");
      expect(history[0].content).toEqual(detailedContent);
    });

    it("setMessageTurn with system message", () => {
      const dialogue = new Dialogue("main");
      dialogue.setMessageTurn("User msg", "Assistant msg", "System msg");
      const history = dialogue.getHistory();
      expect(history).toHaveLength(3);
      expect(history[0].content).toEqual("User msg");
      expect(history[1].content).toEqual("Assistant msg");
      expect(history[2].content).toEqual("System msg");
      expect(history[2].role).toEqual("system");
    });

    it("does not set function message with empty content", () => {
      const dialogue = new Dialogue("main");
      dialogue.setFunctionMessage("", "test_fn");
      const history = dialogue.getHistory();
      expect(history).toHaveLength(0);
    });

    it("setFunctionMessage with id parameter", () => {
      const dialogue = new Dialogue("main");
      dialogue.setFunctionMessage("Result", "test_fn", "func-789");
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].role).toEqual("function");
      assert(history[0].role === "function");
      expect(history[0].id).toEqual("func-789");
    });

    it("setFunctionCallMessage stringifies object arguments", () => {
      const dialogue = new Dialogue("main");
      dialogue.setFunctionCallMessage({
        function_call: { 
          name: "test_fn", 
          arguments: { key: "value" } as any 
        },
      });
      const history = dialogue.getHistory();
      expect(history).toHaveLength(1);
      assert(history[0].role === "function_call");
      expect(history[0].function_call?.arguments).toEqual('{"key":"value"}');
    });
  });
});
