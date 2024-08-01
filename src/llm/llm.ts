import { getLlmConfig } from "@/llm/config";
import { useLlm_call } from "@/llm/llm.call";
import { apiRequestWrapper } from "@/utils/modules/requestWrapper";
import { LlmProviderKey, AllLlm, } from "@/types";

export function useLlm<T extends LlmProviderKey>(
  provider:  T,
  options: AllLlm[T]["input"]
) {
  const config = getLlmConfig(provider);
  return apiRequestWrapper(config, options, useLlm_call)
}
 