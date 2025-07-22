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
  
  // Handle multiple parts directly
  const content: any[] = [];
  const { parts = [] } = _content?.content || {};
  
  if (parts.length > 1) {
    // Multiple parts - handle directly
    for (const part of parts) {
      if (part.functionCall) {
        content.push({
          type: "function_use",
          name: part.functionCall.name,
          input: JSON.parse(part.functionCall.args),  // Parse the JSON string
        });
      } else if (part.text) {
        content.push({
          type: "text",
          text: part.text,
        });
      }
    }
  } else {
    // Single part - use existing formatContent
    const singleContent = formatContent(_content, formatResult);
    content.push(...singleContent);
  }
  
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