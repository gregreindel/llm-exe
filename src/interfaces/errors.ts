export type ErrorContextMap = {
  unknown: unknown;
  llm: { provider: string; model: string; error: string };
  prompt: { prompt: any; provider?: string; model?: string; error: string };
  parser: { parser: string; output: any; error: string };
  "parser.parse_failed": {
    operation: string;
    parser: string;
    reason:
      | "empty_input"
      | "invalid_input_type"
      | "unrecognized_boolean"
      | "invalid_attributes"
      | "template_replacement_failed"
      | "malformed_code_block"
      | "no_code_block"
      | "multiple_code_blocks"
      | "no_numeric_value"
      | "ambiguous_number"
      | "invalid_number"
      | "no_enum_values"
      | "no_enum_match"
      | "ambiguous_enum_match"
      | "mixed_list_markers"
      | "not_list_like"
      | "malformed_line"
      | "empty_key"
      | "duplicate_key"
      | "invalid_json"
      | "invalid_json_root_type";
    expected?: unknown;
    inputExcerpt?: string;
    inputExcerptTruncated?: boolean;
    inputLength?: number;
    matchCount?: number;
    match?: "word" | "whole" | "substring" | "extract";
    received?: unknown;
  };
  "parser.schema_validation_failed": {
    operation: string;
    parser: string;
    reason: "schema_validation_failed";
    schemaErrors: string[];
    inputLength?: number;
  };
  state: { module: string; error: string };
};

export type ErrorCodes = keyof ErrorContextMap;
