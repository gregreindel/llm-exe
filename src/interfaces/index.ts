import { IChatMessages } from "./chat";
import { LlmProvidorKey } from "./llm";
export { FromSchema, JSONSchema } from "json-schema-to-ts";
export * from "./utils";
export * from "./chat";
export * from "./openai";
export * from "./functions";
export * from "./prompt";
export * from "./parser";
export * from "./llm";

export interface Config<Pk = LlmProvidorKey> {
  key: Pk;
  provider: LlmProvidor;
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
      sanitize?: (i: any, arg: Record<string, any>, arg2: Record<string, any>) => any;
    };
  };
  headers: string;
  prompt?: (messages: IChatMessages) => any;
}

// export type LlmProvidorParent = "amazon";
// export type LlmProvidorVendors = "openai" | "meta" | "anthropic";
// export type LlmProvidorType = "messages" | "embedding";

// export type BedrockOffering = `${Extract<
//   LlmProvidorParent,
//   "amazon"
// >}.${Extract<LlmProvidorVendors, "anthropic" | "meta">}`;

// export type LlmProvidor2 =
//   | BedrockOffering
//   | `${LlmProvidorVendors}`
//   | `${LlmProvidorVendors}.${LlmProvidorType}`
//   | `${LlmProvidorVendors}.${LlmProvidorType}.mock`;

// 3;
export type LlmProvidor =
  | "openai.chat"
  | "openai.embedding"
  | "openai.chat-mock"
  | "anthropic.chat"
  | "amazon:anthropic.chat"
  | "amazon:meta.chat"
  | "amazon.embedding"

// export type LlmProvidorKey = `${LlmProvidor}.v1`
// export type LlmProvidorKey =
//   | "openai.chat.v1"
//   | "openai.embedding.v1"
//   | "openai.chat-mock.v1"
//   | "anthropic.chat.v1"
//   | "amazon:anthropic.chat.v1"
//   | "amazon:meta.chat.v1";


// export type LlmProvidor =
//   | "openai"
//   | "openai.mock"
//   | "amazon.meta.v3"
//   // | "amazon.anthropic.v2"
//   | "amazon.anthropic.v3"
//   | "anthropic";
