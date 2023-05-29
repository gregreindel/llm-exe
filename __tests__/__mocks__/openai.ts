import { uuid } from "@/utils";
import { CreateChatCompletionRequest } from "openai";

const chatResponses: any = {
  "openAiBasicTest": "Hello!!!!!!!",
};

exports.Configuration = function () {
  return {
    apiKey: "",
    organization: "",
    username: "",
    password: "",
    accessToken: "",
    basePath: "",
    baseOptions: { headers: {} },
    formDataCtor: "",
    Configuration: {},
    isJsonMime() {
      return true;
    },
  };
};

exports.OpenAIApi = function () {
  return {
    createCompletion: async (
      _createChatCompletionRequest: CreateChatCompletionRequest,
      _options?: any
    ) => ({
      data: {
        id: `mock-chat-${uuid()}`,
        object: "completion",
        created: new Date().getTime(),
        model: _createChatCompletionRequest?.model || "mock-model",
        usage: {
            prompt_tokens: 417,
            completion_tokens: 3,
            total_tokens: 420,
        },
        choices: [
          {
            message: {
              role: "assistant",
              content: "Hello world!",
            },
            finish_reason: "stop",
            index: 0,
          },
        ],
      },
    }),
    createChatCompletion: async (
      _createChatCompletionRequest: CreateChatCompletionRequest,
      _options?: any
    ) => {
      const response: any = {
        data: {
          id: `mock-completion-${uuid()}`,
          object: "chat.completion",
          created: new Date().getTime(),
          model: _createChatCompletionRequest?.model || "mock-model",
          usage: {
            prompt_tokens: 417,
            completion_tokens: 3,
            total_tokens: 420,
          },
          choices: [],
        },
      };

      const [mostRecentMessage] = [
        ..._createChatCompletionRequest.messages,
      ].reverse();
      // __mock__:key_that_maps_to_response:Hello!
      if (mostRecentMessage.content.substring(0, 9) === "__mock__:") {
        const [_mock, key, _message] = mostRecentMessage.content.split(":");
        if (chatResponses[key]) {
          response.data.choices.push({
            text: chatResponses[key],
            index: 0,
            logprobs: null,
            finish_reason: "stop",
          });
        }
      }

      if (!response.data.choices.length) {
        response.data.choices.push({
          text: "Hello world! Default message from OpenAI chat",
          index: 0,
          logprobs: null,
          finish_reason: "stop",
        });
      }

      return response
    },
  };
};
