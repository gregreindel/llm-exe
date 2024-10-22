export function getOr(this: any, arg1: string, arg2: string) {
  return typeof arg1 !== "undefined" && arg1 !== "" ? arg1 : arg2;
}
