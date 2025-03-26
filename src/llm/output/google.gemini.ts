import {
  GoogleGeminiResponse,
  OutputGoogleGeminiChatChoice,
  OutputResultContent,
} from "@/types";
import { BaseLlmOutput2 } from "./base";
import { formatContent, formatOptions } from "./_util";

function formatResult(
  result: OutputGoogleGeminiChatChoice
): OutputResultContent | undefined {
  const { parts = [] } = result?.content || {};

  if (parts.length === 1) {
    const answer = parts[0];
    if (!!answer?.functionCall && typeof answer?.functionCall === "object") {
      return {
        type: "function_use",
        name: answer.functionCall.name,
        input: JSON.parse(answer.functionCall.args),
      };
    } else {
      return {
        type: "text",
        text: answer.text,
      };
    }
  }

  // error??
  return {
    type: "text",
    text: "",
  };
}

export function OutputGoogleGeminiChat(
  result: GoogleGeminiResponse,
  _config?: { model?: string }
) {
  const id = "result.id";
  const name = result.modelVersion;
  const created = new Date().getTime();

  const [_content, ..._options] = result?.candidates || [];
  const stopReason = _content?.finishReason;
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
