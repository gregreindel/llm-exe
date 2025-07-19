import { promptSanitize, useJsonSanitize } from "./promptSanitize";

describe("OpenAI promptSanitize", () => {
  it("converts string to message array", () => {
    expect(promptSanitize("Hello")).toEqual([
      { role: "user", content: "Hello" }
    ]);
  });

  it("passes through arrays unchanged", () => {
    const messages = [{ role: "user", content: "Hello" }];
    expect(promptSanitize(messages)).toBe(messages);
  });

  it("passes through objects unchanged", () => {
    const messageObject = { someProperty: "value" };
    expect(promptSanitize(messageObject)).toBe(messageObject);
  });

  it("passes through null unchanged", () => {
    expect(promptSanitize(null)).toBe(null);
  });

  it("passes through undefined unchanged", () => {
    expect(promptSanitize(undefined)).toBe(undefined);
  });
});

describe("OpenAI useJsonSanitize", () => {
  it("returns json_object for truthy values", () => {
    expect(useJsonSanitize(true)).toBe("json_object");
    expect(useJsonSanitize(1)).toBe("json_object");
    expect(useJsonSanitize("yes")).toBe("json_object");
    expect(useJsonSanitize({})).toBe("json_object");
    expect(useJsonSanitize([])).toBe("json_object");
  });

  it("returns text for falsy values", () => {
    expect(useJsonSanitize(false)).toBe("text");
    expect(useJsonSanitize(0)).toBe("text");
    expect(useJsonSanitize("")).toBe("text");
    expect(useJsonSanitize(null)).toBe("text");
    expect(useJsonSanitize(undefined)).toBe("text");
  });
});