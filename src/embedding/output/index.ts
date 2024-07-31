import { AmazonTitanEmbedding } from "./AmazonTitan";
import { OpenAiEmbedding } from "./OpenAiEmbedding";
import { EmbeddingProvidorKey } from "@/types";
// | "openai.embedding"
export function getEmbeddingOutputParser(
  provider: EmbeddingProvidorKey,
  response: any
) {
  switch (provider) {
    case "openai.embedding.v1":
      return OpenAiEmbedding(response);

    case "amazon.embedding.v1":
      return AmazonTitanEmbedding(response);

    default:
      throw new Error("Unsupported provider");
  }
}
