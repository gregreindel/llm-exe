import { Claude3Response } from "@/types";
import { BaseLlmOutput } from "./base";

export interface OutputAnthropicClaude3Chat {
 results: Claude3Response[]
}

export class OutputAnthropicClaude3Chat extends BaseLlmOutput {
  constructor(result: any) {
    super(result);
  }

  setResult(result: any, _attributes = {}) {
    this.id = result.id;
    this.name = result.model;
    this.created = result.created;
    this.usage = result.usage;
    this.results = result.content;
  }

  getResult(resultIndex = 0) {
    if (resultIndex > -1 && resultIndex <= this.results.length) {
      const result = this.results[resultIndex];
      return result;
    }
    return;
  }
  getResultContent(resultIndex = 0) {
    const result = this.getResult(resultIndex) as Claude3Response["content"][number] | undefined
    if(result?.text){
      return result?.text;
    }
    // if(result?.content === null || result?.function_call){
    //   return JSON.stringify({function_call: result?.function_call})
    // }
    return;
  }
}

