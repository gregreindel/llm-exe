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
    temperature: {
      key: "temperature",
    },
    topP: {
      key: "top_p",
    },
    topK: {
      key: "top_k",
    },
    stopSequences: {
      key: "stop_sequences",
    },
    stream: {
      key: "stream",
    },
    metadata: {
      key: "metadata",
    },
    serviceTier: {
      key: "service_tier", // Map camelCase to snake_case
    },
  },
};

export const anthropic = {
  "anthropic.chat.v1": anthropicChatV1,
  // Claude 4 models (latest generation)
  "anthropic.claude-sonnet-4": withDefaultModel(
    anthropicChatV1,
    "claude-sonnet-4-0"
  ),
  "anthropic.claude-opus-4": withDefaultModel(
    anthropicChatV1,
    "claude-opus-4-0"
  ),
  "anthropic.claude-3-7-sonnet": withDefaultModel(
    anthropicChatV1,
    "claude-3-7-sonnet-20250219"
  ),
  // Claude 3.5 models
  "anthropic.claude-3-5-sonnet": withDefaultModel(
    anthropicChatV1,
    "claude-3-5-sonnet-latest"
  ),
  "anthropic.claude-3-5-haiku": withDefaultModel(
    anthropicChatV1,
    "claude-3-5-haiku-latest"
  ),
  // Claude 3 models (previous generation)
  "anthropic.claude-3-opus": withDefaultModel(
    anthropicChatV1,
    "claude-3-opus-20240229"
  ),
  "anthropic.claude-3-haiku": withDefaultModel(
    anthropicChatV1,
    "claude-3-haiku-20240307"
  ),
};
