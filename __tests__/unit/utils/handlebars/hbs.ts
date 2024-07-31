

import { 
    importPartials,
    importHelpers,
    registerPartials,
    registerHelpers,
    hbs
 } from "@/utils";


describe('handlebars hbs helpers', () => {
    test('hbs', () => {
      expect(hbs).toHaveProperty("helpers");
      expect(hbs).toHaveProperty("partials");
      expect(hbs).toHaveProperty("VERSION");
      expect(hbs.VERSION).toEqual("4.7.8");
    });

    test('importPartials', () => {
        const fromObject = importPartials({name: "template", name2: "template2"})
        expect(Array.isArray(fromObject)).toEqual(true);
        expect(fromObject).toHaveLength(2);
        expect(fromObject[0].name).toEqual("name");
        expect(fromObject[0].template).toEqual("template");
        expect(fromObject[1].name).toEqual("name2");
        expect(fromObject[1].template).toEqual("template2");
      });

      test('registerPartials', () => {
        registerPartials([{name: "template1", template: "template-content"}])
        expect(hbs.partials["template1"]).toEqual("template-content")
      });
      
      test('importHelpers', () => {
        const fn1 =  () => "val"
        const fromObject = importHelpers({fn1})
        expect(Array.isArray(fromObject)).toEqual(true);
        expect(fromObject).toHaveLength(1);
        expect(fromObject[0].name).toEqual("fn1");
        expect(fromObject[0].handler).toEqual(fn1);
      });

      test('registerHelpers', () => {
        const fn1 =  () => "val"
        registerHelpers([{name: "helper1", handler: fn1}])
        expect(hbs.helpers["helper1"]).toBeDefined()
      });
});
