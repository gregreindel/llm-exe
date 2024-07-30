import { IChatMessages } from "./chat";
import { BaseLlmOptions } from "./openai";

export { FromSchema, JSONSchema } from "json-schema-to-ts";
export * from "./utils";
export * from "./chat";
export * from "./openai";
export * from "./functions";
export * from "./prompt";
export * from "./parser";
export * from "./llm";


export interface GenericLLm extends BaseLlmOptions {
  model?: string;
  prompt?: string | { role: string; content: string }[];
  temperature?: number;
  topP?: number;
  stream?: boolean;
  streamOptions?: Record<string, any>;
  maxTokens?: number;
  stopSequences?: string[];
} 

export interface OpenAiRequest extends GenericLLm {
  model: string;
  frequencyPenalty?: number;
  logitBias?: Record<string, any> | null;
  responseFormat?: Record<string, any>;
  openAiApiKey?: string;
  useJson?: boolean;
}


export interface AmazonBedrockRequest extends GenericLLm {
  model: string;
  awsRegion?: string;
  awsSecretKey?: string;
  awsAccessKey?: string;
}


export interface AnthropicRequest extends GenericLLm {
  model: string;
  anthropicApiKey?: string;
}



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