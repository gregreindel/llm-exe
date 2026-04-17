import {
  extractTemplateVariables,
  findMissingVariables,
} from "@/utils/modules/extractTemplateVariables";

describe("extractTemplateVariables", () => {
  it("extracts simple variable references", () => {
    expect(extractTemplateVariables("Hello {{name}}")).toEqual(["name"]);
  });

  it("extracts multiple variables", () => {
    const result = extractTemplateVariables("{{name}} is {{age}} years old");
    expect(result).toEqual(["name", "age"]);
  });

  it("extracts root key from dotted paths", () => {
    expect(extractTemplateVariables("{{user.name}}")).toEqual(["user"]);
  });

  it("deduplicates variables", () => {
    const result = extractTemplateVariables("{{name}} and {{name}}");
    expect(result).toEqual(["name"]);
  });

  it("extracts from triple-stache (unescaped)", () => {
    expect(extractTemplateVariables("{{{html}}}")).toEqual(["html"]);
  });

  it("skips closing blocks", () => {
    expect(extractTemplateVariables("{{/if}}")).toEqual([]);
  });

  it("skips partials", () => {
    expect(extractTemplateVariables("{{> myPartial}}")).toEqual([]);
  });

  it("skips comments", () => {
    expect(extractTemplateVariables("{{! this is a comment}}")).toEqual([]);
    expect(extractTemplateVariables("{{!-- block comment --}}")).toEqual([]);
  });

  it("skips else", () => {
    expect(extractTemplateVariables("{{else}}")).toEqual([]);
  });

  it("skips helper calls with arguments", () => {
    expect(
      extractTemplateVariables('{{getOr name "default"}}')
    ).toEqual([]);
  });

  it("extracts block helper arguments", () => {
    expect(extractTemplateVariables("{{#if premium}}yes{{/if}}")).toEqual([
      "premium",
    ]);
  });

  it("extracts each block variable", () => {
    expect(
      extractTemplateVariables("{{#each items}}{{this}}{{/each}}")
    ).toEqual(["items"]);
  });

  it("skips 'this' references", () => {
    expect(extractTemplateVariables("{{this}}")).toEqual([]);
    expect(extractTemplateVariables("{{this.name}}")).toEqual([]);
  });

  it("returns empty for templates with no variables", () => {
    expect(extractTemplateVariables("Hello world")).toEqual([]);
  });

  it("returns empty for empty string", () => {
    expect(extractTemplateVariables("")).toEqual([]);
  });

  it("skips block helper named args", () => {
    const result = extractTemplateVariables(
      "{{#each items as |item|}}{{/each}}"
    );
    expect(result).toEqual(["items"]);
  });
});

describe("findMissingVariables", () => {
  it("returns missing variables", () => {
    const result = findMissingVariables("Hello {{name}}, age {{age}}", {
      name: "Greg",
    });
    expect(result).toEqual(["age"]);
  });

  it("returns empty when all variables provided", () => {
    const result = findMissingVariables("Hello {{name}}", { name: "Greg" });
    expect(result).toEqual([]);
  });

  it("returns empty when no variables in template", () => {
    const result = findMissingVariables("Hello world", {});
    expect(result).toEqual([]);
  });

  it("excludes registered helper names", () => {
    const result = findMissingVariables("{{myHelper}}", {}, ["myHelper"]);
    expect(result).toEqual([]);
  });

  it("considers falsy values as provided", () => {
    const result = findMissingVariables(
      "{{a}} {{b}} {{c}} {{d}}",
      { a: 0, b: false, c: "", d: null }
    );
    expect(result).toEqual([]);
  });
});
