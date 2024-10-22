type Path = string | (string | number)[];

export function get<T extends object, D>(
  obj: T,
  path: Path,
  defaultValue?: D
): any {
  if (obj == null || path === "" || Array.isArray(path) && path.length === 0) {
    return defaultValue;
  }

  const pathString: string = Array.isArray(path) ? path.join(".") : path;

  const travel = (regexp: RegExp): any =>
    pathString
      .split(regexp)
      .filter(Boolean)
      .reduce(
        (res: any, key: string | number) =>
          res !== null && res !== undefined
            ? res[key as keyof typeof res]
            : res,
        obj
      );

  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result === null ? defaultValue : result;
}
