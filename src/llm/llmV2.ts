import { getLlmConfig } from "@/llm/config";
import { stateFromOptions } from "@/llm/_utils.stateFromOptions";
import { createLlmV3_call } from "@/llm/llmV2.call";

import {
  IChatMessages,
  BaseLlm,
  OpenAiLlmExecutorOptions,
  All,
  LlmProvidorKey,
} from "@/types";

export function useLlm<T extends LlmProvidorKey>(
  providor: T,
  options: All["openai.chat"]["input"]
): BaseLlm {
  const config = getLlmConfig(providor);

  const state = stateFromOptions(options, config);

  const metrics: any = {
    total_calls: 0,
    total_call_success: 0,
    total_call_retry: 0,
    total_call_error: 0,
    history: [],
  };

  /**
   * The maximum time (in milliseconds) to wait for a response before timing out.
   */
  const timeout: number = options.timeout || 30000;

  /**
   * The maximum delay (in milliseconds) between retries.
   */
  const maxDelay: number = options.maxDelay || 5000;

  /**
   * The maximum number of retries before giving up.
   */
  const numOfAttempts: number = options.numOfAttempts || 5;

  /**
   * The jitter strategy to use between retries. Options are "none" or "full".
   */
  const jitter: "none" | "full" = options.jitter || "none";

  let traceId: null | string = options?.traceId || null;

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
    } = state as any;
    return Object.assign(
      {
        traceId: getTraceId(),
        timeout: timeout,
        jitter: jitter,
        maxDelay: maxDelay,
        numOfAttempts: numOfAttempts,
        metrics: { ...metrics },
      },
      rest
    );
  }

  function getTraceId() {
    return traceId;
  }

  function withTraceId(traceId: string) {
    traceId = traceId;
  }

  return {
    call,
    getTraceId,
    withTraceId,
    getMetadata,
  };
}
