import { hbs as hbsInstance } from "@/utils/modules/handlebars";
import { registerPartials, registerHelpers } from "@/utils";
import { useHandlebars } from "@/utils/modules/handlebars";
// import { asyncCoreOverrideHelpers } from "@/utils/modules/handlebars/helpers/async/async-helpers";



import * as path from "path";


jest.mock('@/utils/modules/handlebars/helpers/async/async-helpers', () => ({
  asyncCoreOverrideHelpers: {
    asyncHelper1: jest.fn(),
    asyncHelper2: jest.fn(),
    if: jest.fn(),
  }
}));


describe("useHandlebars", () => {
  const OLD_ENV = process.env;

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...OLD_ENV }; // Make a copy
  });

  afterAll(() => {
    process.env = OLD_ENV; // Restore old environment
  });

  test("hbs", () => {
    expect(hbsInstance).toHaveProperty("helpers");
    expect(hbsInstance).toHaveProperty("partials");
    expect(hbsInstance).toHaveProperty("VERSION");
    expect(hbsInstance.VERSION).toEqual("4.7.8");
  });

  test("registerPartials", () => {
    registerPartials([
      { name: "template1", template: "template-content" },
    ], hbsInstance);
    expect(hbsInstance.partials["template1"]).toEqual("template-content");
  });

  test("registerHelpers", () => {
    const fn1 = () => "val";
    registerHelpers([{ name: "helper1", handler: fn1 }], hbsInstance);
    expect(hbsInstance.helpers["helper1"]).toBeDefined();
  });


  test("useHandlebars", () => {
    const hbs = useHandlebars(hbsInstance);
    expect(hbs).toHaveProperty("helpers");
    expect(hbs).toHaveProperty("partials");
    expect(hbs).toHaveProperty("VERSION");
    expect(hbs.VERSION).toEqual("4.7.8");
  });
  test("useHandlebars has default templates", () => {
    const hbs = useHandlebars(hbsInstance);
    expect(hbs).toHaveProperty("partials");
    expect(hbs.partials).toHaveProperty("MarkdownCode");
    expect(hbs.partials).toHaveProperty("ChatConversationHistory");
    expect(hbs.partials).toHaveProperty("DialogueHistory");
  });
  test("useHandlebars has default helpers", () => {
    const hbs = useHandlebars(hbsInstance);
    expect(hbs).toHaveProperty("helpers");
    expect(hbs.helpers).toHaveProperty("eq");
    expect(hbs.helpers).toHaveProperty("neq");
    expect(hbs.helpers).toHaveProperty("ifCond");
    expect(hbs.helpers).toHaveProperty("pluralize");
    expect(hbs.helpers).toHaveProperty("getKeyOr");
  });

  test("useHandlebars registers custom partial from CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH", () => {
    process.env.CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH = path.join(
      __dirname,
      "../../../../__tests__/__data__/handlebars-partials.js"
    );
    const hbs = useHandlebars(hbsInstance);
    expect(hbs).toHaveProperty("partials");
    expect(hbs.partials["customImportedPartial"]).toEqual(
      `this is from external file`
    );
  });
  test("useHandlebars registers custom helpers from CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH", () => {
    process.env.CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH = path.join(
      __dirname,
      "../../../../__tests__/__data__/handlebars-helpers.js"
    );
    const hbs = useHandlebars(hbsInstance);
    expect(hbs).toHaveProperty("helpers");
    expect(typeof hbs.helpers["customImportedHelper"]).toEqual(`function`);
  });

  test("useHandlebars 'unless' helper throws error with incorrect arguments", () => {
    const hbs = useHandlebars(hbsInstance);
    expect(() => {
      hbs.helpers["unless"].call({}, true);
    }).toThrow("#unless requires exactly one argument");
  });

  test("useHandlebars 'unless' helper works correctly", () => {
    const hbs = useHandlebars(hbsInstance);

    const fakeOptions = {
      fn: jest.fn().mockReturnValue("truthy block"),
      inverse: jest.fn().mockReturnValue("falsy block"),
      hash: {},
    };

    expect(hbs.helpers["unless"](false, fakeOptions)).toBe(
      "truthy block"
    );
    // expect(hbs.helpers["unless"].call({}, true, fakeOptions)).toBe(
    //   "falsy block"
    // );
    expect(fakeOptions.fn).toHaveBeenCalledWith(undefined);
    // expect(fakeOptions.inverse).toHaveBeenCalledWith(false);
  });

  test("useHandlebars registers async override helpers when preferAsync is true", () => {

    
    // const { useHandlebars } = require("@/utils/modules/handlebars");
    const hbs = useHandlebars(hbsInstance, true);

    expect(hbs).toHaveProperty("helpers");
    expect(hbs.helpers.asyncHelper1).toEqual(expect.any(Function));
    expect(hbs.helpers.asyncHelper2).toEqual(expect.any(Function));
  });
});
