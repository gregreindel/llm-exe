import { EmbeddingOutputResult } from "@/interfaces";
import { uuid } from "@/utils";

type BaseLlmOutput2Optional = "id" | "created" | "embedding";

export function BaseEmbeddingOutput(
  result: Omit<EmbeddingOutputResult, BaseLlmOutput2Optional> &
    Partial<Pick<EmbeddingOutputResult, BaseLlmOutput2Optional>>
) {
  const __result = Object.freeze({
    id: result.id || uuid(),
    model: result.model,
    usage: result.usage,
    embedding: [...(result?.embedding || [])],
    created: result?.created || new Date().getTime(),
  });

  function getResult(): EmbeddingOutputResult {
    return {
      id: __result.id,
      model: __result.model,
      created: __result.created,
      usage: __result.usage,
      embedding: __result.embedding,
    };
  }

  function getEmbedding(index?: number): number[] {
    if (index && index > 0) {
      const arr = __result?.embedding || [];
      const val = arr[index];
      return val ? val : [];
    }
    return __result.embedding[0];
  }

  return {
    getEmbedding,
    getResult,
  };
}
