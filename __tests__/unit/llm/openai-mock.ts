import { OpenAIMock } from "@/llm/openai.mock";

describe("llm-exe:llm/OpenAIMock", () => {
  it("defaults to mock-model", () => {
    const llm = new OpenAIMock();
    expect((llm as any).model).toEqual("mock-model");
  });
  it("defaults to mock-model", () => {
    const llm = new OpenAIMock({ modelName: "gpt-3.5-turbo" });
    expect((llm as any).model).toEqual("mock-gpt-3.5-turbo");
  });
});
