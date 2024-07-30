import { OutputOpenAIChat } from "./openai";
import { OutputAnthropicClaude3Chat } from "./claude";
import { OutputMetaLlama3Chat } from "./llama";

export function getOutputParser(provider: string, response: any) {
  switch (provider) {
    case "openai":
    case "openai.mock":
      return OutputOpenAIChat(response);
    case "anthropic":
    case "amazon.anthropic.v3":
      return OutputAnthropicClaude3Chat(response);
    case "amazon.meta.v3":
      return OutputMetaLlama3Chat(response);
    default:
      throw new Error("Unsupported provider");
  }
}