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
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function getSuggestions(
  invalid: string,
  validKeys: string[]
): string[] {
  const prefix = invalid.split(".")[0];
  const prefixMatches = validKeys.filter(
    (k) => k.split(".")[0] === prefix || k.startsWith(prefix + ".")
  );

  if (prefixMatches.length > 0) {
    return prefixMatches;
  }

  const threshold = Math.max(3, Math.floor(invalid.length * 0.4));
  const scored = validKeys
    .map((k) => ({ key: k, dist: levenshtein(invalid, k) }))
    .filter((s) => s.dist <= threshold)
    .sort((a, b) => a.dist - b.dist);

  return scored.slice(0, 5).map((s) => s.key);
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
  let resolution = "Provide a valid provider.";

  if (suggestions.length > 0) {
    message += `. Did you mean: ${suggestions.join(", ")}?`;
    resolution = `Did you mean: ${suggestions.join(", ")}?`;
  } else {
    resolution = `Valid providers: ${validKeys.join(", ")}`;
  }

  throw new LlmExeError(message, "unknown", {
    provider,
    error: message,
    resolution
  });
}
