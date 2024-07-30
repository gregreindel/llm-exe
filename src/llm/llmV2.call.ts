import { getOutputParser } from "@/llm/output";
import { apiRequest } from "@/utils/modules/request";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getLlmConfig } from "@/llm/config";
import { mapBody } from "@/llm/_utils.mapBody";
import { parseHeaders } from "@/llm/_utils.parseHeaders";
import { pick } from "lodash";

import {
  GenericLLm,
  IChatMessages,
  LlmProvidor,
  OpenAiLlmExecutorOptions,
} from "@/types";

export async function createLlmV3_call(
  state: GenericLLm & { providor: LlmProvidor },
  messages: IChatMessages,
  _options?: OpenAiLlmExecutorOptions
) {
  const config = getLlmConfig(state.providor);
 
  const input = mapBody(
    config.mapBody,
    Object.assign(
      {
        prompt: messages,
      },
      state
    )
  )

  if (_options && _options?.function_call) {
    input["tool_choice"] = _options?.function_call
  }

  if (_options && _options?.functions?.length) {
    input["tools"] = _options.functions.map((f) =>
      ({
        type: "function",
        function: pick(f, ["name", "description", "parameters"])
      })
    )
  }

  const body = JSON.stringify(input)

  const url = replaceTemplateStringSimple(config.endpoint, state);

  const headers = await parseHeaders(config, state, {
    url,
    headers: {},
    body: body,
  });

  const request = config.provider === "openai.mock" ? {
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
  } : await apiRequest(url, {
    method: config.method,
    body: body,
    headers: headers,
  });

  return getOutputParser(config.provider, request);
}
