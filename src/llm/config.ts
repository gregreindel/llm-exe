import { openai } from "./config/openai";
import { bedrock } from "./config/bedrock";
import { anthropic } from "./config/anthropic";
import { xai } from "./config/x";
import { ollama } from "./config/ollama";
import { google } from "./config/google";

export const configs = {
  ...openai,
  ...anthropic,
  ...bedrock,
  ...xai,
  ...ollama,
  ...google
};

export function getLlmConfig(provider: keyof typeof configs) {
  if(!provider){
    throw new Error(`Missing provider`);
  }

  const pick = configs[provider];
  if (pick) {
    return pick;
  }

  throw new Error(`Invalid provider: ${provider}`);
}
