import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config, IChatMessages } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";

const ANTHROPIC_VERSION = "2023-06-01";

export function anthropicPromptSanitize(
  _messages: string | IChatMessages,
  _inputBodyObj: Record<string, any>,
  _outputObj: Record<string, any>
) {
  if (typeof _messages === "string") {
    return [{ role: "user", content: _messages }];
  }

  const [first, ...messages] = [..._messages.map((a) => ({ ...a }))];

  // if a single message is passed in, and it is a system mesage, set it to user
  if (first.role === "system" && messages.length === 0) {
    return [{ role: "user", content: first.content }, ...messages];
  }

  // if more than one message is passed in, and the first is a system message, set it to system
  if (first.role === "system" && messages.length > 0) {
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
  headers: `{"x-api-key":"{{anthropicApiKey}}", "Content-Type": "application/json", "anthropic-version": "${ANTHROPIC_VERSION}" }`,
  method: "POST",
  options: {
    prompt: {},
    system: {},
    maxTokens: {
      required: [true, "maxTokens required"],
      default: 4096,
    },
    anthropicApiKey: {
      default: getEnvironmentVariable("ANTHROPIC_API_KEY"),
    },
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
};

export const anthropic = {
  "anthropic.chat.v1": anthropicChatV1,
  "anthropic.claude-3-7-sonnet": withDefaultModel(
    anthropicChatV1,
    "claude-3-7-sonnet-latest"
  ),
  "anthropic.claude-3-5-sonnet": withDefaultModel(
    anthropicChatV1,
    "claude-3-5-sonnet-latest"
  ),
  "anthropic.claude-3-opus": withDefaultModel(
    anthropicChatV1,
    "claude-3-opus-latest"
  ),
  "anthropic.claude-3-sonnet": withDefaultModel(
    anthropicChatV1,
    "claude-3-sonnet-latest"
  ),
  "anthropic.claude-3-haiku": withDefaultModel(
    anthropicChatV1,
    "claude-3-haiku-latest"
  ),
};
