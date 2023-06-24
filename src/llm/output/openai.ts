import { OutputOpenAIChatChoice } from "@/types";
import { BaseLlmOutput } from "./base";


export interface OutputOpenAIChat {
 results: OutputOpenAIChatChoice[]
}

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
    return;
  }
  getResultContent(resultIndex = 0) {
    const result = this.getResult(resultIndex);
    if(result?.message?.content){
      return result?.message?.content;
    }
    if(result?.message?.content === null || result?.message?.function_call){
      return JSON.stringify({function_call: result?.message?.function_call})
    }
    return;
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