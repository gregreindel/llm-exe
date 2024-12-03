export function registerHelpers(helpers: any[], instance: typeof Handlebars) {
    if (helpers && Array.isArray(helpers)) {
      for (const helper of helpers) {
        if (
          helper.name &&
          typeof helper.name === "string" &&
          typeof helper.handler === "function"
        ) {
          if(instance){
            instance.registerHelper(helper.name, helper.handler);
          }
        }
      }
    }
  }
  