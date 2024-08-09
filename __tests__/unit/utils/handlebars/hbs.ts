import { registerPartials, registerHelpers } from "@/utils";
import { hbs } from "@/utils/modules/handlebars";

describe("handlebars hbs helpers", () => {
  test("hbs", () => {
    expect(hbs).toHaveProperty("helpers");
    expect(hbs).toHaveProperty("partials");
    expect(hbs).toHaveProperty("VERSION");
    expect(hbs.VERSION).toEqual("4.7.8");
  });

  test("registerPartials", () => {
    registerPartials([
      { name: "template1", template: "template-content" },
    ], hbs);
    expect(hbs.partials["template1"]).toEqual("template-content");
  });

  test("registerHelpers", () => {
    const fn1 = () => "val";
    registerHelpers([{ name: "helper1", handler: fn1 }], hbs);
    expect(hbs.helpers["helper1"]).toBeDefined();
  });
});
