import { escape } from "./escape";

describe("escape", () => {
  it("should escape ampersands", () => {
    expect(escape("Fish & Chips")).toBe("Fish &amp; Chips");
  });

  it("should escape less-than symbols", () => {
    expect(escape("1 < 2")).toBe("1 &lt; 2");
  });

  it("should escape greater-than symbols", () => {
    expect(escape("3 > 2")).toBe("3 &gt; 2");
  });

  it("should escape double quotes", () => {
    expect(escape('He said "Hello"')).toBe('He said &quot;Hello&quot;');
  });

  it("should escape single quotes", () => {
    expect(escape("It's a good day")).toBe("It&#39;s a good day");
  });

  it("should handle mixed cases", () => {
    expect(escape('5 > 3 & "It\'s true"')).toBe('5 &gt; 3 &amp; &quot;It&#39;s true&quot;');
  });

  it("should return the same string if there are no escapable characters", () => {
    expect(escape("Hello World!")).toBe("Hello World!");
  });

  it("should handle multiple escapable characters", () => {
    expect(escape('<div>This & that</div>')).toBe('&lt;div&gt;This &amp; that&lt;/div&gt;');
  });
  
  it("should handle empty strings", () => {
    expect(escape("")).toBe("");
  });

  it("should handle a string with only escapable characters", () => {
    expect(escape('&<>"\'')).toBe("&amp;&lt;&gt;&quot;&#39;");
  });
});