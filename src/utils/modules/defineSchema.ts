import { asConst } from "json-schema-to-ts";
import { Narrow } from "json-schema-to-ts/lib/types/type-utils";

export function defineSchema<T>(obj: Narrow<T>) {
    (obj as any).additionalProperties = false;
    return asConst(obj);
  }
  