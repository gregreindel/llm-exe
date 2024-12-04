export function assert(
  condition: any,
  message?: string | Error | undefined
): asserts condition {
  if (condition === undefined || condition === null || condition === false) {
    if (typeof message === "string") {
      throw new Error(message);
    } else if (message instanceof Error) {
      throw message;
    } else {
      throw new Error(`Assertion error`);
    }
  }
}
