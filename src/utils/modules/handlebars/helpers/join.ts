export function join(array: string[]) {
  if (typeof array === "string") return array;
  if (!Array.isArray(array)) return "";
  return array.join(", ");
}
