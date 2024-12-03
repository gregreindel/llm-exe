export function withFn(
    this: any,
    options: any,
    context: any
  ) {
    return options.fn(context);
  }
  