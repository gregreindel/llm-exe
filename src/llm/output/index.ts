import { OutputOpenAIChat } from "./openai";
import { OutputAnthropicClaude3Chat } from "./claude";
import { OutputMetaLlama3Chat } from "./llama";
import { LlmProviderKey } from "@/interfaces";
import { OutputDefault } from "./default";
import { OutputXAIChat } from "./xai";

export function getOutputParser(
  config: {
    key: LlmProviderKey;
    model?: string;
  },
  response: any
) {
  switch (config?.key) {
    case "openai.chat.v1":
    case "openai.chat-mock.v1":
      return OutputOpenAIChat(response, config);
    case "anthropic.chat.v1":
    case "amazon:anthropic.chat.v1":
      return OutputAnthropicClaude3Chat(response, config);
    case "amazon:meta.chat.v1":
      return OutputMetaLlama3Chat(response, config);
    // case "amazon:nova.chat.v1":
    // return OutputDefault(response, config);
    case "xai.chat.v1":
      return OutputXAIChat(response, config);
    default: {
      if ((config?.key as string)?.startsWith("custom:")) {
        return OutputDefault(response, config);
      }
      throw new Error("Unsupported provider");
    }
  }
}
