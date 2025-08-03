import {
  XAiResponse,
  OutputOpenAIChatChoice,
  OutputResultContent,
  Config,
} from "@/types";
import { formatOptions } from "./_util";
import { maybeParseJSON } from "@/utils";

function formatResult(result: OutputOpenAIChatChoice): OutputResultContent[] {
  const out: OutputResultContent[] = [];

  if (typeof result?.message?.content === "string") {
    out.push({
      type: "text",
      text: result.message.content,
    });
  }

  if (result?.message?.tool_calls) {
    for (const call of result.message.tool_calls) {
      out.push({
        functionId: call.id,
        type: "function_use",
        name: call.function.name,
        input: maybeParseJSON(call.function.arguments),
      });
    }
  }

  return out;
}

export function OutputXAIChat(result: XAiResponse, _config?: Config<any>) {
  const id = result.id;
  const name =
    result.model || _config?.options.model?.default || "openai.unknown";
  const created = result.created;

  const [_content, ..._options] = result?.choices || [];

  const stopReason = _content?.finish_reason;
  const content = formatResult(_content);
  const options = formatOptions(_options, formatResult);

  const usage = {
    output_tokens: result?.usage?.completion_tokens,
    input_tokens: result?.usage?.prompt_tokens,
    total_tokens: result?.usage?.total_tokens,
  };

  return {
    id,
    name,
    created,
    usage,
    stopReason,
    content,
    options,
  };
}
