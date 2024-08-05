import { AmazonTitanEmbedding } from "@/embedding/output/AmazonTitan";
import { OpenAiEmbedding } from "@/embedding/output/OpenAiEmbedding";
import { EmbeddingProviderKey } from "@/types";

export function getEmbeddingOutputParser(
  config: {
    model?: string;
    key: EmbeddingProviderKey;
  },
  response: any
) {
  switch (config.key) {
    case "openai.embedding.v1":
      return OpenAiEmbedding(response, config);
    case "amazon.embedding.v1":
      return AmazonTitanEmbedding(response, config);
    default:
      throw new Error("Unsupported provider");
  }
}
