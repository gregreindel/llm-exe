import { configs, getLlmConfig } from "@/llm/config";
import { useLlm_call } from "@/llm/llm.call";
import { apiRequestWrapper } from "@/utils/modules/requestWrapper";
import { AllUseLlmOptions, BaseLlm, Config } from "@/types";

export function useLlm<T extends keyof typeof configs>(
  provider: T,
  options: AllUseLlmOptions[T]["input"] = {}
): BaseLlm {
  const config = getLlmConfig(provider);
  return apiRequestWrapper(config, options, useLlm_call);
}

export function useLlmConfiguration<T extends keyof typeof configs>(
  config: Config<any>
) {
  return (options: AllUseLlmOptions[T]["input"] = {}) =>
    apiRequestWrapper(config, options, useLlm_call);
}
