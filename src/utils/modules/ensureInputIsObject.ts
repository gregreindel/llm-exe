import { ObjectArray, PlainObject } from "@/interfaces";

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
