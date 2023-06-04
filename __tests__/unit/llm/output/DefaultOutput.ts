
import { BaseLlmOutput, OutputDefault } from "@/llm/output";

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:output/OutputDefault", () => {
  it('creates class with expected properties', () => {
    const output = new OutputDefault({})
    expect(output).toBeInstanceOf(BaseLlmOutput)
    expect(output).toBeInstanceOf(OutputDefault)
    expect(output).toHaveProperty("id")
    expect(output).toHaveProperty("name")
    expect(output).toHaveProperty("created")
    expect(output).toHaveProperty("results")
    expect(output).toHaveProperty("usage")
  })
  it('creates class with expected methods', () => {
    const output = new OutputDefault({})
    expect(output).toBeInstanceOf(BaseLlmOutput)
    expect(output).toBeInstanceOf(OutputDefault)
    expect(output).toHaveProperty("getResults")
    expect(typeof output.getResults).toEqual("function")
    expect(output).toHaveProperty("setResult")
    expect(typeof output.setResult).toEqual("function")
    expect(output).toHaveProperty("getResult")
    expect(typeof output.getResult).toEqual("function")
    expect(output).toHaveProperty("getResultContent")
    expect(typeof output.getResultContent).toEqual("function")
  });
  it('getResults gets results', () => {
    const mock = "Result"
    const output = new OutputDefault(mock)
    expect(output.getResults()).toEqual(["Result"])
  })
  it('getResult gets result', () => {
    const mock = "Result"
    const output = new OutputDefault(mock)
    expect(output.getResult()).toEqual("Result")
  })
  it('getResultContent gets result', () => {
    const mock = "Result"
    const output = new OutputDefault(mock)
    expect(output.getResultContent()).toEqual("Result")
  })
})