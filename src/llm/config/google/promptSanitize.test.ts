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

  it("should handle messages with metadata using fromInternal converter", () => {
    // Mock console.warn to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const messagesWithMeta = [
      {
        role: "user",
        content: [{ type: "text", text: "Hello" }],
        _meta: { original: { provider: "gemini" } },
      },
      {
        role: "assistant", 
        content: [{ type: "text", text: "Hi there!" }],
        _meta: { original: { provider: "gemini" } },
      },
    ] as any;

    const result = googleGeminiPromptSanitize(messagesWithMeta, {}, {});
    expect(result).toHaveLength(2);
    
    consoleSpy.mockRestore();
  });

  it("should handle metadata path with system messages", () => {
    // Mock console.warn to avoid noise in test output  
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const messagesWithMeta = [
      {
        role: "system",
        content: [{ type: "text", text: "You are helpful" }],
        _meta: { original: { provider: "gemini" } },
      },
      {
        role: "user",
        content: [{ type: "text", text: "Hello" }],
        _meta: { original: { provider: "gemini" } },
      },
    ] as any;

    const outputObj: Record<string, any> = {};
    const result = googleGeminiPromptSanitize(messagesWithMeta, {}, outputObj);
    
    // The metadata path falls back to legacy logic in test environment
    // System message gets converted to user message with "[System]" prefix, plus regular user message
    expect(result).toHaveLength(2);
    expect(result[0].role).toBe("user");
    expect(result[1].role).toBe("user");
    
    consoleSpy.mockRestore();
  });

  it("should handle only system message with metadata", () => {
    // Mock console.warn to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const messagesWithMeta = [
      {
        role: "system",
        content: [{ type: "text", text: "You are helpful" }],
        _meta: { original: { provider: "gemini" } },
      },
    ] as any;

    const outputObj: Record<string, any> = {};
    const result = googleGeminiPromptSanitize(messagesWithMeta, {}, outputObj);
    
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
    // The metadata path fallback uses legacy logic
    expect(result[0].parts[0].text).toBe("[System] You are helpful");
    
    consoleSpy.mockRestore();
  });

  it("should handle non-string content in system messages with metadata", () => {
    // Mock console.warn to avoid noise in test output
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    const messagesWithMeta = [
      {
        role: "system",
        content: { some: "object" },
        _meta: { original: { provider: "gemini" } },
      },
      {
        role: "user",
        content: [{ type: "text", text: "Hello" }],
        _meta: { original: { provider: "gemini" } },
      },
    ] as any;

    const outputObj: Record<string, any> = {};
    const result = googleGeminiPromptSanitize(messagesWithMeta, {}, outputObj);
    
    // The metadata path fallback will result in legacy processing
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
    
    consoleSpy.mockRestore();
  });


  it("should handle user message with non-string content", () => {
    const messages = [
      {
        role: "user",
        content: 123, // Non-string, non-array content
      } as any,
    ];
    const result = googleGeminiPromptSanitize(messages, {}, {});

    expect(result[0].parts).toEqual([{ text: "123" }]);
  });

  it("should extract system instructions via metadata path (lines 86-87)", () => {
    // Create proper internal messages that fromInternal can process
    const properInternalMessages = [
      {
        role: "system",
        content: [{ type: "text", text: "You are a helpful assistant" }],
        _meta: { original: { provider: "gemini" } },
      },
      {
        role: "user", 
        content: [{ type: "text", text: "Hello world" }],
        _meta: { original: { provider: "gemini" } },
      },
    ];

    // Override fromInternal to return the exact structure needed for lines 86-87
    const originalFromInternal = require('@/converters').fromInternal;
    
    // Temporarily replace fromInternal with a version that returns what we need
    const mockConverters = require('@/converters');
    const originalFunc = mockConverters.fromInternal;
    mockConverters.fromInternal = () => [
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: [{ type: "text", text: "Hello world" }] },
    ];

    const outputObj: Record<string, any> = {};
    const result = googleGeminiPromptSanitize(properInternalMessages, {}, outputObj);

    // Should hit lines 86-87: system instruction extraction
    expect(outputObj.system_instruction).toEqual({
      parts: [{ text: "You are a helpful assistant" }]
    });
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");

    // Restore
    mockConverters.fromInternal = originalFunc;
  });

  it("should convert single system message via metadata path (line 98)", () => {
    // Create single system message with metadata
    const singleSystemMessage = [
      {
        role: "system",
        content: [{ type: "text", text: "You are helpful" }],
        _meta: { original: { provider: "gemini" } },
      },
    ];

    // Override fromInternal to return single system message  
    const mockConverters = require('@/converters');
    const originalFunc = mockConverters.fromInternal;
    mockConverters.fromInternal = () => [
      { role: "system", content: "You are helpful" },
    ];

    const result = googleGeminiPromptSanitize(singleSystemMessage, {}, {});

    // Should hit line 98: convert single system to user message
    expect(result).toHaveLength(1);
    expect(result[0].role).toBe("user");
    expect(result[0].parts[0].text).toBe("You are helpful");

    // Restore
    mockConverters.fromInternal = originalFunc;
  });

  it("should handle fromInternal conversion error (line 115)", () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Create messages with metadata to trigger the path
    const messagesWithMeta = [
      {
        role: "user",
        content: [{ type: "text", text: "Hello" }],
        _meta: { original: { provider: "gemini" } },
      },
    ];

    // Override fromInternal to throw error
    const mockConverters = require('@/converters');
    const originalFunc = mockConverters.fromInternal;
    mockConverters.fromInternal = () => {
      throw new Error("Conversion failed!");
    };

    const result = googleGeminiPromptSanitize(messagesWithMeta, {}, {});

    // Should hit line 115: console.warn for conversion failure
    expect(consoleSpy).toHaveBeenCalledWith(
      "Failed to convert messages back to Gemini format:",
      expect.any(Error)
    );
    expect(result).toHaveLength(1); // Falls back to legacy logic

    // Restore
    mockConverters.fromInternal = originalFunc;
    consoleSpy.mockRestore();
  });
});
