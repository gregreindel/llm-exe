import { getEnvironmentVariable, replaceTemplateString } from "@/utils";
import { IChatMessages, Config, LlmProvidor } from "@/types";

export const configs: {
    [key in string]: Config;
  } = {
    openai: {
      provider: "openai",
      endpoint: `https://api.openai.com/v1/chat/completions`,
      options: {
        prompt: {},
        topP: {},
        useJson: {},
        openAiApiKey: {},
      },
      method: "POST",
      headers: `{"Authorization":"Bearer {{openAiApiKey}}", "Content-Type": "application/json" }`,
      mapBody: {
        prompt: {
          key: "messages",
        },
        model: {
          key: "model",
        },
        topP: {
          key: "top_p",
        },
        useJson: {
          key: "response_format.type",
          sanitize: (v) => v ? "json_object" : "text"
        }

      },
    },
    anthropic: {
      provider: "anthropic",
      endpoint: `https://api.anthropic.com/v1/messages`,
      headers: `{"x-api-key":"{{anthropicApiKey}}", "Content-Type": "application/json", "anthropic-version": "2023-06-01" }`,
      method: "POST",
      options: {
        prompt: {},
        maxTokens: {
          required: [true, "maxTokens required"]
        },
        anthropicApiKey: {},
      },
      mapBody: {
        model: {
          key: "model",
        },
        maxTokens: {
          key: "max_tokens",
        },
        prompt: {
          key: "messages",
        },
      },
    },
    "amazon.anthropic.v3": {
      provider: "amazon.anthropic.v3",
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
          default: "bedrock-2023-05-31",
        },
      },
    },
    "amazon.meta.v3": {
      provider: "amazon.meta.v3",
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
          sanitize: (messages: IChatMessages) =>
            replaceTemplateString(`{{>DialogueHistory key='messages'}}`, {
              messages,
            }),
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
    },
  };

export function getLlmConfig(providor: LlmProvidor) {
    const pick = configs[providor];
    if (pick) {
      return pick;
    }
    throw new Error("Invalid providor");
  }
  