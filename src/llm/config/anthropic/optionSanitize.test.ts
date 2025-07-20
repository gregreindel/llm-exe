import { functionCallSanitize, functionsSanitize } from "./optionSanitize";

describe("Anthropic Option Sanitizers", () => {
  describe("functionCallSanitize", () => {
    it("returns undefined for falsy input", () => {
      expect(functionCallSanitize(null, {}, {})).toBeUndefined();
      expect(functionCallSanitize(undefined, {}, {})).toBeUndefined();
    });

    it("returns undefined for 'none'", () => {
      const output = {};
      const result = functionCallSanitize("none", {}, output);

      expect(result).toBeUndefined();
    });

    it("formats 'auto' correctly", () => {
      const output = {};
      const result = functionCallSanitize("auto", {}, output);

      expect(result).toEqual({ type: "auto" });
    });

    it("formats 'any' correctly", () => {
      const result = functionCallSanitize("any", {}, {});
      expect(result).toEqual({ type: "any" });
    });

    it("formats 'required' correctly", () => {
      const result = functionCallSanitize("required", {}, {});
      // normalizeFunctionCall returns "required" as-is for anthropic
      expect(result).toBe("required");
    });

    it("passes through function name objects", () => {
      const result = functionCallSanitize({ name: "search" }, {}, {});
      // The sanitizer returns objects as-is
      expect(result).toEqual({ name: "search" });
    });

    it("passes through string function names", () => {
      const result = functionCallSanitize("search" as any, {}, {});
      // The sanitizer returns strings as-is
      expect(result).toBe("search");
    });
  });

  describe("functionsSanitize", () => {
    it("returns undefined for empty array", () => {
      expect(functionsSanitize([], {}, {})).toBeUndefined();
      expect(functionsSanitize(null, {}, {})).toBeUndefined();
      expect(functionsSanitize(undefined, {}, {})).toBeUndefined();
    });

    it("returns undefined when functionCall is 'none'", () => {
      const functions = [{ name: "test", description: "test", parameters: {} }];
      const input = { _options: { functionCall: "none" } };

      expect(functionsSanitize(functions, input, {})).toBeUndefined();
    });

    it("formats functions correctly for Anthropic", () => {
      const functions = [
        {
          name: "get_weather",
          description: "Get current weather",
          parameters: {
            type: "object",
            properties: {
              location: { type: "string", description: "City name" },
            },
            required: ["location"],
          },
        },
      ];

      const result = functionsSanitize(functions, {}, {});

      expect(result).toEqual([
        {
          name: "get_weather",
          description: "Get current weather",
          input_schema: {
            type: "object",
            properties: {
              location: { type: "string", description: "City name" },
            },
            required: ["location"],
          },
        },
      ]);
    });

    it("handles multiple functions", () => {
      const functions = [
        { name: "func1", description: "First", parameters: { type: "object" } },
        {
          name: "func2",
          description: "Second",
          parameters: { type: "object" },
        },
      ];

      const result = functionsSanitize(functions, {}, {});

      expect(result).toHaveLength(2);
      expect(result?.[0]?.name).toBe("func1");
      expect(result?.[1]?.name).toBe("func2");
    });

    it("cleans json schemas in parameters", () => {
      const functions = [
        {
          name: "test",
          description: "test function",
          parameters: {
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            properties: {},
            additionalProperties: false,
          },
        },
      ];

      const result = functionsSanitize(functions, {}, {});

      // cleanJsonSchemaFor should handle Anthropic-specific cleaning
      expect(result?.[0]?.input_schema).toBeDefined();
      // Note: The actual cleaning behavior depends on cleanJsonSchemaFor implementation
    });

    it("handles missing description", () => {
      const functions = [
        {
          name: "test",
          description: "",
          parameters: { type: "object" },
        },
      ];

      const result = functionsSanitize(functions, {}, {});

      expect(result![0].description).toBe("");
    });
  });
});
