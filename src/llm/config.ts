import { openai } from "./config/openai";
import { bedrock } from "./config/bedrock";
import { anthropic } from "./config/anthropic";
import { xai } from "./config/x";
import { ollama } from "./config/ollama";
import { google } from "./config/google";
import { deepseek } from "./config/deepseek";
import { LlmExeError } from "@/utils/modules/errors";

export const configs = {
  ...openai,
  ...anthropic,
  ...bedrock,
  ...xai,
  ...ollama,
  ...google,
  ...deepseek
};

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function getSuggestions(input: string, validKeys: string[], maxDistance = 3): string[] {
  const prefix = input.includes(".") ? input.split(".")[0] + "." :
                 input.includes(":") ? input.split(":")[0] + ":" : "";

  const prefixMatches = prefix
    ? validKeys.filter((k) => k.startsWith(prefix))
    : [];

  if (prefixMatches.length > 0) {
    return prefixMatches;
  }

  const scored = validKeys
    .map((key) => ({ key, distance: levenshtein(input.toLowerCase(), key.toLowerCase()) }))
    .filter((item) => item.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance);

  return scored.map((item) => item.key);
}

export function getLlmConfig(provider: keyof typeof configs) {
  if (!provider) {
    throw new LlmExeError(`Missing provider`, "unknown", {
      error: "Missing provider",
      resolution: "Provide a valid provider"
    });
  }

  const pick = configs[provider];
  if (pick) {
    return pick;
  }

  const validKeys = Object.keys(configs);
  const suggestions = getSuggestions(String(provider), validKeys);

  let message = `Invalid provider: ${provider}`;
  let resolution = "Provide a valid provider";

  if (suggestions.length === 1) {
    message += `. Did you mean "${suggestions[0]}"?`;
    resolution = `Did you mean "${suggestions[0]}"?`;
  } else if (suggestions.length > 1) {
    message += `. Did you mean one of: ${suggestions.join(", ")}?`;
    resolution = `Valid providers with this prefix: ${suggestions.join(", ")}`;
  }

  throw new LlmExeError(message, "unknown", {
    provider,
    error: message,
    resolution,
  });
}
