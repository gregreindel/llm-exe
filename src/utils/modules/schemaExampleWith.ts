import { filterObjectOnSchema } from "./filterObjectOnSchema";

export function schemaExampleWith(schema: any, property: string) {
    if (schema.type === "array") {
      return filterObjectOnSchema(schema, [{}], undefined, property);
    }
    return filterObjectOnSchema(schema, {}, undefined, property);
  }
  