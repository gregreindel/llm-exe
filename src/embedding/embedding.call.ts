import { apiRequest } from "@/utils/modules/request";
import { replaceTemplateStringSimple } from "@/utils/modules/replaceTemplateStringSimple";
import { mapBody } from "@/llm/_utils.mapBody";
import { parseHeaders } from "@/llm/_utils.parseHeaders";

import {
  GenericLLm,
  LlmProvidor,
  EmbeddingProvidorKey,
  OpenAiLlmExecutorOptions,
} from "@/types";
import { getEmbeddingConfig } from "./config";
import { getEmbeddingOutputParser } from "./output";

export async function createEmbedding_call(
  state: GenericLLm & {
    providor: Extract<LlmProvidor, "openai.embedding">;
    key: EmbeddingProvidorKey;
  },
  _input: string | string[],
  _options?: OpenAiLlmExecutorOptions
) {
  const config = getEmbeddingConfig(state.key);

  const input = mapBody(
    config.mapBody,
    Object.assign({}, state, {
      input: _input,
    })
  );

  const body = JSON.stringify(input);

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

  return getEmbeddingOutputParser(config.key, request);
}
