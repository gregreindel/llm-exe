import { GoogleGeminiResponse } from "@/types";
import { BaseLlmOutput2 } from "../base";
import { formatContent, formatOptions } from "../_util";
import { formatResult } from "./formatResult";

export function OutputGoogleGeminiChat(
  result: GoogleGeminiResponse,
  _config?: { model?: string }
) {
  const id = "result.id";
  const name = result.modelVersion;
  const created = new Date().getTime();

  const [_content, ..._options] = result?.candidates || [];
  const stopReason = _content?.finishReason?.toLowerCase();
  const content = formatContent(_content, formatResult);
  const options = formatOptions(_options, formatResult);

  const usage = {
    output_tokens: result?.usageMetadata?.candidatesTokenCount,
    input_tokens: result?.usageMetadata?.promptTokenCount,
    total_tokens: result?.usageMetadata?.totalTokenCount,
  };

  return BaseLlmOutput2({
    id,
    name,
    created,
    usage,
    stopReason,
    content,
    options,
  });
}
