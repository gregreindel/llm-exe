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

function getSuggestions(input: string, keys: string[]): string[] {
  const prefix = input.includes(".") ? input.split(".")[0] + "." : "";
  const prefixMatches = prefix
    ? keys.filter((k) => k.startsWith(prefix))
    : [];

  if (prefixMatches.length > 0 && prefixMatches.length <= 5) {
    return prefixMatches;
  }

  const maxDistance = Math.max(3, Math.floor(input.length * 0.4));
  return keys
    .map((k) => ({ key: k, dist: levenshtein(input, k) }))
    .filter((item) => item.dist <= maxDistance)
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3)
    .map((item) => item.key);
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

  const suggestions = getSuggestions(String(provider), Object.keys(configs));
  const suggestionText = suggestions.length > 0
    ? ` Did you mean: ${suggestions.join(", ")}?`
    : "";

  throw new LlmExeError(`Invalid provider: ${provider}.${suggestionText}`, "unknown", {
    provider,
    error: `Invalid provider: ${provider}`,
    resolution: suggestions.length > 0
      ? `Did you mean: ${suggestions.join(", ")}?`
      : "Provide a valid provider"
  });
}
