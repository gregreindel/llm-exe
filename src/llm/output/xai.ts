import {
  XAiResponse,
  OutputOpenAIChatChoice,
  OutputResultContent,
} from "@/types";
import { BaseLlmOutput2 } from "./base";
import { formatContent, formatOptions } from "./_util";

function formatResult(
  result: OutputOpenAIChatChoice
): OutputResultContent | undefined {
  if (typeof result?.message?.content === "string") {
    return {
      type: "text",
      text: result.message.content,
    };
  } else if (result?.message && "tool_calls" in result.message) {
    const tool_calls = result.message.tool_calls;
    if (tool_calls) {
      for (const call of tool_calls) {
        return {
          functionId: call.id,
          type: "function_use",
          name: call.function.name,
          input: JSON.parse(call.function.arguments),
        };
      }
    }
  }
  // error??
  return {
    type: "text",
    text: "",
  };
}

export function OutputXAIChat(
  result: XAiResponse,
  _config?: { model?: string }
) {
  const id = result.id;
  const name = result?.model;
  const created = result.created;

  const [_content, ..._options] = result?.choices || [];
  const stopReason = _content?.finish_reason;
  const content = formatContent(_content, formatResult);
  const options = formatOptions(_options, formatResult);

  const usage = {
    output_tokens: result?.usage?.completion_tokens,
    input_tokens: result?.usage?.prompt_tokens,
    total_tokens: result?.usage?.total_tokens,
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
