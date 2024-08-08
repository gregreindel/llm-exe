import { ifFnAsync } from "@/utils/modules/handlebars/helpers/async/if";

interface HandlebarsOptions {
  fn: (context: any) => string;
  inverse: (context: any) => string;
  hash: Record<string, any>;
}

export async function unlessFnAsync(
  this: Record<string, any>,
  conditional: any,
  options: HandlebarsOptions
) {
  if (arguments.length !== 2) {
    throw new Error("#unless requires exactly one argument");
  }
  
  return ifFnAsync.call(this, conditional, {
    fn: options.inverse,
    inverse: options.fn,
    hash: options.hash,
  });
}