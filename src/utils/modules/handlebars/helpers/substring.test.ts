import { substringFn } from './substring';

describe('substringFn', () => {
    it('should return the substring when the string length is greater than the end index', () => {
        const result = substringFn.call(null, 'hello world', 0, 5);
        expect(result).toBe('hello');
    });

    it('should return the original string when the string length is less than or equal to the end index', () => {
        const result = substringFn.call(null, 'hello', 0, 10);
        expect(result).toBe('hello');
    });

    it('should handle negative start index', () => {
        const result = substringFn.call(null, 'hello world', -5, 5);
        expect(result).toBe('hello');
    });

    it('should handle negative end index', () => {
        const result = substringFn.call(null, 'hello world', 0, -1);
        expect(result).toBe('');
    });

    it('should handle start index greater than end index', () => {
        const result = substringFn.call(null, 'hello world', 5, 0);
        expect(result).toBe('');
    });

    it('should handle start index equal to end index', () => {
        const result = substringFn.call(null, 'hello world', 5, 5);
        expect(result).toBe('');
    });
});