import { openai } from "./config/openai";
import { bedrock } from "./config/bedrock";
import { anthropic } from "./config/anthropic";

export const configs = {
  ...openai,
  ...anthropic,
  ...bedrock,
};

export function getLlmConfig(provider: keyof typeof configs) {
  const pick = configs[provider];
  if (pick) {
    return pick;
  }
  throw new Error("Invalid provider");
}
