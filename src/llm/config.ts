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

function getSuggestions(input: string, keys: string[], maxDistance = 3): string[] {
  const scored = keys
    .map((key) => ({ key, distance: levenshtein(input.toLowerCase(), key.toLowerCase()) }))
    .filter((item) => item.distance <= maxDistance && item.distance > 0)
    .sort((a, b) => a.distance - b.distance);

  return scored.slice(0, 3).map((item) => item.key);
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

  const providerStr = String(provider);
  const allKeys = Object.keys(configs);
  const suggestions = getSuggestions(providerStr, allKeys);

  const prefix = providerStr.split(".")[0];
  const prefixMatches = allKeys.filter((k) => k.startsWith(prefix + ".") || k.startsWith(prefix + ":"));

  let resolution = "Provide a valid provider.";
  if (suggestions.length > 0) {
    resolution = `Did you mean: ${suggestions.map((s) => `"${s}"`).join(", ")}?`;
  } else if (prefixMatches.length > 0) {
    resolution = `Available "${prefix}" providers: ${prefixMatches.map((s) => `"${s}"`).join(", ")}.`;
  }

  throw new LlmExeError(`Invalid provider: ${provider}`, "unknown", {
    provider: providerStr,
    error: `Invalid provider: ${provider}`,
    resolution,
  });
}
