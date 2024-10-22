export function extend(
    obj: Record<string, any>,
    _source?: Record<string, any>
  ) {
    for (let i = 1; i < arguments.length; i++) {
      for (const key in arguments[i]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i], key)) {
          obj[key] = arguments[i][key];
        }
      }
    }
    return obj;
  }
  