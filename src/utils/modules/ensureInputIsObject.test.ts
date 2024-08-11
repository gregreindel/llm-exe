import { ensureInputIsObject } from "@/utils/modules/ensureInputIsObject";

describe("ensureInputIsObject", () => {
  it("ensureInputIsObject wraps string into object", async () => {
    const value = ensureInputIsObject("value")
    expect(value).toEqual({ input: "value" });
  });
  it("ensureInputIsObject wraps number into object", async () => {
    const value = ensureInputIsObject(2)
    expect(value).toEqual({ input: 2 });
  });
  it("ensureInputIsObject wraps undefined into object", async () => {
    const value = ensureInputIsObject(undefined as any)
    expect(value).toEqual({ input: undefined });
  });
  it("ensureInputIsObject wraps null into object", async () => {
    const value = ensureInputIsObject(null as any)
    expect(value).toEqual({ input: null });
  });
  it("ensureInputIsObject wraps array into object", async () => {
    const value = ensureInputIsObject(["value"])
    expect(value).toEqual({ input: ["value"] });
  });
  it("ensureInputIsObject lets object be", async () => {
    const value = ensureInputIsObject({value: "value"})
    expect(value).toEqual({value: "value"});
  });
})