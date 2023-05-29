import { isNull } from "@/utils";

describe("isNull", () => {
  it("isNull detects null", async () => {
    const value = null;
    expect(isNull(value)).toBe(true);
  });
  it("isNull returns false for undefined", async () => {
    const value = undefined;
    expect(isNull(value)).toBe(false);
  });
  it("isNull returns false for {}", async () => {
    const value = {};
    expect(isNull(value)).toBe(false);
  });
})