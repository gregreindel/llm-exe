import { BaseEmbeddingOutput } from "@/embedding/output/BaseEmbeddingOutput";
import { EmbeddingOutputResult } from "@/interfaces";
import { uuid } from "@/utils";

jest.mock("@/utils", () => ({
  uuid: jest.fn(),
}));

describe("BaseEmbeddingOutput", () => {
  const uuidMock = uuid as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create the result with default values when optional fields are missing", () => {
    uuidMock.mockReturnValue("generated-uuid");

    const result: Omit<EmbeddingOutputResult, "id" | "created" | "embedding"> =
      {
        model: "test-model",
        usage: {
          input_tokens: 0,
          output_tokens: 0,
          total_tokens: 0,
        },
      };

    const baseEmbeddingOutput = BaseEmbeddingOutput(result);

    const expectedResult: EmbeddingOutputResult = {
      id: "generated-uuid",
      model: "test-model",
      created: expect.any(Number),
      usage: {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
      },
      embedding: [],
    };

    expect(baseEmbeddingOutput.getResult()).toEqual(expectedResult);
  });

  it("should use provided id, created, and embedding if available", () => {
    const result: EmbeddingOutputResult = {
      id: "test-id",
      model: "test-model",
      usage: {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
      },
      embedding: [[1], [2], [3]],
      created: 1234567890,
    };

    const baseEmbeddingOutput = BaseEmbeddingOutput(result);

    expect(baseEmbeddingOutput.getResult()).toEqual(result);
  });

  it("should return the embedding at the specific index", () => {
    const result: EmbeddingOutputResult = {
      id: "test-id",
      model: "test-model",
      usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
      embedding: [[1], [2], [3], [4]],
      created: 1234567890,
    };

    const baseEmbeddingOutput = BaseEmbeddingOutput(result);

    expect(baseEmbeddingOutput.getEmbedding(2)).toEqual([3]);
    expect(baseEmbeddingOutput.getEmbedding(0)).toEqual([1]);
  });

  it("should return an empty array if the index is out of bounds", () => {
    const result: EmbeddingOutputResult = {
      id: "test-id",
      model: "test-model",
      usage: {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
      },
      embedding: [[1], [2], [3], [4]],
      created: 1234567890,
    };

    const baseEmbeddingOutput = BaseEmbeddingOutput(result);

    expect(baseEmbeddingOutput.getEmbedding(10)).toEqual([]);
  });

  it("should return the first embedding if no index is provided", () => {
    const result: EmbeddingOutputResult = {
      id: "test-id",
      model: "test-model",
      usage: {
        input_tokens: 0,
        output_tokens: 0,
        total_tokens: 0,
      },
      embedding: [[1], [2], [3], [4]],
      created: 1234567890,
    };

    const baseEmbeddingOutput = BaseEmbeddingOutput(result);

    expect(baseEmbeddingOutput.getEmbedding()).toEqual([1]);
  });
});
