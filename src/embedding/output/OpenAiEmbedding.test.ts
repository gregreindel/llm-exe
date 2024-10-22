import { BaseEmbeddingOutput } from "@/embedding/output/BaseEmbeddingOutput";
import { OpenAiEmbedding } from "@/embedding/output/OpenAiEmbedding";
import { OpenAiEmbeddingApiResponseOutput } from "@/types";
import { deepClone } from "@/utils/modules/deepClone";

jest.mock("@/utils/modules/deepClone", () => ({
  deepClone: jest.fn(),
}));

jest.mock("@/embedding/output/BaseEmbeddingOutput", () => ({
  BaseEmbeddingOutput: jest.fn(),
}));

describe("OpenAiEmbedding", () => {
  const mockDeepClone = deepClone as jest.Mock;
  const mockBaseEmbeddingOutput = BaseEmbeddingOutput as jest.Mock;

  const sampleResult: OpenAiEmbeddingApiResponseOutput = {
    model: "text-similarity-ada-001",
    object:"",
    data: [
      { object:"", index: 0, embedding: [0.1, 0.2, 0.3] },
      { object:"", index: 0, embedding: [0.4, 0.5, 0.6] },
    ],
    usage: {
      prompt_tokens: 5,
      total_tokens: 10,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDeepClone.mockImplementation(obj => JSON.parse(JSON.stringify(obj)));
  });

  it("should return embeddings and usage", () => {
    const config = { model: "text-similarity-curie-001" };

    OpenAiEmbedding(sampleResult, config);

    expect(mockDeepClone).toHaveBeenCalledWith(sampleResult);
    expect(mockBaseEmbeddingOutput).toHaveBeenCalledWith({
      model: "text-similarity-ada-001",
      created: expect.any(Number),
      usage: {
        output_tokens: 0,
        input_tokens: 5,
        total_tokens: 10,
      },
      embedding: [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ],
    });
  });

  it("should fallback to config model if result model is undefined", () => {
    const resultWithoutModel = {
      ...sampleResult,
      model: undefined,
    };
    const config = { model: "text-similarity-curie-001" };
    
    OpenAiEmbedding(resultWithoutModel as any, config);

    expect(mockDeepClone).toHaveBeenCalledWith(resultWithoutModel);
    expect(mockBaseEmbeddingOutput).toHaveBeenCalledWith({
      model: "text-similarity-curie-001",
      created: expect.any(Number),
      usage: {
        output_tokens: 0,
        input_tokens: 5,
        total_tokens: 10,
      },
      embedding: [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ],
    });
  });

  it("should fallback to 'openai.unknown' if both result and config models are undefined", () => {
    const resultWithoutModel = {
      ...sampleResult,
      model: undefined,
    };
    const config = { model: undefined };
    
    OpenAiEmbedding(resultWithoutModel as any, config);

    expect(mockDeepClone).toHaveBeenCalledWith(resultWithoutModel);
    expect(mockBaseEmbeddingOutput).toHaveBeenCalledWith({
      model: "openai.unknown",
      created: expect.any(Number),
      usage: {
        output_tokens: 0,
        input_tokens: 5,
        total_tokens: 10,
      },
      embedding: [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ],
    });
  });

  it("should handle result without data gracefully", () => {
    const resultWithoutData = {
      ...sampleResult,
      data: undefined,
    };
    const config = { model: "text-similarity-curie-001" };
    
    OpenAiEmbedding(resultWithoutData as any, config);

    expect(mockDeepClone).toHaveBeenCalledWith(resultWithoutData);
    expect(mockBaseEmbeddingOutput).toHaveBeenCalledWith({
      model: "text-similarity-ada-001",
      created: expect.any(Number),
      usage: {
        output_tokens: 0,
        input_tokens: 5,
        total_tokens: 10,
      },
      embedding: [],
    });
  });

  it("should handle result without usage gracefully", () => {
    const resultWithoutUsage = {
      ...sampleResult,
      usage: undefined,
    };
    const config = { model: "text-similarity-curie-001" };
    
    OpenAiEmbedding(resultWithoutUsage as any, config);

    expect(mockDeepClone).toHaveBeenCalledWith(resultWithoutUsage);
    expect(mockBaseEmbeddingOutput).toHaveBeenCalledWith({
      model: "text-similarity-ada-001",
      created: expect.any(Number),
      usage: {
        output_tokens: 0,
        input_tokens: undefined,
        total_tokens: undefined,
      },
      embedding: [
        [0.1, 0.2, 0.3],
        [0.4, 0.5, 0.6],
      ],
    });
  });
});