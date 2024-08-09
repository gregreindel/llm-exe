import { maybeStringifyJSON } from "@/utils";

describe('maybeStringifyJSON', () => {
    it('should handle null', () => {
      const input = null;
      const expectedOutput = null;
      expect(maybeStringifyJSON(input)).toEqual(expectedOutput);
    });
  
    it('should handle undefined', () => {
      const input = undefined;
      const expectedOutput = undefined;
      expect(maybeStringifyJSON(input)).toEqual(expectedOutput);
    });
  
    it('should handle strings', () => {
      const input = 'hello world';
      const expectedOutput = 'hello world';
      expect(maybeStringifyJSON(input)).toEqual(expectedOutput);
    });
  
    it('should handle numbers', () => {
      const input = 42;
      const expectedOutput = 42;
      expect(maybeStringifyJSON(input)).toEqual(expectedOutput);
    });
  
    it('should handle simple objects', () => {
      const input = { a: 1, b: 'two' };
      const expectedOutput = '{"a":1,"b":"two"}';
      expect(maybeStringifyJSON(input)).toEqual(expectedOutput);
    });
  
    it('should handle arrays', () => {
      const input = [1, 'two', { a: 1, b: 'two' }];
      const expectedOutput = '[1,"two",{"a":1,"b":"two"}]';
      expect(maybeStringifyJSON(input)).toEqual(expectedOutput);
    });
  
    it('should handle circular objects', () => {
      const input: any = { a: 1, b: 'two' };
      input.c = input;
      const expectedOutput = '';
      expect(maybeStringifyJSON(input)).toEqual(expectedOutput);
    });
  
    it('should handle objects with toJSON method', () => {
      const input = {
        a: 1,
        b: 'two',
        toJSON: () => ({ a: 1, b: 'three' }),
      };
      const expectedOutput = '{"a":1,"b":"three"}';
      expect(maybeStringifyJSON(input)).toEqual(expectedOutput);
    });
  
    it('should handle objects that throw error in toJSON method', () => {
      const input = {
        a: 1,
        b: 'two',
        toJSON: () => {
          throw new Error('Error in toJSON');
        },
      };
      const expectedOutput = '';
      expect(maybeStringifyJSON(input)).toEqual(expectedOutput);
    });
  });