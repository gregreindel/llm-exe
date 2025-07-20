import { getOutputParser } from "@/llm/output";
import { apiRequest } from "@/utils/modules/request";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getLlmConfig } from "@/llm/config";
import { mapBody } from "@/llm/_utils.mapBody";
import { parseHeaders } from "@/llm/_utils.parseHeaders";

import {
  GenericFunctionCall,
  GenericLLm,
  IChatMessages,
  LlmProvider,
  LlmProviderKey,
  LlmExecutorWithFunctionsOptions,
} from "@/types";

export async function useLlm_call(
  state: GenericLLm & { provider: LlmProvider; key: LlmProviderKey },
  messages: string | IChatMessages,
  _options?: LlmExecutorWithFunctionsOptions<GenericFunctionCall>
) {
  const config = getLlmConfig(state.key);

  // Build input with options nested under _options for sanitizers
  const input = mapBody(
    config.mapBody,
    Object.assign({}, state, {
      prompt: messages,
      // Pass options with underscore prefix for sanitizers to handle
      _options,
    })
  );

  const body = JSON.stringify(input);

  const url = replaceTemplateStringSimple(config.endpoint, state);

  const headers = await parseHeaders(config, state, {
    url,
    headers: {},
    body: body,
  });

  const response =
    config.provider === "openai.chat-mock"
      ? {
          id: "0123-45-6789",
          model: "model",
          created: new Date().getTime(),
          usage: { completion_tokens: 0, prompt_tokens: 0, total_tokens: 0 },
          choices: [
            {
              message: {
                role: "assistant",
                content: `Hello world from LLM! The input was ${JSON.stringify(
                  messages
                )}`,
              },
            },
          ],
        }
      : await apiRequest(url, {
          method: config.method,
          body: body,
          headers: headers,
        });

  return getOutputParser(state, response);
}
