// This file is maintained for backward compatibility
// The implementation has moved to FunctionCallParser.ts

export { 
  OpenAiFunctionParser,
  FunctionCallParser,
  type FunctionCall,
  type FunctionCallParserOptions
} from "./FunctionCallParser";

// Re-export the deprecated name as default for maximum compatibility
export { OpenAiFunctionParser as default } from "./FunctionCallParser";