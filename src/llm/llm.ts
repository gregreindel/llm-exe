import { configs, getLlmConfig } from "@/llm/config";
import { useLlm_call } from "@/llm/llm.call";
import { apiRequestWrapper } from "@/utils/modules/requestWrapper";
import { AllUseLlmOptions } from "@/types";

export function useLlm<T extends keyof typeof configs>(
  provider: T,
  options: AllUseLlmOptions[T]["input"]
) {
  const config = getLlmConfig(provider);
  return apiRequestWrapper(config, options, useLlm_call);
}
