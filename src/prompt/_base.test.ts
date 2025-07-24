import { BasePrompt } from "@/prompt";
import { PromptHelper, PromptOptions, PromptPartial } from "@/types";

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:prompt/TextPrompt", () => {
  class MockPrompt<I extends Record<string, any>> extends BasePrompt<I> {
    constructor(initialPromptMessage?: string, options?: PromptOptions) {
      super(initialPromptMessage, options);
    }
  }

  it("creates class with expected properties", () => {
    const prompt = new MockPrompt();

    expect(prompt).toBeInstanceOf(BasePrompt);
    expect(prompt).toHaveProperty("type");
    expect(prompt.type).toEqual("text");

    expect(prompt).toHaveProperty("messages");
    expect(prompt.messages).toEqual([]);

    expect(prompt).toHaveProperty("partials");
    expect(prompt.partials).toEqual([]);

    expect(prompt).toHaveProperty("helpers");
    expect(prompt.helpers).toEqual([]);

    expect(prompt).toHaveProperty("type");
    expect(prompt).toHaveProperty("addToPrompt");
    expect(prompt).toHaveProperty("addSystemMessage");
    expect(prompt).toHaveProperty("format");
    expect(prompt).toHaveProperty("formatAsync");

    expect(prompt).toHaveProperty("registerPartial");
    expect(prompt).toHaveProperty("registerHelpers");
    expect(prompt).toHaveProperty("validate");
  });
  test("PromptHelper", () => {
    const helpers: PromptHelper[] = [
      {
        name: "helper",
        handler: (_args: any) => "any",
      },
    ];
    const textPrompt = new MockPrompt("", { helpers });
    expect(textPrompt.helpers[0]).toEqual(helpers[0]);
  });
  test("preFilters and postFilters", () => {
    const preFilter = (prompt: string, values: any) =>
      prompt.replace("hello", "greetings");
    const postFilter = (prompt: string, values: any) => prompt + "!";

    const prompt = new MockPrompt("hello {{name}}", {
      preFilters: [preFilter],
      postFilters: [postFilter],
    });

    expect(prompt.filters.pre).toHaveLength(1);
    expect(prompt.filters.post).toHaveLength(1);

    const result = prompt.format({ name: "world" });
    // Pre-filter changes "hello" to "greetings", template replaces {{name}} with "world",
    // then post-filter adds !
    expect(result).toBe("greetings world!");
  });

  test("multiple filters", () => {
    const preFilter1 = (prompt: string) => prompt.replace("hello", "hi");
    const preFilter2 = (prompt: string) => prompt.replace("world", "universe");
    const postFilter1 = (prompt: string) => prompt + "!";
    const postFilter2 = (prompt: string) => prompt + "!";

    const prompt = new MockPrompt("hello {{target}}", {
      preFilters: [preFilter1, preFilter2],
      postFilters: [postFilter1, postFilter2],
    });

    const result = prompt.format({ target: "world" });
    expect(result).toBe("hi world!!");
  });

  test("custom replaceTemplateString", () => {
    const customReplace = (template: string, values: any) => {
      // Simple custom replacer that uses square brackets instead of curly braces
      return template.replace(
        /\[\[(\w+)\]\]/g,
        (match, key) => values[key] || match
      );
    };

    const prompt = new MockPrompt("hello [[name]]", {
      replaceTemplateString: customReplace,
    });

    const result = prompt.format({ name: "custom" });
    expect(result).toBe("hello custom");
  });

  test("PromptPartial array", () => {
    const partials: PromptPartial[] = [
      {
        name: "helper",
        template: "helper",
      },
    ];
    const textPrompt = new MockPrompt("", { partials });
    expect(textPrompt.partials[0]).toEqual(partials[0]);
  });

  test("registerPartial with single partial", () => {
    const prompt = new MockPrompt();
    const partial: PromptPartial = {
      name: "single",
      template: "single template",
    };

    prompt.registerPartial(partial);
    expect(prompt.partials).toHaveLength(1);
    expect(prompt.partials[0]).toEqual(partial);
  });

  test("registerHelpers with single helper", () => {
    const prompt = new MockPrompt();
    const helper: PromptHelper = {
      name: "single",
      handler: () => "result",
    };

    prompt.registerHelpers(helper);
    expect(prompt.helpers).toHaveLength(1);
    expect(prompt.helpers[0]).toEqual(helper);
  });

  test("addToPrompt with default role", () => {
    const prompt = new MockPrompt();
    prompt.addToPrompt("default role message");

    expect(prompt.messages).toHaveLength(1);
    expect(prompt.messages[0].role).toBe("system");
  });

  test("gets formatAsync", async () => {
    async function getSomethingAsync() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve("this is from another world");
        }, 200);
      });
    }

    const textPrompt = new MockPrompt("Hello {{getSomethingAsync}}", {});
    const formatted = await textPrompt.formatAsync({ getSomethingAsync });
    expect(formatted).toEqual("Hello this is from another world");
  });

  test("gets formatAsync", async () => {
    async function getObjectAsync() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            value: "this is from another world",
          });
        }, 200);
      });
    }

    const textPrompt = new MockPrompt("Hello {{getObjectAsync.value}}", {});
    const formatted = await textPrompt.formatAsync({
      cond: true,
      getObjectAsync,
    });
    expect(formatted).toEqual("Hello this is from another world");
  });

  test("gets formatAsync from Promise", async () => {
    const textPrompt = new MockPrompt("Hello {{getObjectAsync.value}}", {});
    const formatted = await textPrompt.formatAsync({
      cond: true,
      getObjectAsync: new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            value: "this is from another world",
          });
        }, 200);
      }),
    });
    expect(formatted).toEqual("Hello this is from another world");
  });

  test("gets formatAsync", async () => {
    async function getObjectAsync() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            value: "this is from another world",
          });
        }, 200);
      });
    }

    const textPrompt = new MockPrompt(undefined, {});

    textPrompt.messages = [{ invalid: "message" }] as any;
    const formatted = await textPrompt.formatAsync({
      cond: true,
      getObjectAsync,
    });
    expect(formatted).toEqual("");
  });

  test("validate method returns true", () => {
    const prompt = new MockPrompt("test");
    expect(prompt.validate()).toBe(true);
  });

  test("format handles messages without content", () => {
    const prompt = new MockPrompt();
    // Add a message without content
    prompt.messages.push({
      role: "user",
      // @ts-expect-error Testing invalid content type
      content: null,
      name: undefined,
      tool_call_id: undefined,
      function_call: undefined,
    });

    const result = prompt.format({});
    expect(result).toBe("");
  });

  test("format handles messages with non-array content", () => {
    const prompt = new MockPrompt();
    // Add a message with non-array content
    prompt.messages.push({
      role: "user",

      // @ts-expect-error Testing invalid content type
      content: "string content",
      name: undefined,
      tool_call_id: undefined,
      function_call: undefined,
    });

    const result = prompt.format({});
    expect(result).toBe("");
  });

  test("format handles empty content array", () => {
    const prompt = new MockPrompt();
    prompt.messages.push({
      role: "user",
      content: [],
      name: undefined,
      tool_call_id: undefined,
      function_call: undefined,
    });

    const result = prompt.format({});
    expect(result).toBe("");
  });

  test("format handles content with no text parts", () => {
    const prompt = new MockPrompt();
    prompt.messages.push({
      role: "user",
      content: [
        // @ts-expect-error Testing non-text content type
        { type: "image", image_url: { url: "test.jpg" } },
      ],
      name: undefined,
      tool_call_id: undefined,
      function_call: undefined,
    });

    const result = prompt.format({});
    expect(result).toBe("");
  });

  test("formatAsync handles content with no text parts", async () => {
    const prompt = new MockPrompt();
    prompt.messages.push({
      role: "user",
      content: [
        // @ts-expect-error Testing non-text content type
        { type: "image", image_url: { url: "test.jpg" } },
      ],
      name: undefined,
      tool_call_id: undefined,
      function_call: undefined,
    });

    const result = await prompt.formatAsync({});
    expect(result).toBe("");
  });

  test("formatAsync handles messages with text content", async () => {
    const prompt = new MockPrompt();
    prompt.messages.push({
      role: "user",
      content: [{ type: "text", text: "Hello {{name}}" }],
      name: undefined,
      tool_call_id: undefined,
      function_call: undefined,
    });

    const result = await prompt.formatAsync({ name: "async" });
    expect(result).toBe("Hello async");
  });
});
