import { BaseLlmOutput } from "./base";

export class OutputOpenAIChat extends BaseLlmOutput {
  constructor(result: any) {
    super(result);
  }

  setResult(result: any, _attributes = {}) {
    this.id = result.id;
    this.name = result.model;
    this.created = result.created;
    this.usage = result.usage;
    this.results = result.choices;
  }

  getResult(resultIndex = 0) {
    if (resultIndex > -1 && resultIndex <= this.results.length) {
      const result = this.results[resultIndex];
      return result;
    }
  }
  getResultContent(resultIndex = 0) {
    const result = this.getResult(resultIndex);
    return result?.message?.content;
  }
}


export class OutputOpenAICompletion extends BaseLlmOutput {
  constructor(result: any) {
    super(result);
  }

  setResult(result: any, _attributes = {}) {
    this.id = result.id;
    this.name = result.model;
    this.created = result.created;
    this.usage = result.usage;
    this.results = result.choices;
  }

  getResult(resultIndex = 0) {
    if (resultIndex > -1 && resultIndex <= this.results.length) {
      const result = this.results[resultIndex];
      return result;
    }
  }
  getResultContent(resultIndex = 0) {
    const result = this.getResult(resultIndex);
    return result?.text;
  }
}