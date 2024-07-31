import { OutputOpenAIChat } from "./openai";
import { OutputAnthropicClaude3Chat } from "./claude";
import { OutputMetaLlama3Chat } from "./llama";
import { LlmProvidorKey } from "@/interfaces";
// | "openai.embedding"
export function getOutputParser(provider: LlmProvidorKey, response: any) {
  switch (provider) {
    case "openai.chat.v1":
    case "openai.chat-mock.v1":
      return OutputOpenAIChat(response);
    case "anthropic.chat.v1":
    case "amazon:anthropic.chat.v1":
      return OutputAnthropicClaude3Chat(response);
    case "amazon:meta.chat.v1":
      return OutputMetaLlama3Chat(response);
    default:
      throw new Error("Unsupported provider");
  }
}