export function deepClone<T>(obj: T): T {
  // Handle null or undefined
  if (obj === null || obj === undefined) return obj;

  // Handle Date
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  // Handle Array
  if (Array.isArray(obj)) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  // Handle Object
  if (typeof obj === "object" && obj !== null) {
    const cloneObj: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloneObj[key] = deepClone((obj as { [key: string]: any })[key]);
      }
    }
    return cloneObj as T;
  }

  // Handle primitive types (number, string, boolean, symbol, bigint, function)
  return obj;
}