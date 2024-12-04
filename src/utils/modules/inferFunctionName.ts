export function inferFunctionName(func: any, defaultName: string) {
    const name = func?.name;
    if (name && typeof name === "string") {
      if (name.substring(0, 6) === "bound ") {
        return name.replace("bound ", "");
      } else {
        return name;
      }
    }
    var result = /^function\s+([\w\$]+)\s*\(/.exec(func.toString());
    /* istanbul ignore next */
    return result ? result[1] : defaultName;
  }
  