import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { generateOpenAiCompatibleConfig } from "../openai";

const deepseekChatV1: Config = generateOpenAiCompatibleConfig({
  key: "deepseek.chat.v1",
  provider: "deepseek.chat",
  endpoint: `https://api.deepseek.com/v1/chat/completions`,
  apiKeyMapping: ["deepseekApiKey", "DEEPSEEK_API_KEY"],
});

export const deepseek = {
  "deepseek.chat.v1": deepseekChatV1,
  "deepseek.chat": withDefaultModel(deepseekChatV1, "deepseek-chat"),
};
