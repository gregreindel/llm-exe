import { get } from "@/utils";

export function __getDialogueHistory(
  this: any,
  key: string = "defaultDialogue"
) {
  return get(this, key, []);
}

export function pluralize(
  this: any,
  arg1: `${string}|${string}`,
  arg2: number
) {
  const [singular, plural] = arg1.split("|");
  return arg2 > 1 ? plural : singular;
}

export function eq(
  this: any,
  arg1: string = "",
  arg2: string = "",
  options: any
) {
  const isArr = arg2
    .toString()
    .split(",")
    .map((a) => a.trim());
  return isArr.includes(arg1) ? options.fn(this) : options.inverse(this);
}

export function neq(
  this: any,
  arg1: string = "",
  arg2: string = "",
  options: any
) {
  const isArr = arg2
    .toString()
    .split(",")
    .map((a) => a.trim());
  return !isArr.includes(arg1) ? options.fn(this) : options.inverse(this);
}

export function ifCond(
  this: any,
  v1: string,
  operator: string,
  v2: string,
  options: any
) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
}

export function objectToList(
  this: Record<string, string>,
  arg: Record<string, string> = {}
) {
  return Object.keys(arg)
    .map((key) => `- ${key}: ${arg[key]}`)
    .join("\n");
}

export function join(array: string[]) {
  if (typeof array === "string") return array;
  if (!Array.isArray(array)) return "";
  return array.join(", ");
}
