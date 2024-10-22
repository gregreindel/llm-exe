import { camelCase } from "./camelCase";

describe("camelCase", () => {

    it("should handle an empty string", () => {
      const result = camelCase("");
      expect(result).toBe("");
    });
  
    it("should handle a single word all lowercase", () => {
      const result = camelCase("word");
      expect(result).toBe("word");
    });
  
    it("should handle a single word with mixed case", () => {
      const result = camelCase("wOrD");
      expect(result).toBe("word");
    });
  
    it("should handle a single word all uppercase", () => {
      const result = camelCase("WORD");
      expect(result).toBe("word");
    });
  
    it("should handle multiple words separated by spaces", () => {
      const result = camelCase("multiple words example");
      expect(result).toBe("multipleWordsExample");
    });
  
    it("should handle multiple words separated by spaces with mixed case", () => {
      const result = camelCase("MuLtIpLe WorDs exAmPlE");
      expect(result).toBe("multipleWordsExample");
    });
  
    it("should handle leading and trailing spaces", () => {
      const result = camelCase("  leading and trailing spaces  ");
      expect(result).toBe("leadingAndTrailingSpaces");
    });
  
    it("should handle multiple spaces between words", () => {
      const result = camelCase("multiple   spaces   between   words");
      expect(result).toBe("multipleSpacesBetweenWords");
    });
  
    it("should handle non-alphanumeric characters within words", () => {
      const result = camelCase("hello-world");
      expect(result).toBe("helloWorld");
    });
  
    it("should handle capital letters correctly in the middle of words", () => {
      const result = camelCase("HeLLo WoRLd");
      expect(result).toBe("helloWorld");
    });
  
    it("should handle an already camelCased string (disregard it)", () => {
      const result = camelCase("helloWorldExample");
      expect(result).toBe("helloworldexample");
    });
  
    it("should handle strings that include numbers", () => {
      const result = camelCase("a1b 2c3 D4e");
      expect(result).toBe("a1b2c3D4e");
    });
  
    // Additional Test Cases
    it("should handle strings with special characters", () => {
      const result = camelCase("hello.world@now");
      expect(result).toBe("helloWorldNow");
    });
  
    it("should handle strings with mixed alphanumeric and non-alphanumeric characters", () => {
      const result = camelCase("test123 testing 456@code!");
      expect(result).toBe("test123Testing456Code");
    });
  
    it("should handle strings with non-alphanumeric characters at the start and end", () => {
      const result = camelCase("@test! @code$ ");
      expect(result).toBe("testCode");
    });
  
  });