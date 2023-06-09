import { BaseLlm, OpenAI, createLlmOpenAi } from "@/llm";
import { OutputOpenAIChat } from "@/llm/output";
import { OutputOpenAICompletion } from "@/llm/output/openai";
jest.createMockFromModule("../../__mocks__/openai.js");


describe("llm-exe:llm/OpenAI", () => {

const OLD_ENV = process.env;

beforeEach(() => {
  jest.resetModules() // Most important - it clears the cache
  process.env = { ...OLD_ENV }; // Make a copy
});

afterAll(() => {
  process.env = OLD_ENV; // Restore old environment
});

  
it("defaults env variable OPEN_AI_API_KEY", () => {
  process.env.OPEN_AI_API_KEY = "test-12345"
  const llm = new OpenAI({modelName: "gpt-3.5-turbo"});
  console.log((llm as any).client)
  expect(process.env.OPEN_AI_API_KEY).toEqual("test-12345");
});

});

describe("llm-exe:llm/OpenAI", () => {


  it("defaults to gpt-3.5-turbo", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "" as any });
    expect((llm as any).model).toEqual("gpt-3.5-turbo");
  });

  it("defaults to string parser", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-3.5-turbo" });
    expect(llm).toBeInstanceOf(BaseLlm);
  });

  it("defaults to string parser", () => {
    const llm = new OpenAI({
      openAIApiKey: "",
      modelName: "gpt-3.5-turbo",
      user: "test-123",
      n: 4,
    });
    expect(llm).toBeInstanceOf(BaseLlm);
    expect((llm as any).n).toEqual(4);
    expect((llm as any).user).toEqual("test-123");
  });

  it("defaults to string parser", () => {
    const llm = createLlmOpenAi({
      openAIApiKey: "",
      modelName: "gpt-3.5-turbo",
    });
    expect(llm).toBeInstanceOf(OpenAI);
  });

  it("calculates correct price for gpt-3.5-turbo", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-3.5-turbo" });
    const prompt = 1000;
    const reply = 500;
    expect(llm.calculatePrice(prompt, reply)).toEqual({
      input_cost: 0.0015,
      output_cost: 0.001,
      total_cost: 0.0025,
    });
  });
  it("calculates correct price for gpt-4", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-4" });
    const prompt = 1000;
    const reply = 500;
    expect(llm.calculatePrice(prompt, reply)).toEqual({
      input_cost: 0.03,
      output_cost: 0.03,
      total_cost: 0.06,
    });
  });
  it("calculates correct price for davinci", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "davinci" });
    const prompt = 1000;
    const reply = 500;
    expect(llm.calculatePrice(prompt, reply)).toEqual({
      input_cost: 0.02,
      output_cost: 0.01,
      total_cost: 0.03,
    });
  });
  it("calculates correct price for text-curie-001", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "text-curie-001" });
    const prompt = 1000;
    const reply = 500;
    expect(llm.calculatePrice(prompt, reply)).toEqual({
      input_cost: 0.002,
      output_cost: 0.001,
      total_cost: 0.003,
    });
  });
  it("calculates correct price for text-babbage-001", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "text-babbage-001" });
    const prompt = 1000;
    const reply = 500;
    expect(llm.calculatePrice(prompt, reply)).toEqual({
      input_cost: 0.0005,
      output_cost: 0.00025,
      total_cost: 0.00075,
    });
  });
  it("calculates correct price for text-ada-001", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "text-ada-001" });
    const prompt = 1000;
    const reply = 500;
    expect(llm.calculatePrice(prompt, reply)).toEqual({
      input_cost: 0.0004,
      output_cost: 0.0002,
      total_cost: 0.0006000000000000001,
    });
  });
  it("calculates correct price for gpt-3.5-turbo, defaults to prompt metrics", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-3.5-turbo" });
    const prompt = 1000;
    expect(llm.calculatePrice(prompt)).toEqual({
      input_cost: 0.0015,
      output_cost: 0,
      total_cost: 0.0015,
    });
  });
  it("defaults to chat for gpt-3.5-turbo", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-3.5-turbo" });
    const metadata = llm.getMetadata();
    expect(metadata.promptType).toEqual("chat");
  });
  it("defaults to chat for gpt-4", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-4" });
    const metadata = llm.getMetadata();
    expect(metadata.promptType).toEqual("chat");
  });
  it("defaults to text for davinci", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "davinci" });
    const metadata = llm.getMetadata();
    expect(metadata.promptType).toEqual("text");
  });
  it("defaults to ", () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-3.5-turbo" });
    const metadata = llm.getMetadata();
    expect(metadata.model).toEqual("gpt-3.5-turbo");
  });
  it("defaults to ", async () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-3.5-turbo" });
    const response = await llm.chat([{ role: "user", content: "Hello??" }]);
    expect(response).toBeInstanceOf(OutputOpenAIChat);
  });
  it("defaults to ", async () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "davinci" });
    const response = await llm.completion("Hello??");
    expect(response).toBeInstanceOf(OutputOpenAICompletion);
  });
  it("getMetrics", async () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-3.5-turbo" });
    expect(llm.getMetrics()).toEqual({
      total_completionTokens: 0,
      total_promptTokens: 0,
      total_totalTokens: 0,
    });

    await llm.chat([
      { role: "user", content: "__mock__:openAiBasicTest:Hello!" },
    ]);
    expect(llm.getMetrics()).toEqual({
      total_completionTokens: 3,
      total_promptTokens: 417,
      total_totalTokens: 420,
    });
  });
  it("logMetrics", async () => {
    const logSpy = jest.spyOn(console, "table");

    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-3.5-turbo" });
    await llm.chat([
      { role: "user", content: "__mock__:openAiBasicTest:Hello!" },
    ]);
    llm.logMetrics();

    expect(logSpy).toHaveBeenCalledWith([
      {
        ["Total Calls"]: expect.any(Number),
        ["Total Completion Tokens"]: expect.any(Number),
        ["Total Completion Cost"]: expect.any(Number),
        ["Total Prompt Tokens"]: expect.any(Number),
        ["Total Prompt Cost"]: expect.any(Number),
        ["Total Tokens"]: expect.any(Number),
        ["Total Cost"]: expect.any(Number),
      },
    ]);
  });

  it("chat model accepts functions", async () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-3.5-turbo" });
    await llm.chat([
      { role: "user", content: "__mock__:openAiBasicTest:Hello!" },
    ], {
      function_call: "auto",
      functions: [{name: "test", description: "none", parameters: {}}]
    });

  });


  it("_call calls correct model for chat", async () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-3.5-turbo" });
    jest.spyOn(llm, "chat");
    await llm._call([
      { role: "user", content: "__mock__:openAiBasicTest:Hello!" },
    ]);
    expect(llm.chat).toHaveBeenCalledWith([
      { role: "user", content: "__mock__:openAiBasicTest:Hello!" },
    ], undefined);
  });

  it("_call calls correct model for completion", async () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "davinci" });
    jest.spyOn(llm, "completion");
    await llm._call("__mock__:openAiBasicTest:Hello!");
    expect(llm.completion).toHaveBeenCalledWith(
      "__mock__:openAiBasicTest:Hello!"
    );
  });

  it("completion throws error if input missing", async () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "davinci" });
    expect(llm.completion("")).rejects.toThrowError("Missing prompt.");
  });
  it("completion throws error if input invalid", async () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "davinci" });
    expect(llm.completion(0 as unknown as string)).rejects.toThrowError(
      "Missing prompt."
    );
  });
  it("completion throws error if input invalid", async () => {
    const llm = new OpenAI({ openAIApiKey: "", modelName: "gpt-4" });
    expect(llm.chat(0 as unknown as any[])).rejects.toThrowError(
      "Invalid prompt."
    );
  });
});
