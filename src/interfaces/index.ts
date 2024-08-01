import { IChatMessages } from "./chat";
import { LlmProviderKey } from "./llm";
export { FromSchema, JSONSchema } from "json-schema-to-ts";
export * from "./utils";
export * from "./chat";
export * from "./openai";
export * from "./functions";
export * from "./prompt";
export * from "./parser";
export * from "./llm";

export interface Config<Pk = LlmProviderKey> {
  key: Pk;
  provider: LlmProvider;
  method: string;
  endpoint: string;
  options: {
    [key in string]: {
      default?: number | string;
      required?: [boolean, string] | [boolean];
    };
  };
  mapBody: {
    [key in string]: {
      key: string;
      default?: number | string;
      sanitize?: (
        i: any,
        arg: Record<string, any>,
        arg2: Record<string, any>
      ) => any;
    };
  };
  headers: string;
  prompt?: (messages: IChatMessages) => any;
}

export type LlmProvider =
  | "openai.chat"
  | "openai.embedding"
  | "openai.chat-mock"
  | "anthropic.chat"
  | "amazon:anthropic.chat"
  | "amazon:meta.chat"
  | "amazon.embedding";
