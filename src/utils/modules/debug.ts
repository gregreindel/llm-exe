import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";

export function debug(...args: any[]) {
  const debugValue = getEnvironmentVariable("LLM_EXE_DEBUG");

  const logs = [];

  for (const arg of args) {
    if (arg && typeof arg === "object") {
      if (arg instanceof Error) {
        // nothing
      } else if (arg instanceof Array) {
        logs.push(arg.map((item) => JSON.stringify(item, null, 2)));
      } else if (arg instanceof Map) {
        logs.push(
          Array.from(arg.entries()).map(
            ([key, value]) => `${key}: ${JSON.stringify(value, null, 2)}`
          )
        );
      } else if (arg instanceof Set) {
        logs.push(Array.from(arg).map((item) => JSON.stringify(item, null, 2)));
      } else if (arg instanceof Date) {
        logs.push(arg.toISOString());
      } else if (arg instanceof RegExp) {
        logs.push(arg.toString());
      } else {
        try {
          logs.push(JSON.stringify(arg, null, 2));
        } catch (error) {
          console.error("Error parsing object:", error);
        }
      }
    } else if (typeof arg === "string") {
      logs.push(arg);
    } else {
      logs.push(arg);
    }
  }
  if (
    typeof debugValue === "string" &&
    debugValue !== "" &&
    debugValue.toLowerCase() !== "undefined" &&
    debugValue.toLowerCase() !== "null"
  ) {
    console.debug(...logs);
  }
}
