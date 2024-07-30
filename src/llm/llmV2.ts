import { getLlmConfig } from "@/llm/config";
import { stateFromOptions } from "@/llm/_utils.stateFromOptions";

import {
  GenericLLm,
  IChatMessages,
  LlmProvidor,
  OpenAiLlmExecutorOptions,
} from "@/types";
import { createLlmV3_call } from "@/llm/llmV2.call";

export function createLlmV3(
  providor: LlmProvidor,
  options: Partial<GenericLLm>
) {
  const config = getLlmConfig(providor);

  const state = stateFromOptions(options, config);

  async function call(
    messages: IChatMessages,
    options?: OpenAiLlmExecutorOptions
  ) {
    return createLlmV3_call(state, messages, options);
  }

  function getMetadata() {
    const {
      awsSecretKey,
      awsAccessKey,
      openAiApiKey,
      anthropicApiKey,
      ...rest
    } = state;
    return Object.assign({}, rest);
  }

  function getTraceId() {
    return "this.traceId";
  }

  return {
    call,
    getTraceId,
    getMetadata,
  };
}
