import { BaseLlmOutput2 } from "./base";

import {
  Claude3Response,
  OutputResultContent,
  OutputResultsFunction,
  OutputResultsText,
} from "@/types";

function formatResult(response: Claude3Response): OutputResultContent[] {
  const content = response?.content || [];
  const out = [];
  for (let i = 0; i < content.length; i++) {
    const result = content[i];
    if (result.type === "text") {
      out.push({
        type: "text",
        text: result.text,
      } as OutputResultsText);
    } else if (result.type === "tool_use") {
      out.push({
        type: "function_use",
        name: result.name,
        input: result.input,
      } as OutputResultsFunction);
    }
  }
  return out;
}

export function OutputAnthropicClaude3Chat(result: Claude3Response) {
  const id = result.id;
  const name = result.model;
  const stopReason = result.stop_reason;
  const content = formatResult(result);
  const usage = {
    input_tokens: result?.usage?.input_tokens,
    output_tokens: result?.usage?.output_tokens,
    total_tokens: result?.usage?.input_tokens + result?.usage?.input_tokens,
  };

  return BaseLlmOutput2({
    id,
    name,
    usage,
    stopReason,
    content,
  });
}
