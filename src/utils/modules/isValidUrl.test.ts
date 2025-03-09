import { isValidUrl } from "./isValidUrl";

describe("isValidUrl", () => {
  it("should return true for valid URLs", () => {
    expect(isValidUrl("http://example.com")).toBe(true);
    expect(isValidUrl("https://www.google.com")).toBe(true);
    // Testing a URL with port and path
    expect(isValidUrl("http://127.0.0.1:8080/path")).toBe(true);
  });

  it("should return false for invalid URLs", () => {
    expect(isValidUrl("")).toBe(false);
    // Missing scheme
    expect(isValidUrl("www.google.com")).toBe(false);
    // Just some random text
    expect(isValidUrl("not a url")).toBe(false);
  });
});