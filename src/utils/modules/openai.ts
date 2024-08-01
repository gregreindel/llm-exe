import { get } from "@/utils";
import { OpenAIModelName } from "@/types";
import { OpenAiPricing } from "../const";

/**
 * Calculate the API call cost based on input and output tokens.
 * @param input_tokens - The number of input tokens.
 * @param output_tokens=0 - The number of output tokens (defaults to 0).
 * @returns An object for input/output tokens and cost.
 */
export function calculateOpenAiPrice(
  model: OpenAIModelName,
  input_tokens: number,
  output_tokens: number
) {
  const out = {
    input_cost: 0,
    output_cost: 0,
    total_cost: 0,
  };

  const price = get(OpenAiPricing, model, [0, 0, 0]);
  if (price) {
    const [amount, inputAmount, outputAmount] = price;
    if (inputAmount && input_tokens) {
      out["input_cost"] = (input_tokens / amount) * inputAmount;
    }
    if (outputAmount && output_tokens) {
      out["output_cost"] = (output_tokens / amount) * outputAmount;
    }

    out["total_cost"] = out["input_cost"] + out["output_cost"];
  }

  return out;
}
