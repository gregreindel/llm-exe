import { BaseEmbeddingOutput } from "@/embedding/output/BaseEmbeddingOutput";
import { AmazonTitanEmbedding } from "@/embedding/output/AmazonTitan";
import { AmazonTitanEmbeddingApiResponseOutput } from "@/types";
import { deepClone } from "@/utils/modules/deepClone";

jest.mock("@/utils/modules/deepClone", () => ({
  deepClone: jest.fn(),
}));

jest.mock("@/embedding/output/BaseEmbeddingOutput", () => ({
  BaseEmbeddingOutput: jest.fn(),
}));

describe("AmazonTitanEmbedding", () => {
  const mockDeepClone = deepClone as jest.Mock;
  const mockBaseEmbeddingOutput = BaseEmbeddingOutput as jest.Mock;

  const sampleResult: AmazonTitanEmbeddingApiResponseOutput = {
    embedding: [0.1, 0.2, 0.3, 0.4],
    inputTextTokenCount: 7,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeepClone.mockImplementation((obj) =>
      JSON.parse(JSON.stringify(obj))
    );
  });

  it("should return embedding and usage with provided model", () => {
    const config = { model: "amazon.titan-embed-text-v1" };

    AmazonTitanEmbedding(sampleResult, config);

    expect(mockDeepClone).toHaveBeenCalledWith(sampleResult);
    expect(mockBaseEmbeddingOutput).toHaveBeenCalledWith({
      model: "amazon.titan-embed-text-v1",
      created: expect.any(Number),
      usage: {
        output_tokens: 0,
        input_tokens: 7,
        total_tokens: 7,
      },
      embedding: [[0.1, 0.2, 0.3, 0.4]],
    });
  });

  it("should fallback to 'amazon.unknown' if config model is undefined", () => {
    const config = { model: undefined };

    AmazonTitanEmbedding(sampleResult, config as any);

    expect(mockBaseEmbeddingOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "amazon.unknown",
      })
    );
  });

  it("should fallback to 'amazon.unknown' if config model is not provided", () => {
    const config = {};

    AmazonTitanEmbedding(sampleResult, config);

    expect(mockBaseEmbeddingOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "amazon.unknown",
      })
    );
  });

  it("should wrap embedding in an array", () => {
    const config = { model: "amazon.titan-embed-text-v1" };

    AmazonTitanEmbedding(sampleResult, config);

    expect(mockBaseEmbeddingOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        embedding: [[0.1, 0.2, 0.3, 0.4]],
      })
    );
  });

  it("should use inputTextTokenCount for both input_tokens and total_tokens", () => {
    const result: AmazonTitanEmbeddingApiResponseOutput = {
      embedding: [0.5],
      inputTextTokenCount: 15,
    };
    const config = { model: "amazon.titan-embed-text-v2" };

    AmazonTitanEmbedding(result, config);

    expect(mockBaseEmbeddingOutput).toHaveBeenCalledWith(
      expect.objectContaining({
        usage: {
          output_tokens: 0,
          input_tokens: 15,
          total_tokens: 15,
        },
      })
    );
  });

  it("should deep clone the result to avoid mutation", () => {
    const config = { model: "amazon.titan-embed-text-v1" };

    AmazonTitanEmbedding(sampleResult, config);

    expect(mockDeepClone).toHaveBeenCalledTimes(1);
    expect(mockDeepClone).toHaveBeenCalledWith(sampleResult);
  });
});
