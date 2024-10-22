import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";

describe("replaceTemplateStringSimple", () => {
  it("should replace template string with context values", () => {
    const template = "Hello, {{ name }}!";
    const context = { name: "Alice" };
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("Hello, Alice!");
  });

  it("should handle nested properties in context", () => {
    const template = "User: {{ user.name }}, Age: {{ user.age }}";
    const context = { user: { name: "Bob", age: 30 } };
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("User: Bob, Age: 30");
  });

  it("should return empty string if property is not found in context", () => {
    const template = "Hello, {{ unknown }}!";
    const context = { name: "Alice" };
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("Hello, !");
  });

  it("should handle missing nested properties by returning empty string", () => {
    const template = "User: {{ user.name }}, Address: {{ user.address.street }}";
    const context = { user: { name: "Bob" } };
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("User: Bob, Address: ");
  });

  it("should handle non-string context properties", () => {
    const template = "Count: {{ count }}";
    const context = { count: 42 };
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("Count: 42");
  });

  it("should preserve spaces within template brackets", () => {
    const template = "Hello, {{   name    }}!";
    const context = { name: "Alice" };
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("Hello, Alice!");
  });

  it("should work with no placeholders", () => {
    const template = "Hello, World!";
    const context = {};
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("Hello, World!");
  });

  it("should handle multiple placeholders", () => {
    const template = "Name: {{ name }}, Age: {{ age }}";
    const context = { name: "Charlie", age: 25 };
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("Name: Charlie, Age: 25");
  });

  it("should handle context values of different types", () => {
    const template = "String: {{ str }}, Number: {{ num }}, Boolean: {{ bool }}";
    const context = { str: "test", num: 123, bool: true };
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("String: test, Number: 123, Boolean: true");
  });

  it("should not fail when context is an empty object", () => {
    const template = "Hello, {{ name }}!";
    const context = {};
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("Hello, !");
  });

  it("should return empty string when template contains invalid key", () => {
    const template = "Hello, {{ invalid.key }}!";
    const context = { name: "Alice" };
    const result = replaceTemplateStringSimple(template, context);
    expect(result).toBe("Hello, !");
  });
});