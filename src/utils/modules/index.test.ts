import * as utils from "./index"

describe("exports correct utils", () => {
  it("exports correct utils", async () => {
    expect(typeof utils.asyncCallWithTimeout).toBe("function");
    expect(typeof utils.assert).toBe("function");
    expect(typeof utils.defineSchema).toBe("function");
    expect(typeof utils.filterObjectOnSchema).toBe("function");
    expect(typeof utils.importHelpers).toBe("function");
    expect(typeof utils.importPartials).toBe("function");
    expect(typeof utils.maybeParseJSON).toBe("function");
    expect(typeof utils.maybeStringifyJSON).toBe("function");
    expect(typeof utils.replaceTemplateString).toBe("function");
    expect(typeof utils.replaceTemplateStringAsync).toBe("function")
    expect(typeof utils.registerHelpers).toBe("function");
    expect(typeof utils.registerPartials).toBe("function");
    expect(typeof utils.isObjectStringified).toBe("function");
    expect(typeof utils.guessProviderFromModel).toBe("function");
  });

})