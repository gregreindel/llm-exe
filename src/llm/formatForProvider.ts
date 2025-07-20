import { getLlmConfig } from "@/llm/config";
import { mapBody } from "@/llm/_utils.mapBody";
import { IChatMessages, GenericLLm, LlmProviderKey } from "@/types";
import { CallableExecutorCore, GenericFunctionCall } from "@/interfaces/functions";

// Map of provider names to config keys
const PROVIDER_CONFIGS = {
  "openai": "openai.chat.v1",
  "anthropic": "anthropic.chat.v1",
  "deepseek": "deepseek.chat.v1",
  "x": "xai.chat.v1",
  "ollama": "ollama.chat.v1",
  "google": "google.chat.v1",
  "amazon:anthropic": "amazon:anthropic.chat.v1",
  "amazon:meta": "amazon:meta.chat.v1",
} as const satisfies Record<string, LlmProviderKey>;

// Derive the provider shorthand type from the const object
type ProviderShorthand = keyof typeof PROVIDER_CONFIGS;

// Options that can be passed to formatForProvider
export interface FormatForProviderOptions extends Pick<GenericLLm,
  | "model"
  | "topP"
  | "maxTokens"
  | "system"
> {
  // Additional options from Phase 2
  functions?: CallableExecutorCore[];
  functionCall?: GenericFunctionCall;
  jsonSchema?: Record<string, any>;
  functionCallStrictInput?: boolean;
  useJson?: boolean;
}

/**
 * Format messages for a specific provider without calling the LLM
 * This utility is useful for testing and understanding how messages
 * are transformed for different providers
 * 
 * @param provider - Provider shorthand like "openai", "anthropic", etc.
 * @param messages - The messages to format
 * @param options - Additional options for formatting
 */
export function formatForProvider(
  provider: ProviderShorthand,
  messages: string | IChatMessages,
  options?: FormatForProviderOptions
): Record<string, any> {
  const configKey = PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS];
  
  if (!configKey) {
    throw new Error(`Unknown provider: ${provider}`);
  }
  
  const config = getLlmConfig(configKey);
  
  // Build the input object as llm.call.ts does
  const input = {
    prompt: messages,
    ...options,
    // For Phase 2 options, pass them with underscore prefix
    _options: options ? {
      functions: options.functions,
      functionCall: options.functionCall,
      jsonSchema: options.jsonSchema,
      functionCallStrictInput: options.functionCallStrictInput,
    } : undefined,
  };
  
  // Use mapBody to apply all transformations
  return mapBody(config.mapBody, input);
}