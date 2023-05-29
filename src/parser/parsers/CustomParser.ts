import { ExecutorContext } from "@/interfaces";
import { BaseParser } from "../_base";

/**
 * CustomParser class, extending the BaseParser class.
 * @template T The type of the parsed value
 * @extends {BaseParser<T>}
 */
export class CustomParser<T, A> extends BaseParser<T> {
  /**
   * Custom parsing function.
   * @type {any}
   */
  public parserFn: (text: string, inputValues: ExecutorContext<A, T>) => T;
  /**
   * Creates a new CustomParser instance.
   * @param {string} name The name of the parser.
   * @param {any} parserFn The custom parsing function.
   */
  constructor(
    name: string,
    parserFn: (text: string, inputValues: ExecutorContext<A, T>) => T
  ) {
    super(name);
    this.parserFn = parserFn;
  }
  /**
   * Parses the text using the custom parsing function.
   * @param {string} text The text to be parsed.
   * @param {any} inputValues Additional input values for the parser function.
   * @returns {T} The parsed value.
   */
  parse(text: string, inputValues: ExecutorContext<A, T>): T {
    return this.parserFn.call(this, text, inputValues);
  }
}
