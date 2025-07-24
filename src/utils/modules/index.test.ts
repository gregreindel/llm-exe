import * as utils from "./index"
import { hbs, hbsAsync } from "./handlebars";

// Mock the handlebars module
jest.mock("./handlebars", () => ({
  hbs: {
    registerHelpers: jest.fn(),
    registerPartials: jest.fn(),
  },
  hbsAsync: {
    registerHelpers: jest.fn(),
    registerPartials: jest.fn(),
  },
}));

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

  describe("registerHelpers", () => {
    it("should register helpers on both hbs and hbsAsync", () => {
      const helpers = [{ name: "test", fn: () => {} }];
      
      utils.registerHelpers(helpers);
      
      expect(hbs.registerHelpers).toHaveBeenCalledWith(helpers);
      expect(hbsAsync.registerHelpers).toHaveBeenCalledWith(helpers);
    });
  });

  describe("registerPartials", () => {
    it("should register partials on both hbs and hbsAsync", () => {
      const partials = [{ name: "testPartial", template: "test" }];
      
      utils.registerPartials(partials);
      
      expect(hbs.registerPartials).toHaveBeenCalledWith(partials);
      expect(hbsAsync.registerPartials).toHaveBeenCalledWith(partials);
    });
  });
})