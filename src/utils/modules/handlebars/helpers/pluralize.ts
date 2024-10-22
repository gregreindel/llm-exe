export function pluralize(
  this: any,
  arg1: `${string}|${string}`,
  arg2: number
) {
  const [singular, plural] = arg1.split("|");
  return arg2 > 1 ? plural : singular;
}
