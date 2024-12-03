import { cutFn } from './cut';

describe('cutFn', () => {
    it('should remove all occurrences of the specified argument from the string', () => {
        const result = cutFn.call({}, 'hello world', 'o');
        expect(result).toBe('hell wrld');
    });

    it('should return the original string if the argument is not found', () => {
        const result = cutFn.call({}, 'hello world', 'x');
        expect(result).toBe('hello world');
    });

    it('should handle empty string input', () => {
        const result = cutFn.call({}, '', 'o');
        expect(result).toBe('');
    });

    it('should handle empty argument input', () => {
        const result = cutFn.call({}, 'hello world', '');
        expect(result).toBe('hello world');
    });

    it('should handle non-string inputs by converting them to strings', () => {
        const result = cutFn.call({}, 12345, '2');
        expect(result).toBe('1345');
    });
});