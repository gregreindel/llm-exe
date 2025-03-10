import { OpenAiEmbeddingApiResponseOutput } from "@/types";
import { deepClone } from "@/utils/modules/deepClone";
import { BaseEmbeddingOutput } from "@/embedding/output/BaseEmbeddingOutput";

export function OpenAiEmbedding(
  result: OpenAiEmbeddingApiResponseOutput,
  config: { model?: string }
) {
  const __result = deepClone(result);
  const model = __result.model || config.model || "openai.unknown";
  const created = new Date().getTime();

  const results = result?.data || [];
  const embedding = results.map((a) => a.embedding);

  const usage = {
    output_tokens: 0,
    input_tokens: result?.usage?.prompt_tokens,
    total_tokens: result?.usage?.total_tokens,
  };

  return BaseEmbeddingOutput({
    model,
    created,
    usage,
    embedding,
  });
}
