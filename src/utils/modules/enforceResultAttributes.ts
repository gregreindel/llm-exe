export function enforceResultAttributes<O>(input: any): {
    result: O;
    attributes: Record<string, any>;
  } {
    if (!input) {
      return { result: input, attributes: {} };
    }
    if (
      typeof input === "object" &&
      ((Object.keys(input).length === 2 &&
        "result" in input &&
        "attributes" in input) ||
        (Object.keys(input).length === 1 &&
          ("result" in input || "attributes" in input)))
    ) {
      return input;
    }
    return { result: input, attributes: {} };
  }
  