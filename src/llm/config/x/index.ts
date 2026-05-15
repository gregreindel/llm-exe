import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { createOpenAiCompatibleConfiguration } from "../openai/compatible";

const xaiChatV1: Config = createOpenAiCompatibleConfiguration({
  key: "xai.chat.v1",
  provider: "xai.chat",
  endpoint: `https://api.x.ai/v1/chat/completions`,
  apiKeyMapping: ["xAiApiKey", "XAI_API_KEY"],
  // Per xAI docs (checked 2026-05-13), grok-4 errors if `reasoning_effort` is
  // sent; grok-3-mini and the fast-non-reasoning variants don't accept it
  // either. Only grok-4.3 and grok-4.20-multi-agent support it, and neither
  // has a shorthand here yet. Leave the predicate empty so effort is dropped
  // for every currently-shipped xAI shorthand.
  isReasoningModel: () => false,
});

export const xai = {
  "xai.chat.v1": xaiChatV1,
  "xai.grok-2": withDefaultModel(xaiChatV1, "grok-2-latest"),
  "xai.grok-3": withDefaultModel(xaiChatV1, "grok-3"),
  "xai.grok-3-mini": withDefaultModel(xaiChatV1, "grok-3-mini"),
  "xai.grok-4": withDefaultModel(xaiChatV1, "grok-4"),
  "xai.grok-4-fast": withDefaultModel(xaiChatV1, "grok-4-fast-non-reasoning"),
  "xai.grok-4-1-fast": withDefaultModel(xaiChatV1, "grok-4-1-fast-non-reasoning"),
};
