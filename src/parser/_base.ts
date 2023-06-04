import { BaseParserOptions } from "@/types";
import { JSONSchema7 } from "json-schema-to-ts";
import { filterObjectOnSchema } from "@/utils";
import { validate as validateSchema } from "jsonschema"

export interface BaseParser<T> {
  onParseError?(text: string, attributes?: Record<string, any>): any;
}

/**
 * BaseParser is an abstract class for parsing text and enforcing JSON schema on the parsed data.
 */
export abstract class BaseParser<T = any> {
  public name: string;
  public schema: JSONSchema7 | undefined;
  public options = {};
  /**
   * Create a new BaseParser.
   * @param {string} name - The name of the parser.
   * @param  options - options
   */
  constructor(name: string, options?: BaseParserOptions) {
    this.name = name;
    if (options) {
      const { schema, ...restOfOptions } = options;
      this.options = restOfOptions;

      if (schema) {
        this.schema = schema;
      }
    }
  }

  /**
   * Parse the given text and return the parsed data.
   * @abstract
   * @param {string} text - The text to parse.
   * @param {Record<string, any>} [attributes] - Optional attributes to use during parsing.
   * @returns {T} The parsed data.
   */
  abstract parse(text: string, attributes?: Record<string, any>): T;

  /**
   * Enforce the JSON schema on the given parsed data.
   * @param {Record<string, any>} parsed - The parsed data.
   * @returns The parsed data with schema enforced.
   */

  enforceSchema(parsed: Record<string, any>): T {
    /* istanbul ignore next */
    if (!this.schema || !parsed || typeof parsed !== "object") {
      return parsed as T;
    }

    const { schema } = this as any;

    let results = filterObjectOnSchema(schema, parsed);

    const validate = validateSchema(results, this.schema);

    if (validate.errors.length) {
      throw new Error("schema error");
    }

    return results as T;
  }
}
