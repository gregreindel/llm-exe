import { ExecutorContext } from "@/interfaces";
import { BaseParser } from "../_base";

/**
 * CustomParser class, extending the BaseParser class.
 * @template I The expected type of the input
 * @template O The type of the parsed value (output)
 * @extends {BaseParser<T>}
 */
export class CustomParser<O = any> extends BaseParser<O> {
  /**
   * Custom parsing function.
   * @type {any}
   */
  public parserFn: (text: string, inputValues: ExecutorContext<any, O>) => O;
  /**
   * Creates a new CustomParser instance.
   * @param {string} name The name of the parser.
   * @param {any} parserFn The custom parsing function.
   */
  constructor(
    name: string,
    parserFn: (text: string, inputValues: ExecutorContext<any, O>) => O
  ) {
    super(name);
    this.parserFn = parserFn;
  }
  /**
   * Parses the text using the custom parsing function.
   * @param {string} text The text to be parsed.
   * @param {any} inputValues Additional input values for the parser function.
   * @returns {O} The parsed value.
   */
  parse(text: string, inputValues: ExecutorContext<any, O>): O {
    return this.parserFn.call(this, text, inputValues);
  }
}
