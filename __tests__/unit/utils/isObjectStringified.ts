import { isObjectStringified } from "@/utils";

describe('isObjectStringified', () => {
    test('should return false if input is not a string', () => {
      const input = 123;
      const output = isObjectStringified(input as any);
      expect(output).toBe(false);
    });
  
    test('should return false if input is an empty string', () => {
      const input = '';
      const output = isObjectStringified(input);
      expect(output).toBe(false);
    });
  
    test('should return false if input is not a valid JSON string', () => {
      const input = '{not: a, valid, json}';
      const output = isObjectStringified(input);
      expect(output).toBe(false);
    });
  
    test('should return true if input is a valid JSON object string', () => {
      const input = '{"key": "value"}';
      const output = isObjectStringified(input);
      expect(output).toBe(true);
    });
  
    test('should return true if input is a valid JSON array string', () => {
      const input = '[1, 2, 3]';
      const output = isObjectStringified(input);
      expect(output).toBe(true);
    });
  
    test('should return false if input is a valid JSON string but not an object or array', () => {
      const input = '"just a string"';
      const output = isObjectStringified(input);
      expect(output).toBe(false);
    });
  });