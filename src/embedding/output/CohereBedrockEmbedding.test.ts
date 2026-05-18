import { CohereBedrockEmbedding } from "@/embedding/output/CohereBedrockEmbedding";
import { BaseEmbeddingOutput } from "@/embedding/output/BaseEmbeddingOutput";
import { CohereBedrockEmbeddingApiResponseOutput } from "@/types";
import { deepClone } from "@/utils/modules/deepClone";

jest.mock("@/utils/modules/deepClone", () => ({
  deepClone: jest.fn(),
}));

jest.mock("@/embedding/output/BaseEmbeddingOutput", () => ({
  BaseEmbeddingOutput: jest.fn(),
}));

describe("CohereBedrockEmbedding", () => {
  const deepCloneMock = deepClone as jest.Mock;
  const BaseEmbeddingOutputMock = BaseEmbeddingOutput as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses provided model and passes embeddings through", () => {
    const mockResult: CohereBedrockEmbeddingApiResponseOutput = {
      id: "abc-123",
      response_type: "embeddings_floats",
      embeddings: [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ],
      texts: ["hello", "world"],
    };

    const mockConfig = { model: "cohere.embed-english-v3" };

    deepCloneMock.mockReturnValueOnce(mockResult);

    CohereBedrockEmbedding(mockResult, mockConfig);

    expect(deepCloneMock).toHaveBeenCalledWith(mockResult);
    expect(BaseEmbeddingOutputMock).toHaveBeenCalledWith({
      id: "abc-123",
      model: "cohere.embed-english-v3",
      created: expect.any(Number),
      usage: {
        output_tokens: 0,
        input_tokens: 0,
        total_tokens: 0,
      },
      embedding: [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ],
    });
  });

  it("falls back to 'cohere.unknown' when no model is provided", () => {
    const mockResult: CohereBedrockEmbeddingApiResponseOutput = {
      embeddings: [[0.7, 0.8]],
    };

    deepCloneMock.mockReturnValueOnce(mockResult);

    CohereBedrockEmbedding(mockResult, {});

    expect(BaseEmbeddingOutputMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "cohere.unknown",
        embedding: [[0.7, 0.8]],
      })
    );
  });

  it("defaults to an empty embedding array when response has no embeddings", () => {
    const mockResult = {} as CohereBedrockEmbeddingApiResponseOutput;

    deepCloneMock.mockReturnValueOnce(mockResult);

    CohereBedrockEmbedding(mockResult, { model: "cohere.embed-v4:0" });

    expect(BaseEmbeddingOutputMock).toHaveBeenCalledWith(
      expect.objectContaining({
        model: "cohere.embed-v4:0",
        embedding: [],
      })
    );
  });
});
