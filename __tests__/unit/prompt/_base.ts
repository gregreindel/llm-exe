
import { BasePrompt } from "@/prompt";
import { PromptHelper, PromptOptions, PromptPartial } from "@/types";
import * as utils from "@/utils";

// Spy on the replaceTemplateString function
jest.spyOn(utils, "replaceTemplateString");

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:prompt/TextPrompt", () => {
    class MockPrompt<I extends Record<string, any>>  extends BasePrompt<I> {
        constructor(initialPromptMessage?: string, options?: PromptOptions){
            super(initialPromptMessage, options)
        }
    }

  it('creates class with expected properties', () => {
    const prompt = new MockPrompt()

    expect(prompt).toBeInstanceOf(BasePrompt)
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
  });
  test("PromptHelper", () => {
    const helpers: PromptHelper[] = [{
      name: "helper",
      handler: (_args: any) => "any",
    }];
    const textPrompt = new MockPrompt("", { helpers });
    expect(textPrompt.helpers[0]).toEqual(helpers[0]);
  });
  test("PromptPartial", () => {
    const partials: PromptPartial[] = [{
      name: "helper",
      template: "helper"
    }];
    const textPrompt = new MockPrompt("", { partials });
    expect(textPrompt.partials[0]).toEqual(partials[0]);
  });
})