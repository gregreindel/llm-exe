import { cleanJsonSchemaFor } from "@/llm/output/_utils/cleanJsonSchemaFor";
import { normalizeFunctionCall } from "@/llm/output/_util";
import {
  CallableExecutorCore,
  GenericFunctionCall,
} from "@/interfaces/functions";

// Handle options.jsonSchema
export function jsonSchemaSanitize(
  jsonSchema: Record<string, any> | undefined | null | false,
  input: Record<string, any>
):
  | {
      type: "json_schema";
      json_schema: { name: string; strict: boolean; schema: any };
    }
  | undefined {
  if (!jsonSchema) return undefined;

  const strict = input._options?.functionCallStrictInput || false;

  return {
    type: "json_schema",
    json_schema: {
      name: "output",
      strict,
      schema: cleanJsonSchemaFor(jsonSchema, "openai.chat"),
    },
  };
}

// Handle options.functionCall
export function functionCallSanitize(
  functionCall: GenericFunctionCall | undefined | null,
  _input: Record<string, any>,
  _output: Record<string, any>
): GenericFunctionCall | "required" | undefined {
  if (!functionCall) return undefined;

  if (functionCall === "none") {
    return "none";
  }

  return normalizeFunctionCall(functionCall, "openai");
}

// Handle options.functions
export function functionsSanitize(
  functions: CallableExecutorCore[] | undefined | null,
  input: Record<string, any>,
  _output: Record<string, any>
):
  | Array<{
      type: "function";
      function: {
        name: string;
        description: string;
        parameters: any;
        strict: boolean;
      };
    }>
  | undefined {
  if (!functions?.length) return undefined;

  // Check if functionCall is "none" - if so, don't include functions
  if (input._options?.functionCall === "none") return undefined;

  const strict = input._options?.functionCallStrictInput || false;

  return functions.map((f) => ({
    type: "function",
    function: {
      name: f.name,
      description: f.description,
      parameters: cleanJsonSchemaFor(f.parameters, "openai.chat"),
      strict,
    },
  }));
}
