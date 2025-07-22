import { IChatMessages } from "@/interfaces";
import { anthropicPromptSanitize } from "./promptSanitize";

describe("anthropicPromptSanitize", () => {
  it("should handle string messages", () => {
    const result = anthropicPromptSanitize("Hello, World!", {}, {});
    expect(result).toEqual([{ role: "user", content: "Hello, World!" }]);
  });

  it("should handle null/undefined", () => {
    expect(anthropicPromptSanitize(null as any, {}, {})).toEqual([]);
    expect(anthropicPromptSanitize(undefined as any, {}, {})).toEqual([]);
  });

  it("should handle IChatMessages with single system message first", () => {
    const messages: IChatMessages = [
      { role: "system", content: "Hello, World!" },
    ];
    const outputObj: Record<string, any> = {};
    const result = anthropicPromptSanitize(messages, {}, outputObj);

    expect(outputObj).toEqual({});
    expect(result).toEqual([{ role: "user", content: "Hello, World!" }]);
  });

  it("should handle IChatMessages with system message first", () => {
    const messages: IChatMessages = [
      { role: "system", content: "This is a system message" },
      { role: "user", content: "Hello, World!" },
    ];
    const outputObj: Record<string, any> = {};
    const result = anthropicPromptSanitize(messages, {}, outputObj);

    expect(outputObj).toEqual({ system: "This is a system message" });
    expect(result).toEqual([
      { role: "user", content: "Hello, World!" }
    ]);
  });

  it("should handle IChatMessages without system message first", () => {
    const messages: IChatMessages = [
      { role: "user", content: "Hello, World!" },
      { role: "assistant", content: "Hi there!" },
    ];
    const outputObj: Record<string, any> = {};
    const result = anthropicPromptSanitize(messages, {}, outputObj);

    expect(outputObj).toEqual({});
    expect(result).toEqual([
      { role: "user", content: "Hello, World!" },
      { role: "assistant", content: "Hi there!" }
    ]);
  });

  it("should handle IChatMessages with system message first and later", () => {
    const messages: IChatMessages = [
      { role: "system", content: "This is a system message" },
      { role: "user", content: "Hello, World!" },
      {
        role: "system",
        content: "This is a second system message that gets converted to user",
      },
    ];
    const outputObj: Record<string, any> = {};
    const result = anthropicPromptSanitize(messages, {}, outputObj);

    expect(outputObj).toEqual({ system: "This is a system message" });
    expect(result).toEqual([
      { role: "user", content: "Hello, World!" },
      {
        role: "user",
        content: "This is a second system message that gets converted to user"
      },
    ]);
  });

  it("should transform assistant function_call to tool_use", () => {
    const messages: IChatMessages = [
      {
        role: "assistant",
        content: "I'll check the weather for you.",
        function_call: {
          name: "get_weather",
          arguments: '{"location": "San Francisco"}'
        }
      } as any
    ];
    const result = anthropicPromptSanitize(messages, {}, {});
    
    expect(result[0].role).toBe("assistant");
    expect(result[0].content).toHaveLength(2);
    expect(result[0].content[0]).toEqual({
      type: "text",
      text: "I'll check the weather for you."
    });
    expect(result[0].content[1].type).toBe("tool_use");
    expect(result[0].content[1].name).toBe("get_weather");
    expect(result[0].content[1].input).toEqual({ location: "San Francisco" });
    expect(result[0].content[1].id).toMatch(/^toolu_[a-f0-9]{23}$/);
  });

  it("should handle assistant function_call without text content", () => {
    const messages: IChatMessages = [
      {
        role: "assistant",
        function_call: {
          name: "get_weather",
          arguments: '{"location": "SF"}'
        }
      } as any
    ];
    const result = anthropicPromptSanitize(messages, {}, {});
    
    expect(result[0].content).toHaveLength(1);
    expect(result[0].content[0].type).toBe("tool_use");
  });

  it("should transform function messages to tool_result", () => {
    const messages: IChatMessages = [
      {
        role: "function",
        name: "get_weather",
        content: "72°F and sunny"
      } as any
    ];
    const result = anthropicPromptSanitize(messages, {}, {});
    
    expect(result[0].role).toBe("user");
    expect(result[0].content).toHaveLength(1);
    expect(result[0].content[0].type).toBe("tool_result");
    expect(result[0].content[0].content).toBe("72°F and sunny");
    expect(result[0].content[0].tool_use_id).toMatch(/^toolu_[a-f0-9]{23}$/);
  });

  it("should batch consecutive function messages", () => {
    const messages: IChatMessages = [
      {
        role: "function",
        name: "get_weather",
        content: "72°F"
      } as any,
      {
        role: "function",
        name: "get_news",
        content: "Latest news..."
      } as any
    ];
    const result = anthropicPromptSanitize(messages, {}, {});
    
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
    expect(result[0].content).toHaveLength(2);
    expect(result[0].content[0].type).toBe("tool_result");
    expect(result[0].content[1].type).toBe("tool_result");
  });

  it("should match function responses with previous tool calls", () => {
    const messages: IChatMessages = [
      {
        role: "assistant",
        function_call: {
          name: "get_weather",
          arguments: '{"location": "SF"}'
        }
      } as any,
      {
        role: "function",
        name: "get_weather",
        content: "72°F"
      } as any
    ];
    const result = anthropicPromptSanitize(messages, {}, {});
    
    // Tool use ID should match tool result ID
    const toolUseId = result[0].content[0].id;
    const toolResultId = result[1].content[0].tool_use_id;
    expect(toolResultId).toBe(toolUseId);
  });

  it("should preserve existing tool_call_id", () => {
    const messages: IChatMessages = [
      {
        role: "function",
        name: "get_weather",
        content: "72°F",
        tool_call_id: "toolu_existing123"
      } as any
    ];
    const result = anthropicPromptSanitize(messages, {}, {});
    
    expect(result[0].content[0].tool_use_id).toBe("toolu_existing123");
  });

  it("should handle empty function content", () => {
    const messages: IChatMessages = [
      {
        role: "function",
        name: "void_function",
        content: ""
      } as any
    ];
    const result = anthropicPromptSanitize(messages, {}, {});
    
    expect(result[0].content[0].content).toBe("No response");
  });

  it("should preserve user string messages", () => {
    const messages: IChatMessages = [
      { role: "user", content: "Hello" }
    ];
    const result = anthropicPromptSanitize(messages, {}, {});
    
    expect(result[0].content).toEqual("Hello");
  });

  it("should preserve user messages with existing content blocks", () => {
    const messages: IChatMessages = [
      {
        role: "user",
        content: [
          { type: "text", text: "Hello" },
          { type: "image", source: { type: "base64", media_type: "image/png", data: "..." } }
        ]
      } as any
    ];
    const result = anthropicPromptSanitize(messages, {}, {});
    
    expect(result[0]).toEqual(messages[0]);
  });

  it("should handle complex conversation with system message", () => {
    const messages: IChatMessages = [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: "What's the weather?" },
      {
        role: "assistant",
        content: "Let me check that for you.",
        function_call: { name: "get_weather", arguments: '{"location": "NYC"}' }
      } as any,
      {
        role: "function",
        name: "get_weather",
        content: "75°F"
      } as any,
      { role: "assistant", content: "It's 75°F in NYC." }
    ];
    
    const outputObj: Record<string, any> = {};
    const result = anthropicPromptSanitize(messages, {}, outputObj);
    
    expect(outputObj.system).toBe("You are a helpful assistant");
    expect(result).toHaveLength(4);
    expect(result[0].role).toBe("user"); // user message
    expect(result[1].role).toBe("assistant"); // assistant with tool use
    expect(result[2].role).toBe("user"); // tool result
    expect(result[3].role).toBe("assistant"); // final assistant response
  });
});