import { importHelpers } from "@/utils";

describe("handlebars hbs helpers", () => {
  test("importHelpers", () => {
    const fn1 = () => "val";
    const fromObject = importHelpers({ fn1 });
    expect(Array.isArray(fromObject)).toEqual(true);
    expect(fromObject).toHaveLength(1);
    expect(fromObject[0].name).toEqual("fn1");
    expect(fromObject[0].handler).toEqual(fn1);
  });
});
