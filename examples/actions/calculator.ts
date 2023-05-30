const Parser = require("expr-eval").Parser;

export const useCalculatorCallable = {
  name: "use_calculator",
  description: "When you need to perform math",
  input:
    "Must be a valid mathematical expression that could be executed by a simple calculator.",
  handler: performMath,
};

function performMath(_input: any) {
  try {
    return {
      result: Parser.evaluate(_input.input).toString(),
      attributes: {},
    };
  } catch (error) {
    return {
      result: "unable to evaluate",
      attributes: {},
    };
  }
}
