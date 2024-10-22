import { appendContextPath } from "@/utils/modules/handlebars/utils/appendContextPath";

describe("appendContextPath", () => {

  it("should return just the id when contextPath is null", () => {
    const result = appendContextPath(null, "id123");
    expect(result).toBe("id123");
  });

  it("should return just the id when contextPath is undefined", () => {
    const result = appendContextPath(undefined, "id123");
    expect(result).toBe("id123");
  });

  it("should append id to contextPath with a dot when contextPath is a non-empty string", () => {
    const result = appendContextPath("context", "id123");
    expect(result).toBe("context.id123");
  });

  it("should return id when contextPath is an empty string", () => {
    const result = appendContextPath("", "id123");
    expect(result).toBe("id123");
  });

});
