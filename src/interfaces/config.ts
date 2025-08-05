import { LlmProviderKey, OutputResult } from "./llm";

export type LlmProvider =
  | "openai.chat"
  | "openai.embedding"
  | "google.embedding"
  | "openai.chat-mock"
  | "anthropic.chat"
  | "amazon:anthropic.chat"
  | "amazon:meta.chat"
  | "amazon:nova.chat"
  | "amazon.embedding"
  | "xai.chat"
  | "google.chat"
  | "ollama.chat"
  | "deepseek.chat";

export interface Config<Pk = LlmProviderKey> {
  key: Pk;
  provider: LlmProvider;
  method: string;
  endpoint: string;
  options: {
    [key in string]: {
      default?: any;
      required?: [boolean, string] | [boolean];
    };
  };
  mapBody: {
    [key in string]: {
      /**
       * The target field name in the provider's request body.
       * Supports dot notation for nested fields (e.g., "response_format.type")
       */
      key: string;

      /**
       * Default value to use if the source field is not provided
       */
      default?: any;

      /**
       * Transform function to convert the value before mapping to the request body
       * @param value - The input value from the user's state
       * @param state - The complete user state object containing all parameters
       * @param config - The current Config object (for access to options, etc.)
       * @returns The transformed value to be included in the request body
       */
      transform?: (
        value: any,
        state: Record<string, any>,
        config: Record<string, any>
      ) => any;
    };
  };
  headers: string;

  transformResponse: (result: any, _config?: Config<any>) => OutputResult;
}
