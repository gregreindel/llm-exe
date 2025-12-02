import { maskApiKeys } from "./maskApiKeysInDebug";

describe("maskApiKeys", () => {
  describe("JWT Bearer tokens", () => {
    it("should mask JWT tokens with three parts", () => {
      const log = "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U";
      const masked = maskApiKeys(log);
      // The entire Bearer token is captured and masked as one unit
      expect(masked).toBe("Authorization: Bear***********************************************************************************************************sR8U");
    });

    it("should mask Bearer tokens with non-JWT format (20+ chars)", () => {
      const log = "Bearer abcdef1234567890abcdef1234567890";
      const masked = maskApiKeys(log);
      // The entire Bearer token is captured
      expect(masked).toBe("Bear*******************************7890");
    });

    it("should handle multiple JWT tokens in the same string", () => {
      const log = "Token1: Bearer abc.def.ghi Token2: Bearer jkl.mno.pqr";
      const masked = maskApiKeys(log);
      expect(masked).toBe("Token1: Bear**********.ghi Token2: Bear**********.pqr");
    });
  });

  describe("OpenAI API keys", () => {
    it("should mask OpenAI secret keys", () => {
      const log = "Using API key: sk-1234567890abcdefghijklmnopqrstuvwxyz";
      const masked = maskApiKeys(log);
      expect(masked).toBe("Using API key: sk-1*******************************wxyz");
    });

    it("should mask OpenAI keys with varying lengths", () => {
      const log = "Key: sk-proj-abcdef1234567890abcdef1234567890abcdef1234567890";
      const masked = maskApiKeys(log);
      expect(masked).toBe("Key: sk-proj-abcd****************************************7890");
    });
  });

  describe("AWS access keys", () => {
    it("should mask AWS access key IDs", () => {
      const log = "AWS Access Key: AKIAIOSFODNN7EXAMPLE";
      const masked = maskApiKeys(log);
      expect(masked).toBe("AWS Access Key: AKIA************MPLE");
    });

    it("should only mask valid AWS key format (AKIA + 16 uppercase alphanumeric)", () => {
      const log = "Invalid: AKIAlowercase123456 Valid: AKIAIOSFODNN7EXAMPLE";
      const masked = maskApiKeys(log);
      expect(masked).toBe("Invalid: AKIAlowercase123456 Valid: AKIA************MPLE");
    });
  });

  describe("generic long strings", () => {
    it("should mask 32+ character alphanumeric strings", () => {
      const log = "Token: abcdef1234567890abcdef1234567890";
      const masked = maskApiKeys(log);
      expect(masked).toBe("Token: abcd************************7890");
    });

    it("should mask very long alphanumeric strings", () => {
      const log = "Secret: " + "a".repeat(100);
      const masked = maskApiKeys(log);
      const result = masked.split(": ")[1];
      expect(result.startsWith("aaaa")).toBe(true);
      expect(result.endsWith("aaaa")).toBe(true);
      expect(result).toMatch(/^aaaa\*+aaaa$/);
      expect(result.length).toBe(100);
    });
  });

  describe("edge cases", () => {
    it("should not mask tokens with 8 or fewer characters", () => {
      const log = "Short: sk-1234 Bearer abc12345";
      const masked = maskApiKeys(log);
      expect(masked).toBe("Short: sk-1234 Bearer abc12345");
    });

    it("should handle empty strings", () => {
      expect(maskApiKeys("")).toBe("");
    });

    it("should handle strings with no sensitive data", () => {
      const log = "This is a normal log message with no secrets";
      const masked = maskApiKeys(log);
      expect(masked).toBe(log);
    });

    it("should preserve word boundaries", () => {
      const log = "prefixsk-1234567890abcdefghijsuffix";
      const masked = maskApiKeys(log);
      expect(masked).toBe("prefixsk-1234567890abcdefghijsuffix"); // Not masked due to word boundary
    });

    it("should mask multiple different types of keys", () => {
      const log = "Bearer token123456789012345678901234567890 sk-openaikey123456789012345 AKIAIOSFODNN7EXAMPLE";
      const masked = maskApiKeys(log);
      expect(masked).toContain("Bear**********************************7890");
      expect(masked).toContain("sk-o*******************2345");
      expect(masked).toContain("AKIA************MPLE");
    });

    it("should handle special characters in the middle of text", () => {
      const log = 'Key="sk-1234567890abcdefghij", Token=Bearer abc.def.ghi';
      const masked = maskApiKeys(log);
      expect(masked).toBe('Key="sk-1***************ghij", Token=Bear**********.ghi');
    });

    it("should handle newlines and multiline logs", () => {
      const log = `Line 1: sk-1234567890abcdefghij
Line 2: Bearer token.with.three.parts
Line 3: AKIAIOSFODNN7EXAMPLE`;
      const masked = maskApiKeys(log);
      expect(masked).toContain("sk-1***************ghij");
      expect(masked).toContain("Bear***************hree.parts");
      expect(masked).toContain("AKIA************MPLE");
    });
  });

  describe("problematic patterns", () => {
    it("should unfortunately mask legitimate long alphanumeric strings", () => {
      // This test demonstrates the overly broad pattern issue
      const log = "SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      const masked = maskApiKeys(log);
      // This shows the function masks SHA hashes, which is not ideal
      expect(masked).toBe("SHA256: e3b0********************************************************b855");
    });

    it("should unfortunately mask base64 encoded content", () => {
      // This test demonstrates another false positive
      const log = "Encoded: YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkw";
      const masked = maskApiKeys(log);
      // Base64 strings often exceed 32 chars and get masked
      expect(masked).toBe("Encoded: YWJj****************************************ODkw");
    });

    it("should not mask strings with special characters breaking the alphanumeric pattern", () => {
      const log = "ID: abc-def-ghi-jkl-mno-pqr-stu-vwx-yz0-123-456-789";
      const masked = maskApiKeys(log);
      // Hyphens break the pattern, so this won't be masked
      expect(masked).toBe(log);
    });
  });

  describe("real-world scenarios", () => {
    it("should mask API keys in JSON logs", () => {
      const log = JSON.stringify({
        headers: {
          Authorization: "Bearer sk-1234567890abcdefghijklmnop"
        },
        aws_key: "AKIAIOSFODNN7EXAMPLE"
      }, null, 2);
      const masked = maskApiKeys(log);
      expect(masked).toContain('"Authorization": "Bear****************************mnop"');
      expect(masked).toContain('"aws_key": "AKIA************MPLE"');
    });

    it("should handle URL-encoded tokens", () => {
      const log = "https://api.example.com?token=sk-1234567890abcdefghijklmnop&other=value";
      const masked = maskApiKeys(log);
      expect(masked).toBe("https://api.example.com?token=sk-1*********************mnop&other=value");
    });

    it("should mask tokens in error messages", () => {
      const log = "Error: Invalid token Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature at line 42";
      const masked = maskApiKeys(log);
      expect(masked).toBe("Error: Invalid token Bear*****************************************************ture at line 42");
    });
  });
});