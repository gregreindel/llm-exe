import { getEmbeddingOutputParser } from "@/embedding/output/getEmbeddingOutputParser";
import { AmazonTitanEmbedding } from "@/embedding/output/AmazonTitan";
import { OpenAiEmbedding } from "@/embedding/output/OpenAiEmbedding";
import { EmbeddingProviderKey } from "@/types";

jest.mock("@/embedding/output/AmazonTitan", () => ({
  AmazonTitanEmbedding: jest.fn(),
}));

jest.mock("@/embedding/output/OpenAiEmbedding", () => ({
  OpenAiEmbedding: jest.fn(),
}));

describe("getEmbeddingOutputParser", () => {
  const AmazonTitanEmbeddingMock = AmazonTitanEmbedding as jest.Mock;
  const OpenAiEmbeddingMock = OpenAiEmbedding as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call OpenAiEmbedding when key is 'openai.embedding.v1'", () => {
    const config = {
      model: "some-model",
      key: "openai.embedding.v1" as EmbeddingProviderKey,
    };
    const response = { some: "response" };

    getEmbeddingOutputParser(config, response);

    expect(OpenAiEmbeddingMock).toHaveBeenCalledWith(response, config);
    expect(AmazonTitanEmbeddingMock).not.toHaveBeenCalled();
  });

  it("should call AmazonTitanEmbedding when key is 'amazon.embedding.v1'", () => {
    const config = {
      model: "another-model",
      key: "amazon.embedding.v1" as EmbeddingProviderKey,
    };
    const response = { some: "response" };

    getEmbeddingOutputParser(config, response);

    expect(AmazonTitanEmbeddingMock).toHaveBeenCalledWith(response, config);
    expect(OpenAiEmbeddingMock).not.toHaveBeenCalled();
  });

  it("should throw an error when key is unsupported", () => {
    const config = {
      model: "invalid-model",
      key: "unsupported.key" as EmbeddingProviderKey,
    };
    const response = { some: "response" };

    expect(() => getEmbeddingOutputParser(config, response)).toThrow(
      "Unsupported provider"
    );

    expect(OpenAiEmbeddingMock).not.toHaveBeenCalled();
    expect(AmazonTitanEmbeddingMock).not.toHaveBeenCalled();
  });
});
