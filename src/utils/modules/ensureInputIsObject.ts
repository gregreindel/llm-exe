import { ObjectArray, PlainObject } from "@/interfaces";

/**
 * Coerces non-object inputs into a `{ input: value }` envelope so that
 * prompt templates and handlers that expect an object can still receive
 * primitives, arrays, `null`, and `undefined` without additional wrapping.
 *
 * - Plain objects pass through unchanged.
 * - Arrays, strings, numbers, `null`, and `undefined` are wrapped as
 *   `{ input: value }`.
 *
 * Used internally by {@link BaseExecutor.getHandlerInput} and by tool/function
 * callables, which forward raw string arguments from tool calls into an
 * executor. `BaseExecutor.execute` guards against `null`/`undefined`
 * before this helper is reached.
 */
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
