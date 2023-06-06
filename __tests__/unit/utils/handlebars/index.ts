

import { useHandlebars } from "@/utils/modules/handlebars";
import * as path from "path"

describe('useHandlebars', () => {
    test('useHandlebars', () => {
      const hbs = useHandlebars()
      expect(hbs).toHaveProperty("helpers");
      expect(hbs).toHaveProperty("partials");
      expect(hbs).toHaveProperty("VERSION");
      expect(hbs.VERSION).toEqual("4.7.7");
    });
    test('useHandlebars has default templates', () => {
        const hbs = useHandlebars()
        expect(hbs).toHaveProperty("partials");
        expect(hbs.partials).toHaveProperty("MarkdownCode");
        expect(hbs.partials).toHaveProperty("ChatConversationHistory");
        expect(hbs.partials).toHaveProperty("DialogueHistory");
      });
      test('useHandlebars has default helpers', () => {
        const hbs = useHandlebars()
        expect(hbs).toHaveProperty("helpers");
        expect(hbs.helpers).toHaveProperty("eq");
        expect(hbs.helpers).toHaveProperty("neq");
        expect(hbs.helpers).toHaveProperty("ifCond");
        expect(hbs.helpers).toHaveProperty("pluralize");
        expect(hbs.helpers).toHaveProperty("getKeyOr");
      });
      test('useHandlebars with custom helper via config', () => {
        const hbs = useHandlebars({
            helpers: [{
                handler: () => "",
                name: "testHandler"
            }]
        })
        expect(hbs).toHaveProperty("helpers");
        expect(hbs.helpers).toHaveProperty("testHandler");
      });
      test('useHandlebars with custom helper via config doesn\'t register if invalid name', () => {
        const hbs = useHandlebars({
            helpers: [{
                handler: () => "",
                name: 33 as any
            }]
        })
        expect(hbs).toHaveProperty("helpers");
        expect(typeof hbs.helpers["33"]).toEqual("undefined");
      });
      test('useHandlebars with custom helper via config doesn\'t register if invalid template', () => {
        const hbs = useHandlebars({
            helpers: [{
                handler: 12 as any,
                name: "invalidHandler"
            }]
        })
        expect(hbs).toHaveProperty("helpers");
        expect(typeof hbs.helpers["invalidHandler"]).toEqual("undefined");
      });


      test('useHandlebars with custom partial via config', () => {
        const hbs = useHandlebars({
            partials: [{
                template: ``,
                name: "testPartial"
            }]
        })
        expect(hbs).toHaveProperty("partials");
        expect(hbs.partials).toHaveProperty("testPartial");
      });
      test('useHandlebars with custom partial via config doesn\'t register if invalid name', () => {
        const hbs = useHandlebars({
            partials: [{
                template: ``,
                name: 33 as any
            }]
        })
        expect(hbs).toHaveProperty("partials");
        expect(typeof hbs.partials["33"]).toEqual("undefined");
      });
});

describe('useHandlebars', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
      jest.resetModules() // Most important - it clears the cache
      process.env = { ...OLD_ENV }; // Make a copy
    });
  
    afterAll(() => {
      process.env = OLD_ENV; // Restore old environment
    });

    test('useHandlebars registers custom partial from CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH', () => {
        process.env.CUSTOM_PROMPT_TEMPLATE_PARTIALS_PATH = path.join(__dirname, "../../../__data__/handlebars-partials.js")
        const hbs = useHandlebars()
        expect(hbs).toHaveProperty("partials");
        expect(hbs.partials["customImportedPartial"]).toEqual(`this is from external file`);
      });
      test('useHandlebars registers custom helpers from CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH', () => {
        process.env.CUSTOM_PROMPT_TEMPLATE_HELPERS_PATH = path.join(__dirname, "../../../__data__/handlebars-helpers.js")
        const hbs = useHandlebars()
        expect(hbs).toHaveProperty("helpers");
        expect(typeof hbs.helpers["customImportedHelper"]).toEqual(`function`);
      });
});