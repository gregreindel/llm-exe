import { appendContextPath } from "@/utils/modules/handlebars/utils/appendContextPath";
import { blockParams } from "@/utils/modules/handlebars/utils/blockParams";
import { createFrame } from "@/utils/modules/handlebars/utils/createFrame";
import { isEmpty } from "@/utils/modules/isEmpty";
import { isPromise } from "@/utils/modules/isPromise";


export async function withFnAsync(this: any, context: any, options: any) {
  if (arguments.length !== 2) {
    throw new Error("#with requires exactly one argument");
  }
  if (isPromise(context)) {
    context = await context;
  }

  else if (typeof context === "function") {
    context = context.call(this);
  }

  const { fn } = options;

  if (!isEmpty(context)) {
    let { data } = options;
    if (options.data && options.ids) {
      data = createFrame(options.data);
      data.contextPath = appendContextPath(
        options.data.contextPath,
        options.ids[0]
      );
    }

    return fn(context, {
      data,
      blockParams: blockParams([context], [data && data.contextPath]),
    });
  }
  return options.inverse(this);
}
