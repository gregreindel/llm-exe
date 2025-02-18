import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";

const xaiChatV1: Config = {
  key: "xai.chat.v1",
  provider: "xai.chat",
  endpoint: `https://api.x.ai/v1/chat/completions`,
  options: {
    prompt: {},
    topP: {},
    useJson: {},
    xAiApiKey: {
      default: getEnvironmentVariable("XAI_API_KEY")
    },
  },
  method: "POST",
  headers: `{"Authorization":"Bearer {{xAiApiKey}}", "Content-Type": "application/json" }`,
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



export const xai = {
  "xai.chat.v1": xaiChatV1,
  "xai.grok-2": withDefaultModel(xaiChatV1, "grok-2-latest"),
};
