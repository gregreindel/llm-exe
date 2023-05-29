import { BaseLlmOutput, OutputOpenAICompletion } from "@/llm/output";
import * as utils from "@/utils";

// Spy on the replaceTemplateString function
jest.spyOn(utils, "replaceTemplateString");

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:output/OutputOpenAICompletion", () => {
  const mock = {
    "id": "cmpl-7K6f9yeNFVF8JFoivVo2pKQP338Aa",
    "object": "text_completion",
    "created": 1685026527,
    "model": "text-davinci-003",
    "choices": [
        {
            "text": "This is the assistant message content.",
            "index": 0,
            "logprobs": null,
            "finish_reason": "stop"
        }
    ],
    "usage": {
        "prompt_tokens": 1713,
        "completion_tokens": 35,
        "total_tokens": 1748
    }
}
  it("creates class with expected properties", () => {
    const output = new OutputOpenAICompletion(mock);
    expect(output).toBeInstanceOf(BaseLlmOutput);
    expect(output).toBeInstanceOf(OutputOpenAICompletion);
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("results");
    expect(output).toHaveProperty("usage");
  });
  it("creates class with expected properties", () => {
    const output = new OutputOpenAICompletion(mock);
    expect((output as any).id).toEqual(mock.id)
    expect((output as any).name).toEqual(mock.model)
    expect((output as any).created).toEqual(mock.created)
    expect((output as any).results).toEqual(mock.choices)
    expect((output as any).usage).toEqual(mock.usage)
  });
  it("creates class with expected methods", () => {
    const output = new OutputOpenAICompletion(mock);
    expect(output).toBeInstanceOf(BaseLlmOutput);
    expect(output).toBeInstanceOf(OutputOpenAICompletion);
    expect(output).toHaveProperty("getResults");
    expect(typeof output.getResults).toEqual("function");
    expect(output).toHaveProperty("setResult");
    expect(typeof output.setResult).toEqual("function");
    expect(output).toHaveProperty("getResult");
    expect(typeof output.getResult).toEqual("function");
    expect(output).toHaveProperty("getResultContent");
    expect(typeof output.getResultContent).toEqual("function");
  });
  it("getResults gets results", () => {
    const output = new OutputOpenAICompletion(mock);
    expect(output.getResults()).toEqual([      {
      "text": "This is the assistant message content.",
      "index": 0,
      "logprobs": null,
      "finish_reason": "stop"
      }]);
  });
  it("getResult gets result", () => {
    const output = new OutputOpenAICompletion(mock);
    expect(output.getResult()).toEqual({
      "text": "This is the assistant message content.",
      "index": 0,
      "logprobs": null,
      "finish_reason": "stop"
      });
  });
  it("getResultContent gets result", () => {
    const output = new OutputOpenAICompletion(mock);
    expect(output.getResultContent()).toEqual( "This is the assistant message content.");
  });

  it("getResultContent gets undefined if not exists", () => {
    const output = new OutputOpenAICompletion(mock);
    expect(output.getResultContent(8)).toEqual(undefined);
  });
});
