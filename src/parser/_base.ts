import { BaseParserOptions, BaseParserOptionsWithSchema, OutputResultContent } from "@/types";
import { FromSchema, JSONSchema } from "json-schema-to-ts";

/**
 * BaseParser is an abstract class for parsing text and enforcing JSON schema on the parsed data.
 */
export abstract class BaseParser<T = any> {
  public name: string;
  public options: BaseParserOptions;
  public target: "text" | "function_call" = "text";
  /**
   * Create a new BaseParser.
   * @param name - The name of the parser.
   * @param  options - options
   */
  constructor(
    name: string,
    options: BaseParserOptions = {},
    target: "text" | "function_call" = "text"
  ) {
    this.name = name;
    this.target = target;
    if (options) {
      this.options = options;
    }
  }

  /**
   * Parse the given text and return the parsed data.
   * @abstract
   * @param text - The text to parse.
   * @param [attributes] - Optional attributes to use during parsing.
   * @returns The parsed data.
   */
  abstract parse(text: string | OutputResultContent[], attributes?: Record<string, any>): T;
}

export abstract class BaseParserWithJson<
  S extends JSONSchema | undefined = undefined,
  T = S extends JSONSchema ? FromSchema<S> : Record<string, any>
> extends BaseParser<T> {
  public schema: S;
  public validateSchema: boolean;
  /**
   * Create a new BaseParser.
   * @param name - The name of the parser.
   * @param  options - options
   */
  constructor(name: string, options: BaseParserOptionsWithSchema<S>) {
    super(name);

    const { schema, validateSchema } = options;
    this.validateSchema = !!validateSchema;

    if (schema) {
      this.schema = schema;
    }
  }
}
