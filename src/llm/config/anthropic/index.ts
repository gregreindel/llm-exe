
import { Config, IChatMessages } from "@/types";

const ANTORPIC_VERSION = "2023-06-01";

export function anthropicPromptSanitize(
    _messages: string | IChatMessages,
    _inputBodyObj: Record<string, any>,
    _outputObj: Record<string, any>
  ) {
    if (typeof _messages === "string") {
      return [{ role: "user", content: _messages }];
    }
  
    const [first, ...messages] = [..._messages.map((a) => ({ ...a }))];
    // if its simple - like one system message in messages,
    // but no system message passed in, then just add the system
    if (first.role === "system") {
      _outputObj.system = first.content;
      return messages;
    }
    // otherwise, don't make assumptions?
    return [first, ...messages];
  }

const anthropicChatV1: Config = {
    key: "anthropic.chat.v1",
    provider: "anthropic.chat",
    endpoint: `https://api.anthropic.com/v1/messages`,
    headers: `{"x-api-key":"{{anthropicApiKey}}", "Content-Type": "application/json", "anthropic-version": "${ANTORPIC_VERSION}" }`,
    method: "POST",
    options: {
      prompt: {},
      system: {},
      maxTokens: {
        required: [true, "maxTokens required"],
      },
      anthropicApiKey: {},
    },
    mapBody: {
      model: {
        key: "model",
      },
      maxTokens: {
        key: "max_tokens",
      },
      system: {
        key: "system",
      },
      prompt: {
        key: "messages",
        sanitize: anthropicPromptSanitize,
      },
    },

}


export const anthropic = {
  "anthropic.chat.v1": anthropicChatV1
}