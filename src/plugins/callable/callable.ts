import { createCoreExecutor } from "@/executor/_functions";
import { FunctionOrExecutor, PlainObject } from "@/types";
import { ensureInputIsObject, assert, enforceResultAttributes } from "@/utils";
import { BaseExecutor } from "@/executor";
/**
 * Represents the input for a CallableExecutor.
 * @interface CallableExecutorInput
 * @property name - The name of the callable function.
 * @property key - The key for the callable function. Defaults to the name if not provided.
 * @property description - A description of the callable function.
 * @property input - The input for the callable function.
 * @property visibilityHandler - An optional visibility handler for the callable function.
 * @property handler - An optional handler for the callable function.
 */
export interface CallableExecutorInput<
  I extends PlainObject | { input: string },
  O
> {
  name: string;
  key?: string;
  description: string;
  input: string;
  visibilityHandler?(input: any, attributes: any, state: any): boolean;
  handler?: FunctionOrExecutor<I, O>;
  validateInput?(input: I): any
  // ((input: I) => Promise<any> | any) | CoreExecutor<I, O>;
}

/**
 * Represents a CallableExecutor.
 * @interface CallableExecutor
 * @property name - The name of the callable core function.
 * @property key - The key for the callable core function.
 * @property description - A description of the callable core function.
 * @property input - The input for the callable core function.
 * @property visibilityHandler - The visibility handler for the callable core function.
 * @property - The handler for the callable core function.
 */
export interface CallableExecutor<I, O> {
  name: string;
  key: string;
  description: string;
  input: string;
  visibilityHandler(input: any, attributes: any, state: any): boolean;
  _handler: BaseExecutor<I, O>;
  _validateInput?(input: I): any
}

/**
 * A class representing a CallableExecutor.
 * @class CallableExecutor
 */
export class CallableExecutor<I extends PlainObject | { input: string }, O> {
  public name: string;
  public key: string;
  public description: string;
  public input: string;
  public _handler: BaseExecutor<I, O>;
  public _validateInput?(input: I): any

  constructor(options: CallableExecutorInput<I, O>) {
    const defaults = {
      key: options.name,
      visibilityHandler: (_input: any, _attributes: any, _state: any) => true,
    };

    this.name = options.name;
    this.key = options?.key || defaults.key;
    this.description = options.description;
    this.input = options.input;
    this.visibilityHandler =
      options?.visibilityHandler || defaults.visibilityHandler;

      this._validateInput = options.validateInput;
      
    if (options.handler instanceof BaseExecutor) {
      this._handler = options.handler;
    } else if (typeof options.handler === "function") {
      this._handler = createCoreExecutor(options.handler);
    } else {
      throw new Error("Invalid handler");
    }
  }
  async execute(input: I): Promise<{ result: O; attributes: any }> {
    const response = await this._handler.execute(ensureInputIsObject(input));
    return enforceResultAttributes(response);
  }
  async validateInput(input: I): Promise<{ result: boolean; attributes: any }> {
    if(typeof this._validateInput === "function"){
      const response = await this._validateInput(ensureInputIsObject(input));
      return enforceResultAttributes(response);
    }
    return { result: true, attributes: {}}
  }
}

export abstract class UseExecutorsBase<
  I extends PlainObject | { input: string },
  O
> {
  public handlers: CallableExecutor<I, O>[] = [];
  constructor(handlers: CallableExecutor<I, O>[]) {
    this.handlers = handlers;
  }
  hasFunction(name: string): boolean {
    return !!this.getFunction(name);
  }
  getFunction(name: string): CallableExecutor<I, O> | undefined {
    return this.handlers.find((a) => a.name === name);
  }
  getFunctions() {
    return [...this.handlers];
  }
  getVisibleFunctions(_input: any, _attributes?: any) {
    const handlers = this.getFunctions();

    return handlers.filter(
      (a) =>
        typeof a.visibilityHandler === "undefined" ||
        (typeof a.visibilityHandler === "function" &&
          a.visibilityHandler(_input, _attributes, {}))
    );
  }
  async callFunction(
    name: string,
    input: string
  ): Promise<{
    result: any;
    attributes: any;
  }> {
    try {
      const handler = this.getFunction(name);
      assert(
        handler,
        `[invalid handler] The handler (${name}) does not exist.`
      );
      const result = await handler.execute(ensureInputIsObject(input) as any);
      return result;
    } catch (error: any) {
      return error.message;
    }
  }
  async validateFunctionInput(
    name: string,
    input: string
  ){
    try {
      const handler = this.getFunction(name);
      assert(
        handler,
        `[invalid handler] The handler (${name}) does not exist.`
      );
      const result = await handler.execute(ensureInputIsObject(input) as any);
      return result;
    } catch (error: any) {
      return error.message;
    }
  }
}
