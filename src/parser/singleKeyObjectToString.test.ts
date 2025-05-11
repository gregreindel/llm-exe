import { singleKeyObjectToString } from "./singleKeyObjectToString";

describe("singleKeyObjectToString", () => {
  it("returns the string value from a valid single-key JSON object", () => {
    const input = '{"key":"value"}';
    const result = singleKeyObjectToString(input);
    expect(result).toBe("value");
  });

  it("returns original string if JSON is an object with multiple keys", () => {
    const input = '{"key1":"value1","key2":"value2"}';
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });

  it("returns original string if JSON is an empty object", () => {
    const input = "{}";
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });

  it("returns original string if JSON value is not a string (number)", () => {
    const input = '{"key":123}';
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });

  it("returns original string if JSON value is not a string (null)", () => {
    const input = '{"key":null}';
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });

  it("returns original string if JSON value is not a string (boolean)", () => {
    const input = '{"key":true}';
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });

  it("returns original string if JSON value is not a string (object)", () => {
    const input = '{"key":{"nested":"value"}}';
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });

  it("returns original string if JSON is an array", () => {
    const input = '["a", "b"]';
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });

  it("returns original string if input is invalid JSON", () => {
    const input = "not a json string";
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });

  it("returns original string if JSON is a number", () => {
    const input = "123";
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });

  it("returns original string if JSON is null", () => {
    const input = "null";
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });

  it("returns original string if JSON is a string literal", () => {
    const input = '"just a string"';
    const result = singleKeyObjectToString(input);
    expect(result).toBe(input);
  });
});
