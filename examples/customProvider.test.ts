import { describe, expect, it } from "@jest/globals";
import {
  createOpenAICompatibleProvider,
  createProxiedProvider,
  createCustomApiProvider,
  createMockProvider,
  localModelExample,
  proxiedExample,
  customApiExample,
  mockExample,
} from "./customProvider";

describe("customProvider", () => {
  describe("createOpenAICompatibleProvider", () => {
    it("should create an OpenAI-compatible provider configuration", () => {
      const provider = createOpenAICompatibleProvider();
      
      expect(typeof provider).toBe("function");
      
      // Test that it can be called with options
      const llm = provider({ model: "custom-model" });
      expect(llm).toBeDefined();
      expect(llm.call).toBeDefined();
    });
    
    it("should use default model if not specified", () => {
      const provider = createOpenAICompatibleProvider();
      const llm = provider({});
      
      expect(llm).toBeDefined();
    });
  });
  
  describe("createProxiedProvider", () => {
    it("should create a proxied provider configuration", () => {
      // Set up environment variables for testing
      const originalEnv = process.env;
      process.env = {
        ...originalEnv,
        OPENAI_API_KEY: "test-openai-key",
        COMPANY_PROXY_TOKEN: "test-proxy-token",
      };
      
      try {
        const provider = createProxiedProvider();
        
        expect(typeof provider).toBe("function");
        
        // Test that it can be called with the required options
        const llm = provider({
          openAiApiKey: "test-key",
          companyToken: "test-token",
        } as any);
        expect(llm).toBeDefined();
        expect(llm.call).toBeDefined();
      } finally {
        // Restore original environment
        process.env = originalEnv;
      }
    });
  });
  
  describe("createCustomApiProvider", () => {
    it("should create a custom API provider configuration", () => {
      const provider = createCustomApiProvider();
      
      expect(typeof provider).toBe("function");
      
      // Test that it can be called with required options
      const llm = provider({
        apiKey: "test-api-key",
      } as any);
      expect(llm).toBeDefined();
      expect(llm.call).toBeDefined();
    });
    
    it("should accept optional parameters", () => {
      const provider = createCustomApiProvider();
      
      const llm = provider({
        apiKey: "test-api-key",
        maxLength: 2000, // Override default
      } as any);
      expect(llm).toBeDefined();
    });
  });
  
  describe("createMockProvider", () => {
    it("should create a mock provider with default response", () => {
      const provider = createMockProvider();
      
      expect(typeof provider).toBe("function");
      
      const llm = provider({});
      expect(llm).toBeDefined();
      expect(llm.call).toBeDefined();
    });
    
    it("should create a mock provider with custom response", () => {
      const customResponse = "Custom mock response";
      const provider = createMockProvider(customResponse);
      
      expect(typeof provider).toBe("function");
      
      const llm = provider({});
      expect(llm).toBeDefined();
    });
    
    it("should allow different mock responses", () => {
      const provider1 = createMockProvider("Response 1");
      const provider2 = createMockProvider("Response 2");
      
      expect(typeof provider1).toBe("function");
      expect(typeof provider2).toBe("function");
      expect(provider1).not.toBe(provider2);
      
      const llm1 = provider1({});
      const llm2 = provider2({});
      expect(llm1).toBeDefined();
      expect(llm2).toBeDefined();
    });
  });
  
  describe("Example functions", () => {
    it("should export all example functions", () => {
      expect(typeof localModelExample).toBe("function");
      expect(typeof proxiedExample).toBe("function");
      expect(typeof customApiExample).toBe("function");
      expect(typeof mockExample).toBe("function");
    });
    
    it("should create valid configurations for use with executors", () => {
      // Test that all providers can be created
      const openaiCompatible = createOpenAICompatibleProvider();
      const proxied = createProxiedProvider();
      const customApi = createCustomApiProvider();
      const mock = createMockProvider("Test");
      
      expect(typeof openaiCompatible).toBe("function");
      expect(typeof proxied).toBe("function");
      expect(typeof customApi).toBe("function");
      expect(typeof mock).toBe("function");
      
      // Test that they return LLM instances when called
      const openaiInstance = openaiCompatible({});
      const customInstance = customApi({ apiKey: "test" } as any);
      const mockInstance = mock({});
      
      expect(openaiInstance).toBeDefined();
      expect(customInstance).toBeDefined();
      expect(mockInstance).toBeDefined();
      
      // Proxied requires specific options
      const proxiedInstance = proxied({
        openAiApiKey: "test-key",
        companyToken: "test-token",
      } as any);
      expect(proxiedInstance).toBeDefined();
    });
  });
});