import { Config, MetaLlama2Response, OutputResultsText } from "@/types";
import { uuid } from "@/utils/modules/uuid";

export function OutputMetaLlama3Chat(
  result: MetaLlama2Response,
  _config?: Config<any>
) {
  const id = uuid();
  const name = _config?.options?.model?.default || "meta";
  const created = new Date().getTime();
  const stopReason = result.stop_reason;

  const content: OutputResultsText[] = [
    { type: "text", text: result.generation },
  ];

  const usage = {
    output_tokens: result?.generation_token_count,
    input_tokens: result?.prompt_token_count,
    total_tokens: result?.generation_token_count + result?.prompt_token_count,
  };

  return {
    id,
    name,
    created,
    usage,
    stopReason,
    content,
    options: [],
  };
}
