import { Readable } from "stream";
import { appendContextPath } from "@/utils/modules/handlebars/utils/appendContextPath";
import { blockParams } from "@/utils/modules/handlebars/utils/blockParams";
import { isPromise } from "@/utils/modules/isPromise";
import { createFrame } from "@/utils/modules/handlebars/utils/createFrame";

export async function eachFnAsync(this: any, context: any, options: any) {
  if (!options) {
    throw new Error("Must pass iterator to #each");
  }

  const { fn } = options;
  const { inverse } = options;

  let i = 0;
  let data: {
    key?: any;
    index?: number;
    first?: boolean;
    last?: boolean;
    contextPath?: string;
  } = {};

  let ret: ((...args: any[]) => Promise<any>)[] = [];
  let contextPath = "";

  if (options.data && options.ids) {
    contextPath = `${appendContextPath(
      options.data.contextPath,
      options.ids[0]
    )}.`;
  }

  if (typeof context === "function") {
    context = context.call(this);
  }

  if (options.data) {
    data = createFrame(options.data);
  }

  async function execIteration(
    field: string | number,
    index: number,
    last?: boolean
  ) {
    if (data) {
      data.key = field;
      data.index = index;
      data.first = index === 0;
      data.last = !!last;

      if (contextPath) {
        data.contextPath = contextPath + field;
      }
    }

    ret.push(
      await fn(context[field], {
        data,
        blockParams: blockParams(
          [context[field], field],
          [contextPath + field, null]
        ),
      })
    );
  }

  if (context && typeof context === "object") {
    if (isPromise(context)) {
      context = await context;
    }
    if (Array.isArray(context)) {
      for (let j = context.length; i < j; i++) {
        if (i in context) {
          await execIteration(i, i, i === context.length - 1);
        }
      }
    } else if (global.Symbol && context[global.Symbol.iterator]) {
      const newContext = [],
        iterator = context[global.Symbol.iterator]();
      for (let it = iterator.next(); !it.done; it = iterator.next()) {
        newContext.push(it.value);
      }
      context = newContext;
      for (let j = context.length; i < j; i++) {
        await execIteration(i, i, i === context.length - 1);
      }
    } else if (context instanceof Readable) {
      const newContext: any[] = [];
      await new Promise((resolve, reject) => {
        context
          .on("data", (item: any) => {
            newContext.push(item);
          })
          .on("end", async () => {
            context = newContext;
            for (let j = context.length; i < j; i++) {
              await execIteration(i, i, i === context.length - 1);
            }
            resolve(true);
          })
          .once("error", (e: any) => reject(e));
      });
    } else {
      let priorKey;

      for (const key of Object.keys(context)) {
        // We're running the iterations one step out of sync so we can detect
        // the last iteration without have to scan the object twice and create
        // an itermediate keys array.
        if (priorKey !== undefined) {
          await execIteration(priorKey, i - 1);
        }
        priorKey = key;
        i++;
      }
      if (priorKey !== undefined) {
        await execIteration(priorKey, i - 1, true);
      }
    }
  }

  if (i === 0) {
    ret = inverse(this);
    ret = [inverse(this)];
  }

  return ret.join("");
}


// module.exports = (handlebars: any) => {
//   handlebars.registerHelper(
//     "each",
//     async function (this: any, context: any, options: any) {
//       if (!options) {
//         throw new Error("Must pass iterator to #each");
//       }

//       const { fn } = options;
//       const { inverse } = options;

//       let i = 0;
//       let data: {
//         key?: any;
//         index?: number;
//         first?: boolean;
//         last?: boolean;
//         contextPath?: string;
//       } = {};

//       let ret: ((...args: any[]) => Promise<any>)[] = [];
//       let contextPath = "";

//       if (options.data && options.ids) {
//         contextPath = `${appendContextPath(
//           options.data.contextPath,
//           options.ids[0]
//         )}.`;
//       }

//       if (typeof context === "function") {
//         context = context.call(this);
//       }

//       if (options.data) {
//         data = createFrame(options.data);
//       }

//       async function execIteration(
//         field: string | number,
//         index: number,
//         last?: boolean
//       ) {
//         if (data) {
//           data.key = field;
//           data.index = index;
//           data.first = index === 0;
//           data.last = !!last;

//           if (contextPath) {
//             data.contextPath = contextPath + field;
//           }
//         }

//         ret.push(
//           await fn(context[field], {
//             data,
//             blockParams: blockParams(
//               [context[field], field],
//               [contextPath + field, null]
//             ),
//           })
//         );
//       }

//       if (context && typeof context === "object") {
//         if (isPromise(context)) {
//           context = await context;
//         }
//         if (Array.isArray(context)) {
//           for (let j = context.length; i < j; i++) {
//             if (i in context) {
//               await execIteration(i, i, i === context.length - 1);
//             }
//           }
//         } else if (global.Symbol && context[global.Symbol.iterator]) {
//           const newContext = [],
//             iterator = context[global.Symbol.iterator]();
//           for (let it = iterator.next(); !it.done; it = iterator.next()) {
//             newContext.push(it.value);
//           }
//           context = newContext;
//           for (let j = context.length; i < j; i++) {
//             await execIteration(i, i, i === context.length - 1);
//           }
//         } else if (context instanceof Readable) {
//           const newContext: any[] = [];
//           await new Promise((resolve, reject) => {
//             context
//               .on("data", (item: any) => {
//                 newContext.push(item);
//               })
//               .on("end", async () => {
//                 context = newContext;
//                 for (let j = context.length; i < j; i++) {
//                   await execIteration(i, i, i === context.length - 1);
//                 }
//                 resolve(true);
//               })
//               .once("error", (e: any) => reject(e));
//           });
//         } else {
//           let priorKey;

//           for (const key of Object.keys(context)) {
//             // We're running the iterations one step out of sync so we can detect
//             // the last iteration without have to scan the object twice and create
//             // an itermediate keys array.
//             if (priorKey !== undefined) {
//               await execIteration(priorKey, i - 1);
//             }
//             priorKey = key;
//             i++;
//           }
//           if (priorKey !== undefined) {
//             await execIteration(priorKey, i - 1, true);
//           }
//         }
//       }

//       if (i === 0) {
//         ret = inverse(this);
//         ret = [inverse(this)];
//       }

//       return ret.join("");
//     }
//   );
// };
