import { IChatMessages } from "./chat";
export { FromSchema, JSONSchema } from "json-schema-to-ts";
export * from "./utils";
export * from "./chat";
export * from "./openai";
export * from "./functions";
export * from "./prompt";
export * from "./parser";
export * from "./llm";

export interface Config {
  provider: string;
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
      sanitize?: (i: any) => any;
    };
  };
  headers: string;
  prompt?: (messages: IChatMessages) => any;
}


export type LlmProvidorParent = "amazon";
export type LlmProvidor =
  | "openai"
  | "openai.mock"
  | "amazon.meta.v3"
  // | "amazon.anthropic.v2"
  | "amazon.anthropic.v3"
  | "anthropic";