import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { anthropicPromptSanitize } from "./promptSanitize";

const ANTHROPIC_VERSION = "2023-06-01";

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
