import { CohereBedrockEmbeddingApiResponseOutput } from "@/types";
import { BaseEmbeddingOutput } from "@/embedding/output/BaseEmbeddingOutput";
import { deepClone } from "@/utils/modules/deepClone";

export function CohereBedrockEmbedding(
  result: CohereBedrockEmbeddingApiResponseOutput,
  config: { model?: string }
) {
  const __result = deepClone(result);
  const model = config.model || "cohere.unknown";
  const created = new Date().getTime();
  const embedding = Array.isArray(__result.embeddings)
    ? __result.embeddings
    : [];

  // Cohere on Bedrock does not return token usage.
  const usage = {
    output_tokens: 0,
    input_tokens: 0,
    total_tokens: 0,
  };

  return BaseEmbeddingOutput({
    id: __result.id,
    model,
    created,
    usage,
    embedding,
  });
}
