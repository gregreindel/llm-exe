import { ifFn } from "./if";

export function unless(this: any, conditional: any, options: any) {
    if (arguments.length !== 2) {
      throw new Error("#unless requires exactly one argument");
    }
    
    return ifFn.call(this, conditional, {
      fn: options.inverse,
      inverse: options.fn,
      hash: options.hash,
    });
  }