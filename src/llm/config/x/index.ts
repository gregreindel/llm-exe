import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { createOpenAiCompatibleConfiguration } from "../openai/compatible";

const xaiChatV1: Config = createOpenAiCompatibleConfiguration({
  key: "xai.chat.v1",
  provider: "xai.chat",
  endpoint: `https://api.x.ai/v1/chat/completions`,
  apiKeyMapping: ["xAiApiKey", "XAI_API_KEY"],
});

export const xai = {
  "xai.chat.v1": xaiChatV1,
  "xai.grok-2": withDefaultModel(xaiChatV1, "grok-2-latest"),
  "xai.grok-3": withDefaultModel(xaiChatV1, "grok-3"),
  "xai.grok-4": withDefaultModel(xaiChatV1, "grok-4"),
};
