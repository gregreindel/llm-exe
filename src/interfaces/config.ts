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
      key: string;
      default?: any;
      sanitize?: (
        i: any,
        arg: Record<string, any>,
        arg2: Record<string, any>
      ) => any;
    };
  };
  headers: string;

  transformResponse: (result: any, _config?: Config<any>) => OutputResult;
}
