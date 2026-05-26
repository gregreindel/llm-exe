export type ErrorContextMap = {
  unknown: unknown;
  llm: { provider: string; model: string; error: string };
  prompt: { prompt: any; provider?: string; model?: string; error: string };
  parser: { parser: string; output: any; error: string };
  state: { module: string; error: string };
  // Added in v3.0.0 ahead of full error-handling-spec rollout. When the v3 error
  // infrastructure (options-bag LlmExeError, createLlmExeError, typed
  // ErrorContextByCode registry) lands, this entry should move to that
  // registry and the prompt builder should switch to createLlmExeError.
  "prompt.missing_template_variable": {
    operation: "Prompt.validate";
    promptType: string;
    missingVariables: string[];
    missingHelpers: string[];
  };
};

export type ErrorCodes = keyof ErrorContextMap;
