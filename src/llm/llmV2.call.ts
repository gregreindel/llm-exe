import { getOutputParser } from "@/llm/output";
import { apiRequest } from "@/utils/modules/request";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { getLlmConfig } from "@/llm/config";
import { mapBody } from "@/llm/_utils.mapBody";
import { parseHeaders } from "@/llm/_utils.parseHeaders";

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

  const body = JSON.stringify(
    mapBody(
      config.mapBody,
      Object.assign(
        {
          prompt: messages,
        },
        state
      )
    )
  );

  const url = replaceTemplateStringSimple(config.endpoint, state);

  const headers = await parseHeaders(config, state, {
    url,
    headers: {},
    body: body,
  });

  const request = await apiRequest(url, {
    method: config.method,
    body: body,
    headers: headers,
  });

  console.log("Response", request);
  return getOutputParser(config.provider, request);
}

