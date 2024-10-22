
import { BasePrompt } from "@/prompt";
import { PromptHelper, PromptOptions, PromptPartial } from "@/types";

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
    expect(prompt).toHaveProperty("formatAsync")

    
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
              value: "this is from another world"
          });
        }, 200);
      });
    }
  
    const textPrompt = new MockPrompt("Hello {{getObjectAsync.value}}", {});
    const formatted = await textPrompt.formatAsync({ cond: true, getObjectAsync,  });
    expect(formatted).toEqual("Hello this is from another world");
  });

  test("gets formatAsync from Promise", async () => {
    const textPrompt = new MockPrompt("Hello {{getObjectAsync.value}}", {});
    const formatted = await textPrompt.formatAsync({ cond: true, getObjectAsync: new Promise((resolve) => {
        setTimeout(() => {
          resolve({
              value: "this is from another world"
          });
        }, 200);
      })});
    expect(formatted).toEqual("Hello this is from another world");
  });



  test("gets formatAsync", async () => {
    async function getObjectAsync() {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
              value: "this is from another world"
          });
        }, 200);
      });
    }
  
    const textPrompt = new MockPrompt(undefined, {});

    textPrompt.messages = [{invalid: "message"}]as any
    const formatted = await textPrompt.formatAsync({ cond: true, getObjectAsync });
    expect(formatted).toEqual("");
  });


})