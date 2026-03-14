import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { OutputOpenAIChat } from "@/llm/output/openai";
import { createOpenAiCompatibleConfiguration } from "./compatible";

const openAiChatV1: Config = createOpenAiCompatibleConfiguration({
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
  // GPT-5 family
  "openai.gpt-5.4": withDefaultModel(openAiChatV1, "gpt-5.4"),
  "openai.gpt-5.3": withDefaultModel(openAiChatV1, "gpt-5.3"),
  "openai.gpt-5.2": withDefaultModel(openAiChatV1, "gpt-5.2"),
  "openai.gpt-5-mini": withDefaultModel(openAiChatV1, "gpt-5-mini"),
  "openai.gpt-5-nano": withDefaultModel(openAiChatV1, "gpt-5-nano"),
  // GPT-4.1 family
  "openai.gpt-4.1": withDefaultModel(openAiChatV1, "gpt-4.1"),
  "openai.gpt-4.1-mini": withDefaultModel(openAiChatV1, "gpt-4.1-mini"),
  "openai.gpt-4.1-nano": withDefaultModel(openAiChatV1, "gpt-4.1-nano"),
  // Reasoning models
  "openai.o3": withDefaultModel(openAiChatV1, "o3"),
  "openai.o3-pro": withDefaultModel(openAiChatV1, "o3-pro"),
  "openai.o4-mini": withDefaultModel(openAiChatV1, "o4-mini"),
  // GPT-4o family
  "openai.gpt-4o": withDefaultModel(openAiChatV1, "gpt-4o"),
  "openai.gpt-4o-mini": withDefaultModel(openAiChatV1, "gpt-4o-mini"),
};
