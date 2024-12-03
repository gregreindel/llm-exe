export function registerPartials(partials: any[], instance: typeof Handlebars ) {
    if (partials && Array.isArray(partials)) {
      for (const partial of partials) {
        if (
          partial.name &&
          typeof partial.name === "string" &&
          typeof partial.template === "string"
        ) {
          if(instance){
            instance.registerPartial(partial.name, partial.template);
          }
        }
      }
    }
  }
  