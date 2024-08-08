import { isEmpty } from "@/utils/modules/isEmpty";
import { isPromise } from "@/utils/modules/isPromise";

interface HandlebarsOptions {
  fn: (context: any) => string;
  inverse: (context: any) => string;
  hash: Record<string, any>;
}

// interface HandlebarsInstance {
//   registerHelper: (name: string, fn: Function) => void;
//   helpers: Record<string, Function>;
// }



export async function ifFnAsync (
  this: Record<string, any>,
  conditional: any,
  options: HandlebarsOptions
) {
  if (arguments.length !== 2) {
    throw new Error("#if requires exactly one argument");
  }
  if (typeof conditional === "function") {
    conditional = conditional.call(this);
  } else if (isPromise(conditional)) {
    conditional = await conditional;
  }

  // Default behavior is to render the positive path if the value is truthy and not empty.
  // The `includeZero` option may be set to treat the conditional as purely not empty based on the
  // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
  if ((!options.hash.includeZero && !conditional) || isEmpty(conditional)) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
}


// module.exports = (handlebars: HandlebarsInstance) => {
//   handlebars.registerHelper(
//     "if",
//     async function (
//       this: Record<string, any>,
//       conditional: any,
//       options: HandlebarsOptions
//     ) {
//       if (arguments.length !== 2) {
//         throw new Error("#if requires exactly one argument");
//       }
//       if (typeof conditional === "function") {
//         conditional = conditional.call(this);
//       } else if (isPromise(conditional)) {
//         conditional = await conditional;
//       }

//       // Default behavior is to render the positive path if the value is truthy and not empty.
//       // The `includeZero` option may be set to treat the conditional as purely not empty based on the
//       // behavior of isEmpty. Effectively this determines if 0 is handled by the positive path or negative.
//       if ((!options.hash.includeZero && !conditional) || isEmpty(conditional)) {
//         return options.inverse(this);
//       } else {
//         return options.fn(this);
//       }
//     }
//   );
// };
