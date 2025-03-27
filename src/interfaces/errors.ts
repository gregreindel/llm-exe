export type ErrorContextMap = {
  unknown: unknown;
  llm: { provider: string; model: string; error: string };
  prompt: { prompt: any; provider?: string; model?: string; error: string };
  parser: { parser: string; output: any; error: string };
};

export type ErrorCodes = keyof ErrorContextMap;
