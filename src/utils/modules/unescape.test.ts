import { unescape } from "./unescape";

describe("unescape", () => {

  it("should unescape &amp; to &", () => {
    const input = "This &amp; that";
    const expected = "This & that";
    const result = unescape(input);
    expect(result).toBe(expected);
  });

  it("should unescape &lt; to <", () => {
    const input = "This &lt; that";
    const expected = "This < that";
    const result = unescape(input);
    expect(result).toBe(expected);
  });

  it("should unescape &gt; to >", () => {
    const input = "This &gt; that";
    const expected = "This > that";
    const result = unescape(input);
    expect(result).toBe(expected);
  });

  it("should unescape &quot; to \"", () => {
    const input = "This &quot;that&quot;";
    const expected = "This \"that\"";
    const result = unescape(input);
    expect(result).toBe(expected);
  });
  
  it("should unescape &#39; to '", () => {
    const input = "This &#39;that&#39;";
    const expected = "This 'that'";
    const result = unescape(input);
    expect(result).toBe(expected);
  });
  
  it("should unescape a string with multiple entities", () => {
    const input = "This &quot;that&quot; &amp; this &gt; that &lt; there";
    const expected = "This \"that\" & this > that < there";
    const result = unescape(input);
    expect(result).toBe(expected);
  });
  
  it("should return the same string if there are no entities to unescape", () => {
    const input = "This that";
    const expected = "This that";
    const result = unescape(input);
    expect(result).toBe(expected);
  });
  
  it("should handle an empty string", () => {
    const input = "";
    const expected = "";
    const result = unescape(input);
    expect(result).toBe(expected);
  });
  
  it("should handle a string with no special characters", () => {
    const input = "just a plain string";
    const expected = "just a plain string";
    const result = unescape(input);
    expect(result).toBe(expected);
  });
});