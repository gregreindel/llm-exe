import { cleanJsonSchemaFor } from "@/llm/output/_utils/cleanJsonSchemaFor";
import { CallableExecutorCore, GenericFunctionCall } from "@/interfaces/functions";

// Handle options.functionCall for Anthropic
export function functionCallSanitize(
  functionCall: GenericFunctionCall | "required" | undefined | null,
  _input: Record<string, any>,
  _output: Record<string, any>
): GenericFunctionCall | { type: string } | "required" | undefined {
  if (!functionCall) return undefined;
  
  if (functionCall === "none") {
    return undefined;
  } else if (functionCall === "auto" || functionCall === "any") {
    return { type: functionCall };
  }
  
  return functionCall;
}

// Handle options.functions for Anthropic
export function functionsSanitize(
  functions: CallableExecutorCore[] | undefined | null,
  input: Record<string, any>,
  _output: Record<string, any>
): Array<{
  name: string;
  description?: string;
  input_schema: any;
}> | undefined {
  if (!functions?.length) return undefined;
  
  // Check if functionCall is "none" - if so, don't include functions
  if (input._options?.functionCall === "none") return undefined;
  
  return functions.map(f => ({
    name: f.name,
    description: f.description,
    input_schema: cleanJsonSchemaFor(f.parameters, "anthropic.chat"),
  }));
}