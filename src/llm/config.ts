import { getEnvironmentVariable, replaceTemplateString } from "@/utils";
import { IChatMessages, Config, LlmProvidorKey } from "@/types";

export function anthropicPromptSanitize(
  _messages: string | IChatMessages,
  _inputBodyObj: Record<string, any>,
  _outputObj: Record<string, any>
) {
  if (typeof _messages === "string") {
    return [{ role: "user", content: _messages }];
  }

  const [first, ...messages] = [..._messages.map((a) => ({ ...a }))];
  // if its simple - like one system message in messages,
  // but no system message passed in, then just add the system
  if (first.role === "system") {
    _outputObj.system = first.content;
    return messages;
  }
  // otherwise, don't make assumptions?
  return [first, ...messages];
}

const ANTORPIC_VERSION = "2023-06-01";
const ANTORPIC_BEDROCK_VERSION = "bedrock-2023-05-31";

export const configs: {
  [key in LlmProvidorKey]: Config;
} = {
  "openai.chat.v1": {
    key: "openai.chat.v1",
    provider: "openai.chat",
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
        sanitize: (v) => {
          if (typeof v === "string") {
            return [{ role: "user", content: v }];
          }
          return v;
        },
      },
      model: {
        key: "model",
      },
      topP: {
        key: "top_p",
      },
      useJson: {
        key: "response_format.type",
        sanitize: (v) => (v ? "json_object" : "text"),
      },
    },
  },
  "openai.chat-mock.v1": {
    key: "openai.chat-mock.v1",
    provider: "openai.chat-mock",
    endpoint: `http://localhost`,
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
        sanitize: (v) => (v ? "json_object" : "text"),
      },
    },
  },
  "anthropic.chat.v1": {
    key: "anthropic.chat.v1",
    provider: "anthropic.chat",
    endpoint: `https://api.anthropic.com/v1/messages`,
    headers: `{"x-api-key":"{{anthropicApiKey}}", "Content-Type": "application/json", "anthropic-version": "${ANTORPIC_VERSION}" }`,
    method: "POST",
    options: {
      prompt: {},
      system: {},
      maxTokens: {
        required: [true, "maxTokens required"],
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
      system: {
        key: "system",
      },
      prompt: {
        key: "messages",
        sanitize: anthropicPromptSanitize,
      },
    },
  },
  "amazon:anthropic.chat.v1": {
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
  },
  "amazon:meta.chat.v1": {
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
        sanitize: (messages) => {
          if (typeof messages === "string") {
            return messages;
          } else {
            return replaceTemplateString(
              `{{>DialogueHistory key='messages'}}`,
              {
                messages,
              }
            );
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
  },
};

export function getLlmConfig(providor: LlmProvidorKey) {
  const pick = configs[providor];
  if (pick) {
    return pick;
  }
  throw new Error("Invalid providor");
}
