export function cutFn(
    this: any,
    str: any,
    arg: any
  ) {
    return str.toString().replace(new RegExp(arg, "g"), "");
  }
  