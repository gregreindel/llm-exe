import { isUndefined } from "@/utils/modules/isUndefined";

describe("isUndefined", () => {
  it("isUndefined detects undefined", async () => {
    let value;
    expect(isUndefined(value)).toBe(true);
  });
  it("isUndefined returns false for null", async () => {
    const value = null;
    expect(isUndefined(value)).toBe(false);
  });
  it("isUndefined returns false for {}", async () => {
    const value = {};
    expect(isUndefined(value)).toBe(false);
  });
})