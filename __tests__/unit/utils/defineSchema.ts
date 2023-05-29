import { defineSchema } from "@/utils";

describe("defineSchema", () => {
  it("should handle null", () => {
    const schema = defineSchema({
      type: "object",
      properties: {
        name: { type: "string", default: "none" },
        age: { type: "integer", default: 0 },
      },
      required: ["age", "name"],
      additionalProperties: false,
    });

    expect(schema.additionalProperties).toEqual(false);
  });
});
