import { enforceResultAttributes } from "@/utils/modules/enforceResultAttributes";

describe("enforceResultAttributes", () => {
  it("enforceResultAttributes wraps string into object", async () => {
    const value = enforceResultAttributes("value")
    expect(value).toEqual({ result: "value", attributes: {} });
  });
  it("enforceResultAttributes wraps number into object", async () => {
    const value = enforceResultAttributes(2)
    expect(value).toEqual({ result: 2, attributes: {} });
  });

  it("enforceResultAttributes wraps undefined into object", async () => {
    const value = enforceResultAttributes(undefined as any)
    expect(value).toEqual({ result: undefined, attributes: {} });
  });
  it("enforceResultAttributes wraps null into object", async () => {
    const value = enforceResultAttributes(null as any)
    expect(value).toEqual({ result: null, attributes: {} });
  });
  it("enforceResultAttributes wraps array into object", async () => {
    const value = enforceResultAttributes(["value"])
    expect(value).toEqual({ result: ["value"], attributes: {} });
  });
  it("enforceResultAttributes lets object be", async () => {
    const value = enforceResultAttributes({value: "value"})
    expect(value).toEqual({result: {value: "value"}, attributes: {}});
  });
  it("enforceResultAttributes lets object be", async () => {
    const value = enforceResultAttributes({result: "value", attributes: { hello: "world "}})
    expect(value).toEqual({result: "value", attributes: { hello: "world "}});
  });
  it("enforceResultAttributes lets object be", async () => {
    const value = enforceResultAttributes({result: "value"})
    expect(value).toEqual({result: "value"});
  });
  it("enforceResultAttributes lets object be", async () => {
    const value = enforceResultAttributes({attributes: { hello: "world "}})
    expect(value).toEqual({attributes: { hello: "world "}});
  });
})