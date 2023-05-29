import { ObjectArray, PlainObject } from "@/interfaces";
import { asConst } from "json-schema-to-ts";
import { Narrow } from "json-schema-to-ts/lib/types/type-utils";

import get from "lodash.get";
import set from "lodash.set";
import pick from "lodash.pick";

import { v4 as uuidv4 } from "uuid";
export { uuidv4 as uuid };
export { get, set, pick };

export { filterObjectOnSchema } from "./json-schema-filter";
export { replaceTemplateString } from "./replaceTemplateString";
export { asyncCallWithTimeout } from "./asyncCallWithTimeout";
export {
  maybeStringifyJSON,
  maybeParseJSON,
  isObjectStringified,
} from "./json";

export function assert(
  condition: any,
  message?: string | Error | undefined
): asserts condition {
  if (condition === undefined || condition === null || condition === false) {
    if (typeof message === "string") {
      throw new Error(message);
    } else if (message instanceof Error) {
      throw message;
    } else {
      throw new Error(`Assertion error`);
    }
  }
}

export const chunkArray = (arr: any[], chunkSize: number) =>
  arr.reduce((chunks, elem, index) => {
    const chunkIndex = Math.floor(index / chunkSize);
    const chunk = chunks[chunkIndex] || [];
    chunks[chunkIndex] = chunk.concat([elem]);
    return chunks;
  }, []);

export function defineSchema<T>(obj: Narrow<T>) {
  (obj as any).additionalProperties = false;
  return asConst(obj);
}

export function enforceResultAttributes<O>(input: any): {
  result: O;
  attributes: {};
} {
  if (!input) {
    return { result: input, attributes: {} };
  }
  if (
    typeof input === "object" &&
    ((Object.keys(input).length === 2 &&
      "result" in input &&
      "attributes" in input) ||
      (Object.keys(input).length === 1 &&
        ("result" in input || "attributes" in input)))
  ) {
    return input;
  }
  return { result: input, attributes: {} };
}

export function ensureInputIsObject<T extends ObjectArray>(
  input: T
): { input: T };
export function ensureInputIsObject<T>(input: number[]): { input: number[] };
export function ensureInputIsObject<T>(input: string[]): { input: string[] };
export function ensureInputIsObject<T>(input: string): { input: string };
export function ensureInputIsObject<T>(input: number): { input: number };
export function ensureInputIsObject<T extends PlainObject>(input: T): T;
export function ensureInputIsObject<T>(input: any): PlainObject | { input: T } {
  if (input === null || typeof input === "undefined") {
    return { input: input };
  }
  switch (typeof input) {
    case "object": {
      if (Array.isArray(input)) {
        return { input: input };
      }
      return input;
    }
    default:
      return { input: input };
  }
}
export function inferFunctionName(func: any, defaultName: string) {
  const name = func?.name;
  if (name && typeof name === "string") {
    if (name.substring(0, 6) === "bound ") {
      return name.replace("bound ", "");
    } else {
      return name;
    }
  }
  var result = /^function\s+([\w\$]+)\s*\(/.exec(func.toString());
  return result ? result[1] : defaultName;
}

export function removeEmptyFromObject<T extends Record<string, any>>(
  obj: T
): T {
  assert(typeof obj === "object", "invalid object");
  return Object.fromEntries(
    Object.entries(obj).filter(([_, v]) => !isNull(v) && !isUndefined(v))
  ) as T;
}

export function generateUniqueNameId(prefix = "", suffix = "") {
  //https://stackoverflow.com/questions/6248666/how-to-generate-short-uid-like-ax4j9z-in-js
  const _firstPart = (Math.random() * 46656) | 0;
  const _secondPart = (Math.random() * 46656) | 0;
  const firstPart = ("000" + _firstPart.toString(36)).slice(-3);
  const secondPart = ("000" + _secondPart.toString(36)).slice(-3);
  return `${prefix}${firstPart}${secondPart}${suffix}`;
}

export function isNull(value: any): boolean {
  return Object.is(value, null);
}

export function isUndefined(value: any): boolean {
  return value === undefined || typeof value === undefined;
}

export function isFinite(value: any): boolean {
  return typeof value === "number" && Number.isFinite(value);
}

export function toNumber(value: any): number {
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    return Number(value);
  }
  return NaN;
}
