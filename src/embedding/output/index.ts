import { AmazonTitanEmbedding } from "./AmazonTitan";
import { OpenAiEmbedding } from "./OpenAiEmbedding";
import { EmbeddingProvidorKey } from "@/types";

export function getEmbeddingOutputParser(
  config: {
    model?: string;
    key: EmbeddingProvidorKey;
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
