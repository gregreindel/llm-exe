import { uuid } from "@/utils";
import { BaseLlmOutput } from "./base";

export { BaseLlmOutput };
export { OutputOpenAIChat, OutputOpenAICompletion } from "./openai";

export class OutputDefault extends BaseLlmOutput {
  constructor(result: any) {
    super(result);
  }

  setResult(result: any) {
    this.id = `fn-${uuid()}`;
    this.name = `none`;
    this.created = new Date().getTime();
    this.usage = {};
    this.results = [result];
  }

  getResult() {
    const [result] = this.results;
    return result;
  }

  getResultContent() {
    return this.getResult();
  }
}
