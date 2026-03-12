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

export function getSuggestion(input: string, validKeys: string[]): string {
  const prefix = input.split(".")[0];
  const prefixMatches = validKeys.filter((k) => k.startsWith(prefix + "."));

  let closest: { key: string; distance: number } | undefined;
  for (const key of validKeys) {
    const d = levenshtein(input, key);
    if (!closest || d < closest.distance) {
      closest = { key, distance: d };
    }
  }

  const maxDistance = Math.max(3, Math.floor(input.length * 0.4));
  const didYouMean = closest && closest.distance <= maxDistance && closest.distance > 0
    ? `Did you mean "${closest.key}"?`
    : undefined;

  if (didYouMean && prefixMatches.length > 0) {
    return `${didYouMean} Valid providers for "${prefix}": ${prefixMatches.join(", ")}`;
  }
  if (didYouMean) {
    return didYouMean;
  }
  if (prefixMatches.length > 0) {
    return `Valid providers for "${prefix}": ${prefixMatches.join(", ")}`;
  }
  return `Valid providers: ${validKeys.join(", ")}`;
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
  const suggestion = getSuggestion(String(provider), validKeys);

  throw new LlmExeError(`Invalid provider: ${provider}. ${suggestion}`, "unknown", {
    provider,
    error: `Invalid provider: ${provider}`,
    resolution: suggestion
  });
}
