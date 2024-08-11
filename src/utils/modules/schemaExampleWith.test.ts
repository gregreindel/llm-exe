import { schemaExampleWith } from "@/utils/modules/schemaExampleWith";

var schema = {
  title: "Example Schema",
  type: "object",
  properties: {
    firstName: {
      type: "string",
      description: "first name",
    },
    lastName: {
      type: "string",
      description: "last name",
    },
    age: {
      description: "Age in years",
      type: "integer",
      minimum: 0,
    },
    isLive: {
      description: "Live or dead",
      type: "boolean",
    },
    general: {
      type: "object",
      required: false,
      description: "general something",
    },
    generalWithProperties: {
      type: ["object", "null"],
      required: false,
      properties: {
        randomField: {
          type: "string",
        },
      },
      description: "general something with properties",
    },
    contacts: {
      type: "array",
      id: "http://jsonschema.net/contacts",
      required: false,
      description: "list of contacts",
      items: {
        type: "object",
        id: "http://jsonschema.net/contacts/0",
        required: false,
        properties: {
          phone: {
            type: "string",
            required: false,
          },
        },
      },
    },
    hobbies: {
      type: "array",
      required: false,
      description: "list of hobbies",
      items: {
        type: "string",
      },
    },
    boolField: {
      type: ["boolean", "null"],
      description: "list of hobbies",
    },
    nullableObjectField: {
      type: ["object", "null"],
      description: "nullable object field",

      properties: {
        validField: {
          type: "string",
        },
      },
    },
    nullableArrayField: {
      type: ["array", "null"],
      description: "nullable array field",

      items: {
        type: "object",
        properties: {
          validField: {
            type: "string",
          },
        },
      },
    },
  },
  required: ["firstName", "lastName"],
};

describe("schemaExampleWith", () => {
  test("", () => {
    const result = schemaExampleWith(schema, "description");
    expect(result).toEqual({
      firstName: "first name",
      lastName: "last name",
      age: "Age in years",
      isLive: "Live or dead",
      general: "general something",
      generalWithProperties: "general something with properties",
      contacts: "list of contacts",
      hobbies: "list of hobbies",
      boolField: "list of hobbies",
      nullableObjectField: "nullable object field",
      nullableArrayField: "nullable array field",
    });
  });
  test("array", () => {
    const result = schemaExampleWith(
      {
        type: "array",
        items: {
          type: "object",
          properties: {
            phone: {
              type: "string",
              required: false,
              description: "phone number",
            },
          },
        },
      },
      "description"
    );
    expect(result[0]).toEqual({ phone: "phone number" });
  });
});
