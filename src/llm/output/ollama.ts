import { combineJsonl } from "./_utils/combineJsonl";
import { BaseLlmOutput2 } from "./base";
import { OllamaResponse } from "@/types";

export function OutputOllamaChat(result: string, _config?: { model?: string }) {
  const combined = combineJsonl<OllamaResponse>(result);

  const id = `${combined.result.model}.${combined.result.created_at}`;
  const name = combined.result.model || _config?.model || "ollama.unknown";
  const created = new Date(`${combined.result.created_at}`).getTime();

  const stopReason = `${combined?.result?.done_reason || "stop"}`;
  const content = [combined.content];

  const usage = {
    output_tokens: 0,
    input_tokens: 0,
    total_tokens: 0,
  };

  return BaseLlmOutput2({
    id,
    name,
    created,
    usage,
    stopReason,
    content,
    options: [],
  });
}
