import { toNumber } from "./toNumber";

describe("toNumber", () => {
  it("toNumber casts string to number", async () => {
    const value = "42";
    expect(toNumber(value)).toBe(42);
  });
  it("toNumber returns number for number", async () => {
    const value = 42;
    expect(toNumber(value)).toBe(42);
  });
  it("toNumber returns NaN for {}", async () => {
    const value = {};
    expect(toNumber(value)).toBe(NaN);
  });
  it("toNumber returns NaN for ''", async () => {
    const value = "";
    expect(toNumber(value)).toBe(NaN);
  });
});
