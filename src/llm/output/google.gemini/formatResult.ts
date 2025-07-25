import { OutputGoogleGeminiChatChoice, OutputResultContent } from "@/types";
import { maybeParseJSON } from "@/utils";
import { uuid } from "@/utils/modules/uuid";

export function formatResult(
  result: OutputGoogleGeminiChatChoice,
  id?: string
): OutputResultContent[] {
  const { parts = [] } = result?.content || {};

  const out: OutputResultContent[] = [];
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (typeof part.text === "string") {
      out.push({
        type: "text",
        text: part.text,
      });
    } else if (part?.functionCall) {
      out.push({
        callId: `${id || uuid()}-${i}`,
        type: "function_use",
        name: part.functionCall.name,
        input: maybeParseJSON(part.functionCall.args),
      });
    }
  }

  return out;
}
