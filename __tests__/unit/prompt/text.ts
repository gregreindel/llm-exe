
import { PromptHelper, PromptPartial } from "@/interfaces";
import { BasePrompt, TextPrompt } from "@/prompt";
import * as utils from "@/utils";



jest.spyOn(utils, "replaceTemplateString");

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:prompt/TextPrompt", () => {
  it('creates class with expected properties', () => {
    const prompt = new TextPrompt()
    expect(prompt).toBeInstanceOf(BasePrompt)
    expect(prompt).toBeInstanceOf(TextPrompt)
    expect(prompt).toHaveProperty("type")
    expect(prompt.type).toEqual("text")

    expect(prompt).toHaveProperty("messages")
    expect(prompt.messages).toEqual([])

    expect(prompt).toHaveProperty("partials")
    expect(prompt.partials).toEqual([])

    expect(prompt).toHaveProperty("helpers")
    expect(prompt.helpers).toEqual([])

    expect(prompt).toHaveProperty("type")
    expect(prompt).toHaveProperty("addToPrompt")
    expect(prompt).toHaveProperty("addSystemMessage")
    expect(prompt).toHaveProperty("format")
    expect(prompt).toHaveProperty("registerPartial")
    expect(prompt).toHaveProperty("registerHelpers")
    expect(prompt).toHaveProperty("validate")
  })
  it('parses object to string', () => {
    const prompt = new TextPrompt("Hello")
    const format = prompt.format({})
    expect(format).toEqual("Hello")
  })
  it('parses object to string', () => {
    const prompt = new TextPrompt("Hello")
    prompt.addToPrompt("World")
    const format = prompt.format({})
    expect(format).toEqual("Hello\n\nWorld")
  })
  it('can use custom separator', () => {
    const prompt = new TextPrompt("Hello")
    prompt.addToPrompt("World")

    const format = prompt.format({}, "\n--\n")
    expect(format).toEqual("Hello\n--\nWorld")
  })
  it('can use methods chainable', () => {
    const prompt = new TextPrompt("Hello").addToPrompt("World").addSystemMessage("Hello World")
    const format = prompt.format({})
    expect(format).toEqual("Hello\n\nWorld\n\nHello World")
  })
  it('parses object to string', () => {
    const prompt = new TextPrompt("Hello")
    prompt.addSystemMessage("World")
    const format = prompt.format({})
    expect(format).toEqual("Hello\n\nWorld")
  })
  it('parses object to string', () => {
    const prompt = new TextPrompt("Hello {{replaceWithWorld}}")
    const format = prompt.format({replaceWithWorld: "World"})
    expect(format).toEqual("Hello World")
  })

  test("constructor", () => {
    const textPrompt = new TextPrompt("Initial message");
    expect(textPrompt.type).toBe("text");
    expect(textPrompt.messages).toHaveLength(1);
    expect(textPrompt.messages[0].content).toBe("Initial message");
  });

  test("addToPrompt", () => {
    const textPrompt = new TextPrompt();
    textPrompt.addToPrompt("System message");
    expect(textPrompt.messages).toHaveLength(1);
    expect(textPrompt.messages[0].content).toBe("System message");
  });

  test("addSystemMessage", () => {
    const textPrompt = new TextPrompt();
    textPrompt.addSystemMessage("System message");
    expect(textPrompt.messages).toHaveLength(1);
    expect(textPrompt.messages[0].content).toBe("System message");
  });

  test("format", () => {
    const values = { key: "value" };
    const textPrompt = new TextPrompt();
    textPrompt.addToPrompt("System message");
    textPrompt.format(values);

    expect(utils.replaceTemplateString).toHaveBeenCalledWith(
      "System message",
      textPrompt.getReplacements(values),
      {
        partials: [],
        helpers: [],
      }
    );
  });

  test("format custom separator", () => {
    const textPrompt = new TextPrompt();
    textPrompt.addToPrompt("System message").addToPrompt("System message 2")
    expect(textPrompt.format({}, "\n---\n")).toEqual("System message\n---\nSystem message 2")
  });

  test("registerPartial", () => {
    const partial: PromptPartial = { name: "partial", template: "template" };
    const textPrompt = new TextPrompt();
    textPrompt.registerPartial(partial);
    expect(textPrompt.partials).toHaveLength(1);
    expect(textPrompt.partials[0]).toEqual(partial);
  });

  test("registerHelpers", () => {
    const helper: PromptHelper = {
      name: "helper",
      handler: (_args: any) => "any",
    };
    const textPrompt = new TextPrompt();
    textPrompt.registerHelpers(helper);
    expect(textPrompt.helpers).toHaveLength(1);
    expect(textPrompt.helpers[0]).toEqual(helper);
  });

  test("validate", () => {
    const textPrompt = new TextPrompt();
    expect(textPrompt.validate()).toBe(true);
  });
});