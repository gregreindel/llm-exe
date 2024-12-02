import { hbs as hbsInstance, registerHelpers, registerPartials } from "@/utils/modules/handlebars";


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


  test("registerPartials defaults to default instance if not set", () => {
    registerPartials([
      { name: "template12", template: "template-content" },
    ]);
    expect(hbsInstance.partials["template12"]).toEqual("template-content");
  });


  test("registerHelpers", () => {
    const fn1 = () => "val";
    registerHelpers([{ name: "helper1", handler: fn1 }], hbsInstance);
    expect(hbsInstance.helpers["helper1"]).toBeDefined();
  });

  
  test("registerHelpers defaults to default instance if not set", () => {
    const fn1 = () => "val";
    registerHelpers([{ name: "helper12", handler: fn1 }]);
    expect(hbsInstance.helpers["helper12"]).toBeDefined();
  });
});
