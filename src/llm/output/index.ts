import { uuid } from "@/utils";
import { BaseLlmOutput } from "./base";
import { OutputOpenAIChat } from "./openai";
import { OutputAnthropicClaude3Chat } from "./claude";
import { OutputMetaLlama3Chat } from "./llama";

export { BaseLlmOutput };
export { OutputOpenAIChat, OutputOpenAICompletion } from "./openai";
export { OutputMetaLlama3Chat } from "./llama";
export { OutputAnthropicClaude3Chat } from "./claude";

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

export function getOutputParser(provider: string, response: any) {
  switch (provider) {
    case "openai":
      return new OutputOpenAIChat(response);
    case "anthropic":
    case "amazon.anthropic.v3":
      return new OutputAnthropicClaude3Chat(response);
    case "amazon.meta.v3":
      return new OutputMetaLlama3Chat(response);
    default:
      throw new Error("Unsupported provider");
  }
}