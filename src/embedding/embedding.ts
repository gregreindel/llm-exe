import { AllEmbedding, EmbeddingProviderKey } from "@/types";
import { getEmbeddingConfig } from "./config";
import { createEmbedding_call } from "./embedding.call";
import { apiRequestWrapper } from "@/utils/modules/requestWrapper";

export function createEmbedding<T extends EmbeddingProviderKey>(
  provider: T,
  options: AllEmbedding[T]["input"]
) {
  const config = getEmbeddingConfig(provider);
  return apiRequestWrapper(config, options, createEmbedding_call)
}