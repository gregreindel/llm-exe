import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { openaiPromptSanitize } from "./promptSanitize";
import { OutputOpenAIChat } from "@/llm/output/openai";
import { cleanJsonSchemaFor } from "@/llm/output/_utils/cleanJsonSchemaFor";

export function generateOpenAiCompatibleConfig<
  K extends Config["key"],
>(overrides: {
  key: string;
  provider: string;
  endpoint: string;
  apiKeyMapping: [string, string];
  transformResponse?: any;
}) {
  const [apiKeyPropertyKey, apiKeyPropertyValue] = overrides.apiKeyMapping;

  const config: Config = {
    key: overrides.key as K,
    provider: overrides.provider as Config["provider"],
    endpoint: overrides.endpoint,
    options: {
      prompt: {},
      topP: {},
      useJson: {},
      [apiKeyPropertyKey]: {
        default: getEnvironmentVariable(apiKeyPropertyValue),
      },
    },
    method: "POST",
    headers: `{"Authorization":"Bearer {{${apiKeyPropertyKey}}}", "Content-Type": "application/json" }`,
    mapBody: {
      prompt: {
        key: "messages",
        transform: openaiPromptSanitize,
      },
      model: {
        key: "model",
      },
      topP: {
        key: "top_p",
      },
      useJson: {
        key: "response_format.type",
        transform: (v) => (v ? "json_object" : "text"),
      },
    },
    mapOptions: {
      jsonSchema: (schema, options, currentInput) => ({
        response_format: {
          ...(currentInput?.response_format || {}),
          type: "json_schema",
          json_schema: {
            name: "output",
            strict: !!options?.functionCallStrictInput,
            schema: cleanJsonSchemaFor(schema, "openai.chat"),
          },
        },
      }),

      functionCall: (call) => {
        if (call === "any") return { tool_choice: "required" };
        if (call === "none") return { tool_choice: "none" };
        if (call === "auto") return { tool_choice: "auto" };
        return { tool_choice: call }; // specific function
      },

      functions: (functions, options) => ({
        tools: functions.map((f) => ({
          type: "function",
          function: {
            name: f.name,
            description: f.description,
            parameters: cleanJsonSchemaFor(f.parameters, "openai.chat"),
            strict: !!options?.functionCallStrictInput,
          },
        })),
      }),
    },
    transformResponse: overrides.transformResponse ?? OutputOpenAIChat,
  };

  return config;
}

const openAiChatV1: Config = generateOpenAiCompatibleConfig({
  key: "openai.chat.v1",
  provider: "openai.chat",
  endpoint: `https://api.openai.com/v1/chat/completions`,
  apiKeyMapping: ["openAiApiKey", "OPENAI_API_KEY"],
});

const openAiChatMockV1: Config = {
  key: "openai.chat-mock.v1",
  provider: "openai.chat-mock",
  endpoint: `http://localhost`,
  options: {
    prompt: {},
    topP: {},
    useJson: {},
    openAiApiKey: {
      default: getEnvironmentVariable("OPENAI_API_KEY_MOCK"),
    },
  },
  method: "POST",
  headers: `{"Authorization":"Bearer {{openAiApiKey}}", "Content-Type": "application/json" }`,
  mapBody: {
    prompt: {
      key: "messages",
    },
    model: {
      key: "model",
    },
    topP: {
      key: "top_p",
    },
    useJson: {
      key: "response_format.type",
      transform: (v) => (v ? "json_object" : "text"),
    },
  },
  transformResponse: OutputOpenAIChat,
};

export const openai = {
  "openai.chat.v1": openAiChatV1,
  "openai.chat-mock.v1": openAiChatMockV1,
  "openai.gpt-4o": withDefaultModel(openAiChatV1, "gpt-4o"),
  "openai.gpt-4o-mini": withDefaultModel(openAiChatV1, "gpt-4o-mini"),
};
