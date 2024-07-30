// import { uuid } from "@/utils";

const chatResponses = {
  openAiBasicTest: "Hello!",
};

exports.OpenAI = function () {
  return {
    chat: {
      completions: {
        create: async (_createChatCompletionRequest, _options) => {
          const response = {
              id: `mock-completion-${Math.random()}`,
              object: "chat.completion",
              created: new Date().getTime(),
              model: _createChatCompletionRequest?.model || "mock-model",
              usage: {
                prompt_tokens: 417,
                completion_tokens: 3,
                total_tokens: 420,
              },
              choices: [],
          };
  
          const [mostRecentMessage] = [
            ..._createChatCompletionRequest.messages,
          ].reverse();
          // __mock__:key_that_maps_to_response:Hello!
          if (mostRecentMessage.content.substring(0, 9) === "__mock__:") {
            const [_mock, key, _message] = mostRecentMessage.content.split(":");
            if (chatResponses[key]) {
              response.choices.push({
                text: chatResponses[key],
                index: 0,
                logprobs: null,
                finish_reason: "stop",
              });
            }
          }
  
          if (!response.choices.length) {
            response.choices.push({
              text: "Hello world! Default message from OpenAI chat",
              index: 0,
              logprobs: null,
              finish_reason: "stop",
            });
          }
  
          return response;
        },
  
      },
    },
    completions: {
      create: async (_createChatCompletionRequest, _options) => ({
          id: `mock-chat-${Math.random()}`,
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
      }),
    },
  };
};
