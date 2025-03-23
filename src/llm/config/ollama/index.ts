import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
const ollamaChatV1: Config = {
  key: "ollama.chat.v1",
  provider: "ollama.chat",
  endpoint: `${
    getEnvironmentVariable("OLLAMA_ENDPOINT") || `http://localhost:11434`
  }/api/chat`,
  options: {
    prompt: {},
  },
  method: "POST",
  headers: `{"Content-Type": "application/json" }`,
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
  },
};

export const ollama = {
  "ollama.chat.v1": ollamaChatV1,
  "ollama.deepseek-r1": withDefaultModel(ollamaChatV1, "deepseek-r1"),
  "ollama.llama3.3": withDefaultModel(ollamaChatV1, "llama3.3"),
  "ollama.llama3.2": withDefaultModel(ollamaChatV1, "llama3.2"),
  "ollama.llama3.1": withDefaultModel(ollamaChatV1, "llama3.1"),
  "ollama.qwq": withDefaultModel(ollamaChatV1, "qwq"),
};
