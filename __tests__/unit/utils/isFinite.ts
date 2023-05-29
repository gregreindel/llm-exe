import { isFinite } from "@/utils";

describe("isFinite", () => {
  it("isFinite detects number", async () => {
    const value = 100;
    expect(isFinite(value)).toBe(true);
  });
  it("isFinite detects number", async () => {
    const value = 1.00;
    expect(isFinite(value)).toBe(true);
  });
  it("isFinite returns true for -1", async () => {
    const value = -1;
    expect(isFinite(value)).toBe(true);
  });
  it("isFinite returns false for NaN", async () => {
    const value = NaN;
    expect(isFinite(value)).toBe(false);
  });
})