import { createEmbedding } from "./embedding";
import { getEmbeddingConfig } from "./config";
import { createEmbedding_call } from "./embedding.call";
import { apiRequestWrapper } from "@/utils/modules/requestWrapper";
// import { EmbeddingProviderKey } from "@/types";

jest.mock("./config", () => ({
  getEmbeddingConfig: jest.fn(),
}));

jest.mock("./embedding.call", () => ({
  createEmbedding_call: jest.fn(),
}));

jest.mock("@/utils/modules/requestWrapper", () => ({
  apiRequestWrapper: jest.fn(),
}));

describe("createEmbedding", () => {
  const getEmbeddingConfigMock = getEmbeddingConfig as jest.Mock;
//   const createEmbedding_callMock = createEmbedding_call as jest.Mock;
  const apiRequestWrapperMock = apiRequestWrapper as jest.Mock;

  const mockProvider: any = "someProvider";
  const mockOptions: any = { option1: "value1", option2: "value2" };
  const mockConfig = { endpoint: "mockEndpoint", apiKey: "mockApiKey" };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call getEmbeddingConfig with the provider", () => {
    getEmbeddingConfigMock.mockReturnValue(mockConfig);

    createEmbedding(mockProvider, mockOptions);

    expect(getEmbeddingConfigMock).toHaveBeenCalledWith(mockProvider);
  });

  it("should call apiRequestWrapper with the config, options, and createEmbedding_call", () => {
    getEmbeddingConfigMock.mockReturnValue(mockConfig);

    createEmbedding(mockProvider, mockOptions);

    expect(apiRequestWrapperMock).toHaveBeenCalledWith(mockConfig, mockOptions, createEmbedding_call);
  });

  it("should return the value from apiRequestWrapper", () => {
    const mockApiResponse = { data: "someData" };
    apiRequestWrapperMock.mockReturnValue(mockApiResponse);
    getEmbeddingConfigMock.mockReturnValue(mockConfig);

    const result = createEmbedding(mockProvider, mockOptions);

    expect(result).toEqual(mockApiResponse);
  });

  it("should handle errors thrown by getEmbeddingConfig", () => {
    const mockError = new Error("config error");
    getEmbeddingConfigMock.mockImplementation(() => { throw mockError; });

    expect(() => createEmbedding(mockProvider, mockOptions)).toThrow(mockError);
  });

  it("should handle errors thrown by apiRequestWrapper", () => {
    const mockError = new Error("request error");
    apiRequestWrapperMock.mockImplementation(() => { throw mockError; });
    getEmbeddingConfigMock.mockReturnValue(mockConfig);

    expect(() => createEmbedding(mockProvider, mockOptions)).toThrow(mockError);
  });
});