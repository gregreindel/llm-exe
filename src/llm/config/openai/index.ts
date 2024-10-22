import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";

const openAiChatV1: Config = {
  key: "openai.chat.v1",
  provider: "openai.chat",
  endpoint: `https://api.openai.com/v1/chat/completions`,
  options: {
    prompt: {},
    topP: {},
    useJson: {},
    openAiApiKey: {
      default: getEnvironmentVariable("OPENAI_API_KEY")
    },
  },
  method: "POST",
  headers: `{"Authorization":"Bearer {{openAiApiKey}}", "Content-Type": "application/json" }`,
  mapBody: {
    prompt: {
      key: "messages",
      sanitize: (v) => {
        if (typeof v === "string") {
          return [{ role: "user", content: v }];
        }
        return v;
      },
    },
    model: {
      key: "model",
    },
    topP: {
      key: "top_p",
    },
    useJson: {
      key: "response_format.type",
      sanitize: (v) => (v ? "json_object" : "text"),
    },
  },
};

const openAiChatMockV1: Config = {
  key: "openai.chat-mock.v1",
  provider: "openai.chat-mock",
  endpoint: `http://localhost`,
  options: {
    prompt: {},
    topP: {},
    useJson: {},
    openAiApiKey: {
      default: getEnvironmentVariable("OPENAI_API_KEY_MOCK")
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
      sanitize: (v) => (v ? "json_object" : "text"),
    },
  },
};




export const openai = {
  "openai.chat.v1": openAiChatV1,
  "openai.chat-mock.v1": openAiChatMockV1,
  "openai.gpt-4o": withDefaultModel(openAiChatV1, "gpt-4o"),
  "openai.gpt-4o-mini": withDefaultModel(openAiChatV1, "gpt-4o-mini")
};
