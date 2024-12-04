import { isUndefined } from "../../isUndefined";
import { isNull } from "../../isNull";

export function removeEmptyFromObject<T extends Record<string, any>>(
    obj: T
  ): T {
    if(typeof obj !== "object" || obj === null) {
        throw new Error("invalid object");
    }

    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => !isNull(v) && !isUndefined(v))
    ) as T;
  }