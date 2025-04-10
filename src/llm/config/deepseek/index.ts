import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";

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


export const deepseek = {
  "deepseek.chat.v1": deepseekChatV1,
  "deepseek.chat": withDefaultModel(deepseekChatV1, "deepseek-chat"),
};
