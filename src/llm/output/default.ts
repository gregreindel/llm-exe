import { OutputResultsText } from "@/types";
import { BaseLlmOutput2 } from "@/llm/output/base";

export function OutputDefault(
  result: {
    stopReason?: "stop";
    text: string;
    output_tokens?: number;
    input_tokens?: number;
  },
  _config: { model?: string }
) {
  const name = _config.model || "unknown";
  const stopReason = result?.stopReason || "stop";

  const content: OutputResultsText[] = [];

  if(result?.text){
    content.push({ type: "text", text: result.text })
  }
  
  const usage = {
    output_tokens: result?.output_tokens || 0,
    input_tokens: result?.input_tokens || 0,
    total_tokens: (result?.input_tokens || 0) + (result?.output_tokens || 0),
  };

  return BaseLlmOutput2({
    name,
    usage,
    stopReason,
    content,
  });
}
