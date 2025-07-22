import { uuid } from "./uuid";

/**
 * Generates a tool call ID in the format expected by each provider.
 * 
 * @param provider - The LLM provider name (e.g., "openai", "anthropic", "google")
 * @returns A tool call ID in the provider's expected format
 * 
 * @example
 * generateToolCallId("openai") // "call_abc123..."
 * generateToolCallId("anthropic") // "toolu_def456..."
 * generateToolCallId("google") // "gem_ghi789..."
 */
export function generateToolCallId(provider: string): string {
  // Use existing uuid utility from llm-exe
  const id = uuid().replace(/-/g, '');
  
  if (provider.startsWith('openai')) {
    // OpenAI format: call_[24 chars]
    return `call_${id.substring(0, 24)}`;
  } else if (provider.startsWith('anthropic')) {
    // Anthropic format: toolu_[23 chars]
    return `toolu_${id.substring(0, 23)}`;
  } else if (provider.startsWith('google')) {
    // Gemini doesn't use IDs for function calls
    // Return a simple identifier for internal tracking
    return `gem_${id.substring(0, 25)}`;
  }
  // Fallback for other providers
  return id.substring(0, 32);
}