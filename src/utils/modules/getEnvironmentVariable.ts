
export function getEnvironmentVariable(name: string) {
    if (typeof process === "object" && process?.env) {
      return process.env[name];
    } else {
      return undefined;
    }
  }
  