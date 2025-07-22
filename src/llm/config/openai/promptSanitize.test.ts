import { promptSanitize, useJsonSanitize } from "./promptSanitize";

describe("OpenAI promptSanitize", () => {
  it("converts string to message array", () => {
    expect(promptSanitize("Hello")).toEqual([
      { role: "user", content: "Hello" }
    ]);
  });

  it("passes through regular messages unchanged", () => {
    const messages = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there!" },
      { role: "system", content: "You are helpful" }
    ];
    expect(promptSanitize(messages)).toEqual(messages);
  });

  it("transforms assistant function_call to tool_calls", () => {
    const messages = [{
      role: "assistant",
      content: "I'll check the weather for you.",
      function_call: {
        name: "get_weather",
        arguments: '{"location": "San Francisco"}'
      }
    }];
    
    const result = promptSanitize(messages);
    expect(result[0].role).toBe("assistant");
    expect(result[0].content).toBe("I'll check the weather for you.");
    expect(result[0].tool_calls).toHaveLength(1);
    expect(result[0].tool_calls[0].type).toBe("function");
    expect(result[0].tool_calls[0].function.name).toBe("get_weather");
    expect(result[0].tool_calls[0].function.arguments).toBe('{"location": "San Francisco"}');
    expect(result[0].tool_calls[0].id).toMatch(/^call_[a-f0-9]{24}$/);
    expect(result[0].function_call).toBeUndefined();
  });

  it("handles null content in assistant messages", () => {
    const messages = [{
      role: "assistant",
      content: null,
      function_call: {
        name: "get_weather",
        arguments: '{"location": "SF"}'
      }
    }];
    
    const result = promptSanitize(messages);
    expect(result[0].content).toBeNull();
  });

  it("stringifies non-string function arguments", () => {
    const messages = [{
      role: "assistant",
      function_call: {
        name: "get_weather",
        arguments: { location: "SF" }
      }
    }];
    
    const result = promptSanitize(messages);
    expect(result[0].tool_calls[0].function.arguments).toBe('{"location":"SF"}');
  });

  it("transforms function messages to tool messages", () => {
    const messages = [{
      role: "function",
      name: "get_weather",
      content: "72°F and sunny"
    }];
    
    const result = promptSanitize(messages);
    expect(result[0].role).toBe("tool");
    expect(result[0].content).toBe("72°F and sunny");
    expect(result[0].tool_call_id).toMatch(/^call_[a-f0-9]{24}$/);
  });

  it("preserves existing tool_call_id", () => {
    const messages = [{
      role: "function",
      name: "get_weather",
      content: "72°F",
      tool_call_id: "call_existing123"
    }];
    
    const result = promptSanitize(messages);
    expect(result[0].tool_call_id).toBe("call_existing123");
  });

  it("matches function response with previous assistant call", () => {
    const messages = [
      {
        role: "assistant",
        function_call: {
          name: "get_weather",
          arguments: '{"location": "SF"}'
        }
      },
      {
        role: "function",
        name: "get_weather",
        content: "72°F"
      }
    ];
    
    const result = promptSanitize(messages);
    // Tool call ID should match between assistant and function messages
    expect(result[1].tool_call_id).toBe(result[0].tool_calls[0].id);
  });

  it("handles multiple function calls and responses", () => {
    const messages = [
      {
        role: "assistant",
        function_call: {
          name: "get_weather",
          arguments: '{"location": "SF"}'
        }
      },
      {
        role: "assistant",
        function_call: {
          name: "get_news",
          arguments: '{"topic": "tech"}'
        }
      },
      {
        role: "function",
        name: "get_weather",
        content: "72°F"
      },
      {
        role: "function",
        name: "get_news",
        content: "Latest tech news..."
      }
    ];
    
    const result = promptSanitize(messages);
    // Each function response should match its corresponding call
    expect(result[2].tool_call_id).toBe(result[0].tool_calls[0].id);
    expect(result[3].tool_call_id).toBe(result[1].tool_calls[0].id);
  });

  it("generates new ID when no matching assistant message found", () => {
    const messages = [{
      role: "function",
      name: "orphan_function",
      content: "No matching call"
    }];
    
    const result = promptSanitize(messages);
    expect(result[0].tool_call_id).toMatch(/^call_[a-f0-9]{24}$/);
  });

  it("passes through null unchanged", () => {
    expect(promptSanitize(null)).toEqual([]);
  });

  it("passes through undefined unchanged", () => {
    expect(promptSanitize(undefined)).toEqual([]);
  });
});

describe("OpenAI useJsonSanitize", () => {
  it("returns json_object for truthy values", () => {
    expect(useJsonSanitize(true)).toBe("json_object");
    expect(useJsonSanitize(1)).toBe("json_object");
    expect(useJsonSanitize("yes")).toBe("json_object");
    expect(useJsonSanitize({})).toBe("json_object");
    expect(useJsonSanitize([])).toBe("json_object");
  });

  it("returns text for falsy values", () => {
    expect(useJsonSanitize(false)).toBe("text");
    expect(useJsonSanitize(0)).toBe("text");
    expect(useJsonSanitize("")).toBe("text");
    expect(useJsonSanitize(null)).toBe("text");
    expect(useJsonSanitize(undefined)).toBe("text");
  });
});