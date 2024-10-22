export function isPromise<T = any>(value: any): value is Promise<T> {
  if (
    typeof value === "object" &&
    value !== null &&
    typeof value.then === "function"
  ) {
    return true;
  }

  return Object.prototype.toString.call(value) === "[object AsyncFunction]";
}
