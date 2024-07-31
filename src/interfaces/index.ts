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
  key: LlmProvidorKey;
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
      sanitize?: (i: any) => any;
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
  | "amazon:meta.chat";

export type LlmProvidorKey = `${LlmProvidor}.${string}`

// export type LlmProvidor =
//   | "openai"
//   | "openai.mock"
//   | "amazon.meta.v3"
//   // | "amazon.anthropic.v2"
//   | "amazon.anthropic.v3"
//   | "anthropic";
