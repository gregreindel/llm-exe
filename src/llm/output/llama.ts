import { MetaLlama2Response } from "@/types";
import { BaseLlmOutput } from "./base";
import { uuid } from "@/utils";

export interface OutputMetaLlama3Chat {
  results: { text: string }[];
}

export class OutputMetaLlama3Chat extends BaseLlmOutput {
  constructor(result: any) {
    super(result);
  }

  setResult(result: MetaLlama2Response, _attributes = {}) {
    this.id = uuid();
    this.name = "llama";
    this.created = new Date().getTime()
    this.usage = {
      completion_tokens: result.generation_token_count, 
      prompt_tokens: result.prompt_token_count,
      total_tokens: result.generation_token_count + result.prompt_token_count,
    };
    this.results = [{text: result.generation}];
  }

  getResult(resultIndex: number) {
    if (resultIndex > -1 && resultIndex <= this.results.length) {
      const result = this.results[resultIndex];
      return result;
    }
    return;
  }
  getResultContent(resultIndex = 0) {
    const result = this.getResult(resultIndex)
    if (result?.text) {
      return result?.text;
    }
    // if(result?.content === null || result?.function_call){
    //   return JSON.stringify({function_call: result?.function_call})
    // }
    return;
  }
}
