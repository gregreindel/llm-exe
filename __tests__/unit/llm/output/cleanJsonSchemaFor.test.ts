import { cleanJsonSchemaFor } from "@/llm/output/_utils/cleanJsonSchemaFor";
// import { LlmProvider } from "@/types";

// type JSONSchema = {
//     // Add more types here as needed
//     [key: string]: any;
//   };

  describe("cleanJsonSchemaFor", () => {

    const openAiChatSchema = {
      type: "object",
      properties: {
        name: { type: "string", default: "none" },
        age: { type: "integer", default: 0 },
      },
      required: ["age", "name"],
      additionalProperties: false,
      default: {
        age: 25,
      }
    };
  
    const anotherProviderSchema = {
      type: "object",
      properties: {
        name: { type: "string", default: "none" },
        age: { type: "integer", default: 0 },
      },
      required: ["age", "name"],
      additionalProperties: false,
    };
  
    // const arraySchema = [{ type: "string", default: "value1" }, { type: "integer", default: 0 }];
  
    it("should remove fields listed in providerFieldExclusions for openai.chat", () => {
      const result = cleanJsonSchemaFor(openAiChatSchema, "openai.chat");
      
      expect(result).toEqual({
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "integer" },
        },
        required: ["age", "name"],
        additionalProperties: false,
      });
    });
  
    it("should not remove fields for providers not listed in providerFieldExclusions", () => {
      const result = cleanJsonSchemaFor(anotherProviderSchema, "another.provider"as any);
      
      expect(result).toEqual(anotherProviderSchema);
    });
  
    it("should handle array types correctly and remove disallowed fields from objects inside arrays", () => {
      const schema = {
        type: "array",
        items: [
          { type: "string", default: "none" },
          { type: "integer", default: 0  }
        ] 
      };
      const result = cleanJsonSchemaFor(schema, "openai.chat");
  
      expect(result).toEqual({
        type: "array",
        items: [
          { type: "string" },
          { type: "integer" }
        ]
      });
    });
  
    it("should handle nested objects and remove disallowed fields recursively", () => {
      const schema = {
        type: "object",
        properties: {
          nested: {
            type: "object",
            properties: {
              inner: { type: "string", default: "innerDefault" }
            },
            default: { inner: "innerValue" }
          },
          name: { type: "string", default: "none" }
        },
        default: { name: "defaultName" }
      };
      
      const result = cleanJsonSchemaFor(schema, "openai.chat");
  
      expect(result).toEqual({
        type: "object",
        properties: {
          nested: {
            type: "object",
            properties: {
              inner: { type: "string" }
            }
          },
          name: { type: "string" }
        }
      });
    });
  
    it("should return the input schema unchanged if no exclusions match", () => {
      const schema = {
        type: "object",
        properties: {
          name: { type: "string", default: "none" },
          age: { type: "integer", default: 0 },
        },
        required: ["age", "name"],
        additionalProperties: false,
      };
  
      const result = cleanJsonSchemaFor(schema, "some.unknown.provider"as any);
  
      expect(result).toEqual(schema);
    });
  
  });