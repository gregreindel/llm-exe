import { BaseLlmOutput2 } from "./base";
import { MetaLlama2Response, OutputResultsText } from "@/types";

export function OutputMetaLlama3Chat(result: MetaLlama2Response) {
  const name = "result.model";

  const stopReason = result.stop_reason;

  const content: OutputResultsText[] = [
    { type: "text", text: result.generation },
  ];

  const usage = {
    output_tokens: result?.generation_token_count,
    input_tokens: result?.prompt_token_count,
    total_tokens: result?.generation_token_count + result?.prompt_token_count,
  };

  return BaseLlmOutput2({
    name,
    usage,
    stopReason,
    content,
  });
}
