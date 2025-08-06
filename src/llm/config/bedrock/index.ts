import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";
import { anthropicPromptSanitize } from "../anthropic/promptSanitize";
import { Config } from "@/types";
import { OutputAnthropicClaude3Chat } from "@/llm/output/claude";
import { OutputMetaLlama3Chat } from "@/llm/output/llama";
import { cleanJsonSchemaFor } from "@/llm/output/_utils/cleanJsonSchemaFor";
// import { amazonNovaPromptSanitize } from "./prompt.nova";

const ANTHROPIC_BEDROCK_VERSION = "bedrock-2023-05-31";

const amazonAnthropicChatV1: Config = {
  key: "amazon:anthropic.chat.v1",
  provider: "amazon:anthropic.chat",
  method: "POST",
  headers: `{"Content-Type": "application/json" }`,
  endpoint: `https://bedrock-runtime.{{awsRegion}}.amazonaws.com/model/{{model}}/invoke`,
  options: {
    prompt: {},
    topP: {},
    maxTokens: {},
    awsRegion: {
      default: getEnvironmentVariable("AWS_REGION"),
      required: [true, "aws region is required"],
    },
    awsSecretKey: {},
    awsAccessKey: {},
  },
  mapBody: {
    prompt: {
      key: "messages",
      transform: anthropicPromptSanitize,
    },
    topP: {
      key: "top_p",
    },
    maxTokens: {
      key: "max_tokens",
      default: 10000,
    },
    anthropic_version: {
      key: "anthropic_version",
      default: ANTHROPIC_BEDROCK_VERSION,
    },
  },
  mapOptions: {
    functionCall: (call, _options) => {
      // Anthropic handles "none" by clearing functions array
      if (call === "none") return { _clearFunctions: true };
      if (call === "auto" || call === "any") {
        return { tool_choice: { type: call } };
      }
      return { tool_choice: call };
    },

    functions: (functions) => ({
      tools: functions.map((f) => ({
        name: f.name,
        description: f.description,
        input_schema: cleanJsonSchemaFor(f.parameters, "anthropic.chat"),
      })),
    }),
  },
  transformResponse: OutputAnthropicClaude3Chat,
};

const amazonMetaChatV1: Config = {
  key: "amazon:meta.chat.v1",
  provider: "amazon:meta.chat",
  method: "POST",
  headers: `{"Content-Type": "application/json" }`,
  options: {
    prompt: {},
    topP: {},
    maxTokens: {},
    temperature: {},
    awsRegion: {
      default: getEnvironmentVariable("AWS_REGION"),
    },
    awsSecretKey: {},
    awsAccessKey: {},
  },
  endpoint: `https://bedrock-runtime.{{awsRegion}}.amazonaws.com/model/{{model}}/invoke`,
  mapBody: {
    prompt: {
      key: "prompt",
      transform: (messages: any) => {
        if (typeof messages === "string") {
          return messages;
        } else {
          return replaceTemplateString(`{{>DialogueHistory key='messages'}}`, {
            messages,
          });
        }
      },
    },
    topP: {
      key: "top_p",
    },
    temperature: {
      key: "temperature",
    },
    maxTokens: {
      key: "max_gen_len",
      default: 2048,
    },
  },
  transformResponse: OutputMetaLlama3Chat,
};

// const amazonAmazonNovaChatV1: Config = {
//   key: "amazon:nova.chat.v1",
//   provider: "amazon:nova.chat",
//   method: "POST",
//   headers: `{"Content-Type": "application/json" }`,
//   endpoint: `https://bedrock-runtime.{{awsRegion}}.amazonaws.com/model/{{model}}/invoke`,
//   options: {
//     prompt: {},
//     topP: {},
//     maxTokens: {},
//     awsRegion: {
//       default: getEnvironmentVariable("AWS_REGION"),
//       required: [true, "aws region is required"],
//     },
//     awsSecretKey: {},
//     awsAccessKey: {},
//   },
//   mapBody: {
//     prompt: {
//       key: "messages",
//       transform: amazonNovaPromptSanitize,
//     },
//   },
// };

export const bedrock = {
  "amazon:anthropic.chat.v1": amazonAnthropicChatV1,
  "amazon:meta.chat.v1": amazonMetaChatV1,
  // "amazon:nova.chat.v1": amazonAmazonNovaChatV1,
};
