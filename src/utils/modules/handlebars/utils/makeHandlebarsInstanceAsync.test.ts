import Handlebars from "handlebars";
import { makeHandlebarsInstanceAsync } from "./makeHandlebarsInstanceAsync";

describe("makeHandlebarsInstanceAsync", () => {
  let instance: ReturnType<typeof makeHandlebarsInstanceAsync>;

  beforeEach(() => {
    instance = makeHandlebarsInstanceAsync(Handlebars);
  });

  it("should create a Handlebars instance", () => {
    expect(instance).toBeDefined();
    expect(instance.compile).toBeDefined();
  });

  it("should register async override helpers (if, with, each, unless)", () => {
    expect(instance.helpers.if).toBeDefined();
    expect(instance.helpers.with).toBeDefined();
    expect(instance.helpers.each).toBeDefined();
    expect(instance.helpers.unless).toBeDefined();
  });

  it("should register standard helpers", () => {
    expect(instance.helpers.cut).toBeDefined();
    expect(instance.helpers.eq).toBeDefined();
    expect(instance.helpers.neq).toBeDefined();
    expect(instance.helpers.join).toBeDefined();
  });

  it("compile should return a function that returns a promise", async () => {
    const template = instance.compile("Hello {{name}}!");
    const result = await template({ name: "World" });
    expect(result).toBe("Hello World!");
  });

  it("should handle templates with no variables", async () => {
    const template = instance.compile("Static text");
    const result = await template({});
    expect(result).toBe("Static text");
  });

  it("should handle empty context", async () => {
    const template = instance.compile("Hello {{name}}!");
    const result = await template(undefined);
    expect(result).toBe("Hello !");
  });

  it("should handle async helpers in templates", async () => {
    const template = instance.compile("{{#if show}}visible{{/if}}");
    const result = await template({ show: true });
    expect(result).toBe("visible");
  });

  it("should handle async each helper", async () => {
    const template = instance.compile("{{#each items}}{{this}} {{/each}}");
    const result = await template({ items: ["a", "b", "c"] });
    expect(result).toBe("a b c ");
  });

  it("should handle nested templates", async () => {
    const template = instance.compile(
      "{{#each items}}{{#if this}}yes{{else}}no{{/if}} {{/each}}"
    );
    const result = await template({ items: [true, false, true] });
    expect(result).toBe("yes no yes ");
  });

  it("should escape HTML by default", async () => {
    const template = instance.compile("{{content}}");
    const result = await template({ content: "<script>alert('xss')</script>" });
    expect(result).toBe("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;");
  });

  it("should allow unescaped output with triple braces", async () => {
    const template = instance.compile("{{{content}}}");
    const result = await template({ content: "<b>bold</b>" });
    expect(result).toBe("<b>bold</b>");
  });

  it("should handle the with helper", async () => {
    const template = instance.compile("{{#with person}}{{name}}{{/with}}");
    const result = await template({ person: { name: "Alice" } });
    expect(result).toBe("Alice");
  });

  it("should handle the unless helper", async () => {
    const template = instance.compile("{{#unless hidden}}shown{{/unless}}");
    const result = await template({ hidden: false });
    expect(result).toBe("shown");
  });
});
