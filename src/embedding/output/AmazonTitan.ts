import { AmazonTitanEmbeddingApiResponseOutput } from "@/types";
import { BaseEmbeddingOutput } from "./BaseEmbeddingOutput";
import { deepClone } from "@/utils/modules/deepClone";

export function AmazonTitanEmbedding(
  result: AmazonTitanEmbeddingApiResponseOutput,
  config: { model?: string }
) {
  const __result = deepClone(result);
  const model = config.model || "amazon.unknown";
  const created = new Date().getTime();
  const embedding = [__result.embedding];

  const usage = {
    output_tokens: 0,
    input_tokens: __result.inputTextTokenCount,
    total_tokens: __result.inputTextTokenCount,
  };
  return BaseEmbeddingOutput({
    model,
    created,
    usage,
    embedding,
  });
}
