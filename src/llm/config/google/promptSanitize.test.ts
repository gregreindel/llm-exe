import { googleGeminiPromptSanitize } from "./promptSanitize";

describe("googleGeminiPromptSanitize", () => {
  it("should throw error if input is not a string or array", () => {
    expect(() =>
      googleGeminiPromptSanitize(
        { someWrongObject: "value" } as any,
        { someInput: "value" },
        { someOutput: "value" }
      )
    ).toThrowError("Invalid messages format");
  });

  it("should return the string directly if _messages is a string", () => {
    const result = googleGeminiPromptSanitize(
      "Hello world",
      { someInput: "value" },
      { someOutput: "value" }
    );
    expect(result).toEqual([
      { role: "user", parts: [{ text: "Hello world" }] },
    ]);
  });

  it("should handle null/undefined", () => {
    expect(googleGeminiPromptSanitize(null as any, {}, {})).toEqual([]);
    expect(googleGeminiPromptSanitize(undefined as any, {}, {})).toEqual([]);
  });

  it("should throw an error if _messages is an empty array", () => {
    expect(() => googleGeminiPromptSanitize([], {}, {})).toThrow(
      "Empty messages array"
    );
  });

  it("should return the single user message if provided a single system message", () => {
    const result = googleGeminiPromptSanitize(
      [{ role: "system", content: "Hello World" }],
      { someInput: "value" },
      { someOutput: "value" }
    );
    expect(result).toEqual([
      { role: "user", parts: [{ text: "Hello World" }] },
    ]);
  });

  it("should extract system messages to system_instruction", () => {
    const out = {};
    const result = googleGeminiPromptSanitize(
      [
        { role: "system", content: "Hello World" },
        { role: "user", content: "User message" },
      ],
      { someInput: "value" },
      out
    );

    expect((out as any).system_instruction).toEqual({
      parts: [{ text: "Hello World" }],
    });
    expect(result).toEqual([
      { role: "user", parts: [{ text: "User message" }] },
    ]);
  });

  it("should handle multiple system messages", () => {
    const out = {};
    const result = googleGeminiPromptSanitize(
      [
        { role: "system", content: "System 1" },
        { role: "user", content: "User message" },
        { role: "system", content: "System 2" },
      ],
      {},
      out
    );

    expect((out as any).system_instruction).toEqual({
      parts: [{ text: "System 1" }, { text: "System 2" }],
    });
    expect(result).toEqual([
      { role: "user", parts: [{ text: "User message" }] },
    ]);
  });

  it("should transform assistant messages to model role", () => {
    const result = googleGeminiPromptSanitize(
      [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there!" },
      ],
      {},
      {}
    );

    expect(result).toEqual([
      { role: "user", parts: [{ text: "Hello" }] },
      { role: "model", parts: [{ text: "Hi there!" }] },
    ]);
  });

  it("should transform assistant function_call to functionCall", () => {
    const messages = [
      {
        role: "assistant",
        content: "I'll check the weather for you.",
        function_call: {
          name: "get_weather",
          arguments: '{"location": "San Francisco"}',
        },
      } as any,
    ];
    const result = googleGeminiPromptSanitize(messages, {}, {});

    expect(result[0].role).toBe("model");
    expect(result[0].parts).toHaveLength(2);
    expect(result[0].parts[0]).toEqual({
      text: "I'll check the weather for you.",
    });
    expect(result[0].parts[1]).toEqual({
      functionCall: {
        name: "get_weather",
        args: { location: "San Francisco" },
      },
    });
  });

  it("should handle assistant function_call without text content", () => {
    const messages = [
      {
        role: "assistant",
        function_call: {
          name: "get_weather",
          arguments: '{"location": "SF"}',
        },
      } as any,
    ];
    const result = googleGeminiPromptSanitize(messages, {}, {});

    expect(result[0].parts).toHaveLength(1);
    expect((result[0].parts[0] as any).functionCall).toBeDefined();
  });

  it("should handle function_call with object arguments", () => {
    const messages = [
      {
        role: "assistant",
        function_call: {
          name: "get_weather",
          arguments: { location: "SF" },
        },
      } as any,
    ];
    const result = googleGeminiPromptSanitize(messages, {}, {});

    expect((result[0].parts[0] as any).functionCall.args).toEqual({ location: "SF" });
  });

  it("should transform function messages to functionResponse in user role", () => {
    const messages = [
      {
        role: "function",
        name: "get_weather",
        content: "72°F and sunny",
      } as any,
    ];
    const result = googleGeminiPromptSanitize(messages, {}, {});

    expect(result[0].role).toBe("user");
    expect(result[0].parts).toHaveLength(1);
    expect(result[0].parts[0]).toEqual({
      functionResponse: {
        name: "get_weather",
        response: {
          result: "72°F and sunny",
        },
      },
    });
  });

  it("should handle user messages with array content", () => {
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: "Hello" },
          { type: "image", data: "base64..." },
        ],
      } as any,
    ];
    const result = googleGeminiPromptSanitize(messages, {}, {});

    expect(result[0].parts).toEqual(messages[0].content);
  });

  it("should handle complete conversation flow", () => {
    const messages = [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: "What's the weather?" },
      {
        role: "assistant",
        content: "Let me check that for you.",
        function_call: {
          name: "get_weather",
          arguments: '{"location": "NYC"}',
        },
      } as any,
      {
        role: "function",
        name: "get_weather",
        content: "75°F",
      } as any,
      { role: "assistant", content: "It's 75°F in NYC." },
    ];

    const outputObj: Record<string, any> = {};
    const result = googleGeminiPromptSanitize(messages, {}, outputObj);

    expect(outputObj.system_instruction).toEqual({
      parts: [{ text: "You are a helpful assistant" }],
    });
    expect(result).toHaveLength(4);
    expect(result[0].role).toBe("user"); // user message
    expect(result[1].role).toBe("model"); // assistant with function call
    expect(result[1].parts).toHaveLength(2); // text + functionCall
    expect(result[2].role).toBe("user"); // function response
    expect((result[2].parts[0] as any).functionResponse).toBeDefined();
    expect(result[3].role).toBe("model"); // final assistant response
  });

  it("should handle non-standard roles", () => {
    const messages = [{ role: "custom", content: "Custom message" } as any];
    const result = googleGeminiPromptSanitize(messages, {}, {});

    expect(result[0]).toEqual({
      role: "custom",
      parts: [{ text: "Custom message" }],
    });
  });
});
