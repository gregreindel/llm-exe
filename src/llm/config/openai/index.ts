import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { promptSanitize, useJsonSanitize } from "./promptSanitize";
import {
  jsonSchemaSanitize,
  functionCallSanitize,
  functionsSanitize,
} from "./optionSanitize";

const openAiChatV1: Config = {
  key: "openai.chat.v1",
  provider: "openai.chat",
  endpoint: `https://api.openai.com/v1/chat/completions`,
  options: {
    prompt: {},
    topP: {},
    useJson: {},
    openAiApiKey: {
      default: getEnvironmentVariable("OPENAI_API_KEY"),
    },
  },
  method: "POST",
  headers: `{"Authorization":"Bearer {{openAiApiKey}}", "Content-Type": "application/json" }`,
  mapBody: {
    prompt: {
      key: "messages",
      sanitize: promptSanitize, // Reference extracted function
    },
    model: {
      key: "model",
    },
    topP: {
      key: "top_p",
    },
    useJson: {
      key: "response_format.type",
      sanitize: useJsonSanitize, // Reference extracted function
    },
    "_options.jsonSchema": {
      key: "response_format",
      sanitize: jsonSchemaSanitize,
    },
    "_options.functionCall": {
      key: "tool_choice",
      sanitize: functionCallSanitize,
    },
    "_options.functions": {
      key: "tools",
      sanitize: functionsSanitize,
    },
  },
};

const openAiChatMockV1: Config = {
  key: "openai.chat-mock.v1",
  provider: "openai.chat-mock",
  endpoint: `http://localhost`,
  options: {
    prompt: {},
    topP: {},
    useJson: {},
    openAiApiKey: {
      default: getEnvironmentVariable("OPENAI_API_KEY_MOCK"),
    },
  },
  method: "POST",
  headers: `{"Authorization":"Bearer {{openAiApiKey}}", "Content-Type": "application/json" }`,
  mapBody: {
    prompt: {
      key: "messages",
      sanitize: promptSanitize,
    },
    model: {
      key: "model",
    },
    topP: {
      key: "top_p",
    },
    useJson: {
      key: "response_format.type",
      sanitize: useJsonSanitize,
    },
    "_options.jsonSchema": {
      key: "response_format",
      sanitize: jsonSchemaSanitize,
    },
    "_options.functionCall": {
      key: "tool_choice",
      sanitize: functionCallSanitize,
    },
    "_options.functions": {
      key: "tools",
      sanitize: functionsSanitize,
    },
  },
};

export const openai = {
  "openai.chat.v1": openAiChatV1,
  "openai.chat-mock.v1": openAiChatMockV1,
  "openai.gpt-4o": withDefaultModel(openAiChatV1, "gpt-4o"),
  "openai.gpt-4o-mini": withDefaultModel(openAiChatV1, "gpt-4o-mini"),
};
