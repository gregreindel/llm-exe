export function convertDotNotation(
  obj: Record<string, any>
): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (key.includes(".")) {
        const keys = key.split(".");
        let currentLevel = result;

        for (let i = 0; i < keys.length; i++) {
          if (i === keys.length - 1) {
            currentLevel[keys[i]] = obj[key];
          } else {
            currentLevel[keys[i]] = currentLevel[keys[i]] || {};
            currentLevel = currentLevel[keys[i]];
          }
        }
      } else {
        result[key] = obj[key];
      }
    }
  }

  return result;
}
