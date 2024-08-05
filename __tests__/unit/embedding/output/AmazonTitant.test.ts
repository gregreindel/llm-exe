import { AmazonTitanEmbedding } from "@/embedding/output/AmazonTitan";
import { BaseEmbeddingOutput } from "@/embedding/output/BaseEmbeddingOutput";
import { AmazonTitanEmbeddingApiResponseOutput } from "@/types";
import { deepClone } from "@/utils/modules/deepClone";

jest.mock("@/utils/modules/deepClone", () => ({
  deepClone: jest.fn(),
}));
 
jest.mock("@/embedding/output/BaseEmbeddingOutput", () => ({
  BaseEmbeddingOutput: jest.fn(),
}));

describe("AmazonTitanEmbedding", () => {
  const deepCloneMock = deepClone as jest.Mock;
  const BaseEmbeddingOutputMock = BaseEmbeddingOutput as jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should use provided model in config", () => {
    const mockResult: AmazonTitanEmbeddingApiResponseOutput = {
      embedding: [0.1, 0.2, 0.3],
      inputTextTokenCount: 100,
    };
    
    const mockConfig = { model: "amazon.custom-model" };
    
    deepCloneMock.mockReturnValueOnce(mockResult);

    const expectedOutput = {
      model: "amazon.custom-model",
      created: expect.any(Number),
      usage: {
        output_tokens: 0,
        input_tokens: 100,
        total_tokens: 100,
      },
      embedding: [[0.1, 0.2, 0.3]],
    };

    AmazonTitanEmbedding(mockResult, mockConfig);

    expect(deepCloneMock).toHaveBeenCalledWith(mockResult);
    expect(BaseEmbeddingOutputMock).toHaveBeenCalledWith(expectedOutput);
  });

  it("should use the default model 'amazon.unknown' when model is not provided in config", () => {
    const mockResult: AmazonTitanEmbeddingApiResponseOutput = {
      embedding: [0.1, 0.2, 0.3],
      inputTextTokenCount: 100,
    };

    const mockConfig = {};
    
    deepCloneMock.mockReturnValueOnce(mockResult);

    const expectedOutput = {
      model: "amazon.unknown",
      created: expect.any(Number),
      usage: {
        output_tokens: 0,
        input_tokens: 100,
        total_tokens: 100,
      },
      embedding: [[0.1, 0.2, 0.3]],
    };

    AmazonTitanEmbedding(mockResult, mockConfig);

    expect(deepCloneMock).toHaveBeenCalledWith(mockResult);
    expect(BaseEmbeddingOutputMock).toHaveBeenCalledWith(expectedOutput);
  });

  it("should correctly calculate the usage tokens", () => {
    const mockResult: AmazonTitanEmbeddingApiResponseOutput = {
      embedding: [0.4, 0.5, 0.6],
      inputTextTokenCount: 200,
    };

    const mockConfig = { model: "amazon.another-model" };
    
    deepCloneMock.mockReturnValueOnce(mockResult);

    const expectedOutput = {
      model: "amazon.another-model",
      created: expect.any(Number),
      usage: {
        output_tokens: 0,
        input_tokens: 200,
        total_tokens: 200,
      },
      embedding: [[0.4, 0.5, 0.6]],
    };

    AmazonTitanEmbedding(mockResult, mockConfig);

    expect(deepCloneMock).toHaveBeenCalledWith(mockResult);
    expect(BaseEmbeddingOutputMock).toHaveBeenCalledWith(expectedOutput);
  });
});