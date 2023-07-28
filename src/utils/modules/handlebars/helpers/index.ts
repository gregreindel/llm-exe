import { get } from "@/utils";
import { schemaExampleWith } from "../../json-schema-filter";

export function getKeyOr(this: any, key: string, arg2: any) {
  const res = get(this, key);
  return typeof res !== "undefined" && res !== "" ? res : arg2;
}

export function getOr(this: any, arg1: string, arg2: string) {
  return typeof arg1 !== "undefined" && arg1 !== "" ? arg1 : arg2;
}

export function indentJson(
  this: any,
  arg1: Record<string, any>,
  collapse = 'false'
) {
  if (typeof arg1 !== "object") {
    return arg1;
  }

  if (collapse == 'true') {
    return JSON.stringify(arg1);
  }

  return JSON.stringify(arg1, null, 2);
}

export function jsonSchemaExample(this: any, key: string, prop: string, collapse: string) {
  const schema = get(this, key);
  if (schema && schema.type) {
    const result = schemaExampleWith(schema, prop);
    if (typeof result !== "object") {
      return "";
    }

    if (collapse == 'true') {
      return JSON.stringify(result);
    }
    
    return JSON.stringify(result, null, 2);
  }
  return "";
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
