import { OutputOpenAIChat } from "./openai";
import { OutputAnthropicClaude3Chat } from "./claude";
import { OutputMetaLlama3Chat } from "./llama";
import { GenericLLm, LlmProvidor, LlmProvidorKey } from "@/interfaces";
import { OutputDefault } from "./default";

export function getOutputParser(
  config: GenericLLm & {
    providor: LlmProvidor;
    key: LlmProvidorKey;
  },
  response: any
) {
  switch (config.key) {
    case "openai.chat.v1":
    case "openai.chat-mock.v1":
      return OutputOpenAIChat(response, config);
    case "anthropic.chat.v1":
    case "amazon:anthropic.chat.v1":
      return OutputAnthropicClaude3Chat(response, config);
    case "amazon:meta.chat.v1":
      return OutputMetaLlama3Chat(response, config);
    default: {
      if ((config.key as string).startsWith("custom:")) {
        return OutputDefault(response, config);
      }
      throw new Error("Unsupported provider");
    }
  }
}
