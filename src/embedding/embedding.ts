import { AllEmbedding, EmbeddingProvidorKey } from "@/types";
import { getEmbeddingConfig } from "./config";
import { createEmbedding_call } from "./embedding.call";
import { apiRequestWrapper } from "@/utils/modules/requestWrapper";

export function createEmbedding<T extends EmbeddingProvidorKey>(
  providor: T,
  options: AllEmbedding[T]["input"]
) {
  const config = getEmbeddingConfig(providor);
  return apiRequestWrapper(config, options, createEmbedding_call)
}