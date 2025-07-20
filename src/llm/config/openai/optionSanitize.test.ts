import {
  jsonSchemaSanitize,
  functionCallSanitize,
  functionsSanitize,
} from "./optionSanitize";

describe("OpenAI Option Sanitizers", () => {
  describe("jsonSchemaSanitize", () => {
    it("returns undefined for falsy input", () => {
      expect(jsonSchemaSanitize(null, {})).toBeUndefined();
      expect(jsonSchemaSanitize(undefined, {})).toBeUndefined();
      expect(jsonSchemaSanitize(false, {})).toBeUndefined();
    });

    it("formats json schema without strict mode", () => {
      const schema = {
        type: "object",
        properties: { name: { type: "string" } },
      };
      const result = jsonSchemaSanitize(schema, {});

      expect(result).toEqual({
        type: "json_schema",
        json_schema: {
          name: "output",
          strict: false,
          schema: { type: "object", properties: { name: { type: "string" } } },
        },
      });
    });

    it("applies strict mode when functionCallStrictInput is true", () => {
      const schema = {
        type: "object",
        properties: { name: { type: "string" } },
      };
      const result = jsonSchemaSanitize(schema, {
        _options: { functionCallStrictInput: true },
      });

      expect(result?.json_schema?.strict).toBe(true);
    });

    it("handles complex schemas", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
          items: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["name"],
      };

      const result = jsonSchemaSanitize(schema, {});
      expect(result?.json_schema?.schema).toEqual(schema);
    });
  });

  describe("functionCallSanitize", () => {
    it("returns undefined for falsy input", () => {
      expect(functionCallSanitize(null, {}, {})).toBeUndefined();
      expect(functionCallSanitize(undefined, {}, {})).toBeUndefined();
    });

    it("handles 'none' correctly", () => {
      const output = {};
      const result = functionCallSanitize("none", {}, output);

      expect(result).toBe("none");
    });

    it("normalizes function call values correctly", () => {
      const output = {};

      expect(functionCallSanitize("auto", {}, output)).toBe("auto");
      expect(functionCallSanitize("any", {}, output)).toBe("required");
      // Objects are passed through as-is by normalizeFunctionCall
      expect(functionCallSanitize({ name: "test" }, {}, output)).toEqual({
        name: "test",
      });
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

    it("formats functions without strict mode", () => {
      const functions = [
        {
          name: "search",
          description: "Search the web",
          parameters: { type: "object", properties: {} },
        },
      ];

      const result = functionsSanitize(functions, {}, {});

      expect(result).toEqual([
        {
          type: "function",
          function: {
            name: "search",
            description: "Search the web",
            parameters: { type: "object", properties: {} },
            strict: false,
          },
        },
      ]);
    });

    it("applies strict mode when functionCallStrictInput is true", () => {
      const functions = [
        {
          name: "test",
          description: "test function",
          parameters: { type: "object", properties: {} },
        },
      ];

      const result = functionsSanitize(
        functions,
        { _options: { functionCallStrictInput: true } },
        {}
      );

      expect(result?.[0]?.function?.strict).toBe(true);
    });

    it("handles multiple functions", () => {
      const functions = [
        { name: "func1", description: "First", parameters: {} },
        { name: "func2", description: "Second", parameters: {} },
      ];

      const result = functionsSanitize(functions, {}, {});

      expect(result).toHaveLength(2);
      expect(result?.[0]?.function?.name).toBe("func1");
      expect(result?.[1]?.function?.name).toBe("func2");
    });

    it("cleans json schemas in parameters", () => {
      const functions = [
        {
          name: "test",
          description: "test",
          parameters: {
            $schema: "http://json-schema.org/draft-07/schema#",
            type: "object",
            properties: {},
          },
        },
      ];

      const result = functionsSanitize(functions, {}, {});

      // cleanJsonSchemaFor keeps $schema for OpenAI (based on actual behavior)
      expect(result?.[0]?.function?.parameters?.$schema).toBe(
        "http://json-schema.org/draft-07/schema#"
      );
    });
  });
});
