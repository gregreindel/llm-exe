import { Config, OutputResultsText } from "@/types";

export function OutputDefault(result: any, _config?: Config<any>) {
  const name = _config?.options.model?.default || "unknown";
  const stopReason = result?.stopReason || "stop";

  const content: OutputResultsText[] = [];

  if (result?.text) {
    content.push({ type: "text", text: result.text });
  }

  const usage = {
    output_tokens: result?.output_tokens || 0,
    input_tokens: result?.input_tokens || 0,
    total_tokens: (result?.input_tokens || 0) + (result?.output_tokens || 0),
  };

  return {
    name,
    usage,
    stopReason,
    content,
  };
}
