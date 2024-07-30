import { configs, getLlmConfig } from "@/llm/config";
import { Config, LlmProvidor } from "@/types";

describe("configs", () => {

  const OLD_ENV = process.env;

  beforeAll(async () => {
    process.env.AWS_REGION = "us-west-2";
  });

  afterAll(async () => {
    process.env = OLD_ENV
  });

  it("should have valid openai config", () => {
    const openaiConfig: Config = {
      provider: "openai",
      endpoint: `https://api.openai.com/v1/chat/completions`,
      options: {
        prompt: {},
        topP: {},
        openAiApiKey: {},
      },
      method: "POST",
      headers: `{"Authorization":"Bearer {{openAiApiKey}}", "Content-Type": "application/json" }`,
      mapBody: {
        prompt: {
          key: "messages",
        },
        model: {
          key: "model",
        },
        topP: {
          key: "top_p",
        },
      },
    };
    expect(configs.openai).toEqual(openaiConfig);
  });

  it("should have valid anthropic config", () => {
    const anthropicConfig: Config = {
      provider: "anthropic",
      endpoint: `https://api.anthropic.com/v1/messages`,
      headers: `{"x-api-key":"{{anthropicApiKey}}", "Content-Type": "application/json", "anthropic-version": "2023-06-01" }`,
      method: "POST",
      options: {
        prompt: {},
        maxTokens: {
          required: [true, "maxTokens required"]
        },
        anthropicApiKey: {},
      },
      mapBody: {
        model: {
          key: "model",
        },
        maxTokens: {
          key: "max_tokens",
        },
        prompt: {
          key: "messages",
        },
      },
    };
    expect(configs.anthropic).toEqual(anthropicConfig);
  });

  it("should have valid amazon.anthropic.v3 config", () => {
    const amazonAnthropicConfig: Config = {
      provider: "amazon.anthropic.v3",
      method: "POST",
      headers: `{"Content-Type": "application/json" }`,
      endpoint: `https://bedrock-runtime.{{awsRegion}}.amazonaws.com/model/{{model}}/invoke`,
      options: {
        prompt: {},
        topP: {},
        maxTokens: {},
        awsRegion: {
          default: undefined,
          required: [true, "aws region is required"],
        },
        awsSecretKey: {},
        awsAccessKey: {},
      },
      mapBody: {
        prompt: {
          key: "messages",
        },
        topP: {
          key: "top_p",
        },
        maxTokens: {
          key: "max_tokens",
          default: 10000,
        },
        anthropic_version: {
          key: "anthropic_version",
          default: "bedrock-2023-05-31",
        },
      },
    };
    expect(configs["amazon.anthropic.v3"]).toEqual(amazonAnthropicConfig);
  });

  it("should have valid amazon.meta.v3 config", () => {
    const amazonMetaConfig: Config = {
      provider: "amazon.meta.v3",
      method: "POST",
      headers: `{"Content-Type": "application/json" }`,
      options: {
        prompt: {},
        topP: {},
        maxTokens: {},
        temperature: {},
        awsRegion: {
          default: undefined,
        },
        awsSecretKey: {},
        awsAccessKey: {},
      },
      endpoint: `https://bedrock-runtime.{{awsRegion}}.amazonaws.com/model/{{model}}/invoke`,
      mapBody: {
        prompt: {
          key: "prompt",
          sanitize: expect.any(Function),
        },
        topP: {
          key: "top_p",
        },
        temperature: {
          key: "temperature",
        },
        maxTokens: {
          key: "max_gen_len",
          default: 2048,
        },
      },
    };
    expect(configs["amazon.meta.v3"]).toEqual(amazonMetaConfig);
  });
});

describe("getLlmConfig", () => {
    it("should return the correct config for a valid providor", () => {
      const providor: LlmProvidor = "openai";
      const config: Config = getLlmConfig(providor);
      expect(config).toEqual(configs.openai);
    });
  
    it("should throw an error for an invalid providor", () => {
      const providor: any = "invalid_providor";
      expect(() => getLlmConfig(providor)).toThrow("Invalid providor");
    });
  
    it("should throw an error when providor is undefined", () => {
      const providor: any = undefined;
      expect(() => getLlmConfig(providor)).toThrow("Invalid providor");
    });
  
    it("should throw an error when providor is empty string", () => {
      const providor: any = "";
      expect(() => getLlmConfig(providor)).toThrow("Invalid providor");
    });
  
    it("should throw an error when providor is null", () => {
      const providor: any = null;
      expect(() => getLlmConfig(providor)).toThrow("Invalid providor");
    });
  
    it("should return the correct config for 'amazon.meta.v3'", () => {
      const providor: LlmProvidor = "amazon.meta.v3";
      const config: Config = getLlmConfig(providor);
      expect(config).toEqual(configs["amazon.meta.v3"]);
    });
  
    it("should return the correct config for 'amazon.anthropic.v3'", () => {
      const providor: LlmProvidor = "amazon.anthropic.v3";
      const config: Config = getLlmConfig(providor);
      expect(config).toEqual(configs["amazon.anthropic.v3"]);
    });
  
    it("should have all required fields for 'openai' config", () => {
      const config: Config = getLlmConfig("openai");
      const keys = ["provider", "endpoint", "options", "method", "headers", "mapBody"];
      keys.forEach(key => {
        expect(config).toHaveProperty(key);
      });
    });
  
    it("should have all required fields for 'anthropic' config", () => {
      const config: Config = getLlmConfig("anthropic");
      const keys = ["provider", "endpoint", "options", "method", "headers", "mapBody"];
      keys.forEach(key => {
        expect(config).toHaveProperty(key);
      });
    });
  
    it("should have all required fields for 'amazon.anthropic.v3' config", () => {
      const config: Config = getLlmConfig("amazon.anthropic.v3");
      const keys = ["provider", "endpoint", "options", "method", "headers", "mapBody"];
      keys.forEach(key => {
        expect(config).toHaveProperty(key);
      });
    });
  
    it("should have all required fields for 'amazon.meta.v3' config", () => {
      const config: Config = getLlmConfig("amazon.meta.v3");
      const keys = ["provider", "endpoint", "options", "method", "headers", "mapBody"];
      keys.forEach(key => {
        expect(config).toHaveProperty(key);
      });
    });
  
  });