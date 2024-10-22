export function eq(
  this: any,
  arg1: string = "",
  arg2: string = "",
  options: any
) {
  const isArr = arg2
    .toString()
    .split(",")
    .map((a) => a.trim());
  return isArr.includes(arg1) ? options.fn(this) : options.inverse(this);
}
