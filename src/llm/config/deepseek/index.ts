import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { promptSanitize, useJsonSanitize } from "../openai/promptSanitize";

const deepseekChatV1: Config = {
  key: "deepseek.chat.v1",
  provider: "deepseek.chat",
  endpoint: `https://api.deepseek.com/v1/chat/completions`,
  options: {
    prompt: {},
    topP: {},
    useJson: {},
    deepseekApiKey: {
      default: getEnvironmentVariable("DEEPSEEK_API_KEY")
    },
  },
  method: "POST",
  headers: `{"Authorization":"Bearer {{deepseekApiKey}}", "Content-Type": "application/json" }`,
  mapBody: {
    prompt: {
      key: "messages",
      sanitize: promptSanitize, // Reuse OpenAI sanitizer
    },
    model: {
      key: "model",
    },
    topP: {
      key: "top_p",
    },
    useJson: {
      key: "response_format.type",
      sanitize: useJsonSanitize, // Reuse OpenAI sanitizer
    },
  },
};


export const deepseek = {
  "deepseek.chat.v1": deepseekChatV1,
  "deepseek.chat": withDefaultModel(deepseekChatV1, "deepseek-chat"),
};
