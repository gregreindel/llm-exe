import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { anthropicPromptSanitize } from "./promptSanitize";
import { OutputAnthropicClaude3Chat } from "@/llm/output/claude";
import { cleanJsonSchemaFor } from "@/llm/output/_utils/cleanJsonSchemaFor";

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
    effort: {},
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
      transform: anthropicPromptSanitize,
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
      key: "service_tier",
    },
    effort: {
      key: "output_config.effort",
      transform: (
        v: unknown,
        _s: Record<string, any>,
        _output: Record<string, any>
      ) => {
        if (
          typeof v !== "string" ||
          !["minimal", "low", "medium", "high"].includes(v)
        ) {
          return undefined;
        }

        const model: string = _s.model || "";

        const isAdaptive =
          model.startsWith("claude-opus-4-7") ||
          model.startsWith("claude-opus-4-6") ||
          model.startsWith("claude-sonnet-4-6");

        if (isAdaptive) {
          _output.thinking = { type: "adaptive" };
          const map: Record<string, string> = {
            minimal: "low",
            low: "low",
            medium: "medium",
            high: model.startsWith("claude-opus-4-7") ? "xhigh" : "high",
          };
          return map[v];
        }

        const isLegacy =
          model.startsWith("claude-opus-4-5") ||
          model.startsWith("claude-sonnet-4-5") ||
          model.startsWith("claude-haiku-4-5");

        if (isLegacy) {
          const budgetMap: Record<string, number> = {
            minimal: 1024,
            low: 4096,
            medium: 10240,
            high: 32768,
          };
          _output.thinking = { type: "enabled", budget_tokens: budgetMap[v] };
          return undefined;
        }

        return undefined;
      },
    },
  },
  mapOptions: {
    functionCall: (call, _options) => {
      // Anthropic handles "none" by clearing functions array
      if (call === "none") return { _clearFunctions: true };
      if (call === "auto" || call === "any") {
        return { tool_choice: { type: call } };
      }
      return { tool_choice: call };
    },

    functions: (functions) => ({
      tools: functions.map((f) => ({
        name: f.name,
        description: f.description,
        input_schema: cleanJsonSchemaFor(f.parameters, "anthropic.chat"),
      })),
    }),
  },
  transformResponse: OutputAnthropicClaude3Chat,
};

export const anthropic = {
  "anthropic.chat.v1": anthropicChatV1,
  // Claude 4.6 models
  "anthropic.claude-opus-4-6": withDefaultModel(
    anthropicChatV1,
    "claude-opus-4-6"
  ),
  "anthropic.claude-sonnet-4-6": withDefaultModel(
    anthropicChatV1,
    "claude-sonnet-4-6"
  ),

  // Claude 4.5 models
  "anthropic.claude-haiku-4-5": withDefaultModel(
    anthropicChatV1,
    "claude-haiku-4-5-20251001"
  ),
  "anthropic.claude-opus-4-5": withDefaultModel(
    anthropicChatV1,
    "claude-opus-4-5-20251101"
  ),
  "anthropic.claude-sonnet-4-5": withDefaultModel(
    anthropicChatV1,
    "claude-sonnet-4-5-20250929"
  ),

  // Deprecated
  "anthropic.claude-opus-4-1": withDefaultModel(
    anthropicChatV1,
    "claude-opus-4-1-20250805"
  ),
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
  "anthropic.claude-3-5-sonnet": withDefaultModel(
    anthropicChatV1,
    "claude-3-5-sonnet-latest"
  ),
  "anthropic.claude-3-5-haiku": withDefaultModel(
    anthropicChatV1,
    "claude-3-5-haiku-latest"
  ),
  "anthropic.claude-3-opus": withDefaultModel(
    anthropicChatV1,
    "claude-3-opus-20240229"
  ),
};
