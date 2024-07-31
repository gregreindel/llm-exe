import { getLlmConfig } from "@/llm/config";
import { useLlm_call } from "@/llm/llm.call";
import { apiRequestWrapper } from "@/utils/modules/requestWrapper";
import { LlmProvidorKey, AllLlm, } from "@/types";

export function useLlm<T extends LlmProvidorKey>(
  providor:  T,
  options: AllLlm[T]["input"]
) {
  const config = getLlmConfig(providor);
  return apiRequestWrapper(config, options, useLlm_call)
}
 