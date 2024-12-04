import { importPartials } from "@/utils";

describe("handlebars hbs helpers", () => {
  test("importPartials", () => {
    const fromObject = importPartials({ name: "template", name2: "template2" });
    expect(Array.isArray(fromObject)).toEqual(true);
    expect(fromObject).toHaveLength(2);
    expect(fromObject[0].name).toEqual("name");
    expect(fromObject[0].template).toEqual("template");
    expect(fromObject[1].name).toEqual("name2");
    expect(fromObject[1].template).toEqual("template2");
  });
});
