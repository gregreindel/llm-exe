export function deepFreeze<T>(obj: T): Readonly<T> {
  // Handle null or undefined
  if (obj === null || obj === undefined) return obj;

  // Prevent redundant freezing
  if (Object.isFrozen(obj)) return obj;

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    obj.forEach((item, index) => {
      obj[index] = deepFreeze(item);
    });
    return Object.freeze(obj) as unknown as T;
  }

  // Handle Object
  if (typeof obj === "object" && obj !== null) {
    for (const key of Object.keys(obj)) {
      (obj as { [key: string]: any })[key] = deepFreeze(
        (obj as { [key: string]: any })[key]
      );
    }
    return Object.freeze(obj) as Readonly<T>;
  }

  // Handle primitive types (number, string, boolean, symbol, bigint, function)
  return obj;
}
