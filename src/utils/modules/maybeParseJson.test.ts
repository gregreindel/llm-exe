import { maybeParseJSON } from "@/utils";

describe('maybeParseJSON', () => {
  test('should return an empty object if input is undefined', () => {
    const result = maybeParseJSON(undefined as any);
    expect(result).toEqual({});
  });

  test('should return an empty object if input is null', () => {
    const result = maybeParseJSON(null);
    expect(result).toEqual({});
  });

  test('should return a parsed object if input is a valid JSON string', () => {
    const input = '{"key": "value"}';
    const expected = { key: 'value' };
    const result = maybeParseJSON(input);
    expect(result).toEqual(expected);
  });

  test('should return an empty object if input is an invalid JSON string', () => {
    const input = '{key: "value"}';
    const result = maybeParseJSON(input);
    expect(result).toEqual({});
  });

  test('should return the same object if input is an object', () => {
    const input = { key: 'value' };
    const result = maybeParseJSON(input);
    expect(result).toEqual(input);
  });

  test('should return an empty object for other types of input', () => {
    const input = 42;
    const result = maybeParseJSON(input);
    expect(result).toEqual({});
  });
  test('should return a parsed object with a nested structure', () => {
    const input = '{"key": {"nestedKey": "nestedValue"}}';
    const expected = { key: { nestedKey: 'nestedValue' } };
    const result = maybeParseJSON(input);
    expect(result).toEqual(expected);
  });

  test('should return a parsed object with an array', () => {
    const input = '{"key": ["value1", "value2"]}';
    const expected = { key: ['value1', 'value2'] };
    const result = maybeParseJSON(input);
    expect(result).toEqual(expected);
  });
});