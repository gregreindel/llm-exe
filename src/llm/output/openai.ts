import {
  OpenAiResponse,
  OutputOpenAIChatChoice,
  OutputResultContent,
} from "@/types";
import { BaseLlmOutput2 } from "./base";
import { formatOptions } from "./_util";

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
    for (const call of tool_calls) {
      return {
        // CURRENT BUG: Returns only first tool call!
        type: "function_use",
        name: call.function.name,
        input: JSON.parse(call.function.arguments),
      };
    }
  }
  // error??
  return {
    type: "text",
    text: "",
  };
}

export function OutputOpenAIChat(
  result: OpenAiResponse,
  _config?: { model?: string }
) {
  const id = result.id;
  const name = result.model || _config?.model || "openai.unknown";
  const created = result.created;

  const [_content, ..._options] = result?.choices || [];
  const stopReason = _content?.finish_reason;

  // FIX: Build content array directly to handle ALL tool calls
  const content: OutputResultContent[] = [];

  // Check for tool calls FIRST
  if (
    _content?.message?.tool_calls &&
    Array.isArray(_content.message.tool_calls)
  ) {
    // Handle ALL tool calls by looping through them
    for (const call of _content.message.tool_calls) {
      // Validation: ensure required fields exist
      if (!call.function?.name) {
        throw new Error(
          `Invalid tool call from OpenAI: missing function name in ${JSON.stringify(call)}`
        );
      }

      // Parse arguments - throw on invalid JSON
      let parsedInput;
      try {
        parsedInput = JSON.parse(call.function.arguments);
      } catch (e) {
        throw new Error(
          `Invalid tool call from OpenAI: malformed JSON arguments in function "${call.function.name}": ${call.function.arguments}`
        );
      }

      const functionUse: any = {
        type: "function_use",
        name: call.function.name,
        input: parsedInput,
      };

      // Only add tool_call_id if present
      if (call.id) {
        functionUse.tool_call_id = call.id;
      }

      content.push(functionUse);
    }
  } else if (_content?.message?.content) {
    // No tool calls, just regular text content
    content.push({
      type: "text",
      text: _content.message.content,
    });
  }

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
