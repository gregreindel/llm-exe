import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";
import { anthropicPromptSanitize } from "../anthropic/promptSanitize";
import { Config } from "@/types";
// import { amazonNovaPromptSanitize } from "./prompt.nova";

const ANTORPIC_BEDROCK_VERSION = "bedrock-2023-05-31";

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
      sanitize: anthropicPromptSanitize,
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
      default: ANTORPIC_BEDROCK_VERSION,
    },
  },
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
      sanitize: (messages: any) => {
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
//       sanitize: amazonNovaPromptSanitize,
//     },
//   },
// };

export const bedrock = {
  "amazon:anthropic.chat.v1": amazonAnthropicChatV1,
  "amazon:meta.chat.v1": amazonMetaChatV1,
  // "amazon:nova.chat.v1": amazonAmazonNovaChatV1,
};
