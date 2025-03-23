import { EmbeddingProviderKey } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { embeddingConfigs, getEmbeddingConfig } from "./config";

jest.mock("@/utils/modules/getEnvironmentVariable");

describe("getEmbeddingConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return the correct configuration for 'openai.embedding.v1'", () => {
    const provider: EmbeddingProviderKey = "openai.embedding.v1";
    const config = getEmbeddingConfig(provider);

    expect(config).toEqual(embeddingConfigs[provider]);
  });

  it("should return the correct configuration for 'amazon.embedding.v1'", () => {
    const provider: EmbeddingProviderKey = "amazon.embedding.v1";

    (getEnvironmentVariable as jest.Mock).mockReturnValue("us-west-2");

    const config = getEmbeddingConfig(provider);
    expect(config).toEqual({
      ...embeddingConfigs[provider],
      options: {
        ...embeddingConfigs[provider].options,
        awsRegion: {
          default: undefined,
          required: [true, "aws region is required"],
        },
      },
    });
  });

  it("should throw an error for an invalid provider", () => {
    const invalidProvider = "invalid.provider" as EmbeddingProviderKey;
    expect(() => getEmbeddingConfig(invalidProvider)).toThrowError(
      `Invalid provider: ${invalidProvider}`
    );
  });

  it("should throw an error for a missing provider", () => {
    const invalidProvider = "" as EmbeddingProviderKey;
    expect(() => getEmbeddingConfig(invalidProvider)).toThrowError(
      `Missing provider`
    );
  });
});

describe("embeddingConfigs", () => {
  it("should contain 'openai.embedding.v1' with correct values", () => {
    const provider: EmbeddingProviderKey = "openai.embedding.v1";
    const config = embeddingConfigs[provider];

    expect(config).toEqual({
      key: "openai.embedding.v1",
      provider: "openai.embedding",
      endpoint: "https://api.openai.com/v1/embeddings",
      method: "POST",
      headers: `{"Authorization":"Bearer {{openAiApiKey}}", "Content-Type": "application/json" }`,
      options: {
        input: {},
        dimensions: {
          default: 1536,
        },
        encodingFormat: {},
        openAiApiKey: {},
      },
      mapBody: {
        input: {
          key: "input",
        },
        model: {
          key: "model",
        },
        dimensions: {
          key: "dimensions",
        },
        encodingFormat: {
          key: "encoding_format",
        },
      },
    });
  });

  it("should contain 'amazon.embedding.v1' with correct values", () => {
    const provider: EmbeddingProviderKey = "amazon.embedding.v1";
    (getEnvironmentVariable as jest.Mock).mockReturnValue("us-west-2");

    const config = embeddingConfigs[provider];

    expect(config).toEqual({
      key: "amazon.embedding.v1",
      provider: "amazon.embedding",
      endpoint: `https://bedrock-runtime.{{awsRegion}}.amazonaws.com/model/{{model}}/invoke`,
      method: "POST",
      headers: `{"Content-Type": "application/json" }`,
      options: {
        input: {},
        dimensions: {
          default: 512,
        },
        awsRegion: expect.objectContaining({
          default: undefined,
          required: [true, "aws region is required"],
        }),
        awsSecretKey: {},
        awsAccessKey: {},
      },
      mapBody: {
        input: {
          key: "inputText",
        },
        dimensions: {
          key: "dimensions",
        },
      },
    });
  });
});
