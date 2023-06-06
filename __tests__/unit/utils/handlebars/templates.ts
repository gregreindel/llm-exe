import { replaceTemplateString } from "@/utils";

describe("handlebars templates", () => {
  test("MarkdownCode", () => {
    const value1 = replaceTemplateString(`{{>MarkdownCode}}`, {
      code: "const thing = true;",
      language: "typescript",
    });
    expect(value1).toEqual("```typescript\nconst thing = true;\n```");
  });
  test("SingleChatMessage", () => {
    const value12 = replaceTemplateString(
      `{{>SingleChatMessage role='user' content='yoo' name=''}}`
    );
    expect(value12).toEqual("User: yoo");
  });
  test("SingleChatMessage", () => {
    const value3 = replaceTemplateString(
      `{{>SingleChatMessage role='user' content='yoo' name='Greg'}}`
    );
    expect(value3).toEqual("Greg: yoo");
  });
  test("SingleChatMessage", () => {
    const value4 = replaceTemplateString(
      `{{>SingleChatMessage role='assistant' content='yoo'}}`
    );
    expect(value4).toEqual("Assistant: yoo");
  });
  test("JsonSchema template works if matching key", () => {
    const schema = {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "what city does the user want to book a hotel in",
          default: "unknown",
        },
        startDate: {
          type: "string",
          description: "the date the user would like to start their stay",
          default: "unknown",
        },
        endDate: {
          type: "string",
          description: "the date the user would like to end their stay",
          default: "unknown",
        },
      },
      required: ["city", "startDate", "endDate"],
      additionalProperties: false,
    };
    const value4 = replaceTemplateString(`{{>JsonSchema key='schema'}}`, {
      schema,
    });
    const expected = `{
  "type": "object",
  "properties": {
    "city": {
      "type": "string",
      "description": "what city does the user want to book a hotel in",
      "default": "unknown"
    },
    "startDate": {
      "type": "string",
      "description": "the date the user would like to start their stay",
      "default": "unknown"
    },
    "endDate": {
      "type": "string",
      "description": "the date the user would like to end their stay",
      "default": "unknown"
    }
  },
  "required": [
    "city",
    "startDate",
    "endDate"
  ],
  "additionalProperties": false
}`;
    expect(value4).toEqual(expected);
  });

  test("JsonSchema template is empty string if no matching key", () => {
    const value = replaceTemplateString(`{{>JsonSchema key='schema'}}`, {});
    const expected = ``;
    expect(value).toEqual(expected);
  });

  test("JsonSchema template is empty string if no matching key", () => {
    const schema = {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "what city does the user want to book a hotel in",
          default: "",
        },
        startDate: {
          type: "string",
          description: "the date the user would like to start their stay",
          default: "",
        },
        endDate: {
          type: "string",
          description: "the date the user would like to end their stay",
          default: "",
        },
      },
      required: ["city", "startDate", "endDate"],
      additionalProperties: false,
    };
    const value44 = replaceTemplateString(
      `{{>JsonSchemaExampleJson key='schema'}}`,
      {
        schema,
      }
    );

    const expected = JSON.stringify({
      "city": "",
      "startDate": "",
      "endDate": ""
    }, null, 2)
    expect(value44).toEqual(expected.trim());
  });

  test("JsonSchemaExampleJson template is empty string if no matching key", () => {
    const schema = {
      type: "object",
      properties: {
        city: {
          type: "string",
          description: "what city does the user want to book a hotel in",
          default: "unknown",
        },
        startDate: {
          type: "string",
          description: "the date the user would like to start their stay",
          default: "unknown",
        },
        endDate: {
          type: "string",
          description: "the date the user would like to end their stay",
          default: "unknown",
        },
      },
      required: ["city", "startDate", "endDate"],
      additionalProperties: false,
    };
    const value4 = replaceTemplateString(
      `{{>JsonSchemaExampleJson key='schema' property='description'}}`,
      {
        schema,
      }
    );
    const expected = `{
  "city": "what city does the user want to book a hotel in",
  "startDate": "the date the user would like to start their stay",
  "endDate": "the date the user would like to end their stay"
}`;

    expect(value4).toEqual(expected);
  });


  test("JsonSchemaExampleJson template is empty string if no matching key", () => {

    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          statement: { type: "string", default: "unknown", description: "statement description" },
          answer: { type: "string", default: "unknown", description: "answer description" },
          explanation: { type: "string", default: "unknown", description: "explanation description" },
          confidence: { type: "integer", default: 0, description: "confidence description" },
        },
        required: ["statement", "answer", "confidence", "explanation"],
        additionalProperties: false,
      },
    };

    const value4 = replaceTemplateString(
      `{{>JsonSchemaExampleJson key='schema' property='description'}}`,
      {
        schema,
      }
    );
    const expected = JSON.stringify([{
      "statement": "statement description",
      "answer": "answer description",
      "explanation": "explanation description",
      "confidence": "confidence description"
    }], null, 2);

    expect(value4).toEqual(expected);
  });

  test("JsonSchema template works if matching key", () => {
    const schema = {
      type: "array",
      items: {
        type: "object",
        properties: {
          statement: { type: "string", default: "unknown" },
          answer: { type: "string", default: "unknown" },
          explanation: { type: "string", default: "unknown" },
          confidence: { type: "integer", default: 0 },
        },
        required: ["statement", "answer", "confidence", "explanation"],
        additionalProperties: false,
      },
    };
    const value4 = replaceTemplateString(`{{>JsonSchema key='schema'}}`, {
      schema,
    });

    const expected = `{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "statement": {
        "type": "string",
        "default": "unknown"
      },
      "answer": {
        "type": "string",
        "default": "unknown"
      },
      "explanation": {
        "type": "string",
        "default": "unknown"
      },
      "confidence": {
        "type": "integer",
        "default": 0
      }
    },
    "required": [
      "statement",
      "answer",
      "confidence",
      "explanation"
    ],
    "additionalProperties": false
  }
}`;
    expect(value4).toEqual(expected);
  });

});
