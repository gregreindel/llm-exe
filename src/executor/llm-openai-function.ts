// This file is maintained for backward compatibility
// The implementation has moved to llm-with-functions.ts

export { 
  LlmExecutorWithFunctions,
  LlmExecutorOpenAiFunctions
} from "./llm-with-functions";

// Re-export the deprecated name as default for maximum compatibility
export { LlmExecutorOpenAiFunctions as default } from "./llm-with-functions";