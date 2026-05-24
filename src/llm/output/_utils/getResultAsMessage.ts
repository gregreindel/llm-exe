import { OutputResultContent } from "@/interfaces";
import { LlmExeError } from "@/errors";

export function getResultAsMessage(content: OutputResultContent[]) {
  if (content.length === 1 && content.every((a) => a.type === "text")) {
    return {
      role: "assistant",
      content: content[0]?.text || "",
    };
  }
  if (content.length === 1 && content.every((a) => a.type === "function_use")) {
    return {
      role: "assistant",
      content: null,
      function_call: JSON.stringify(
        content.find((a) => a.type === "function_use")
      ),
    };
  }
  if (
    content.length === 2 &&
    content.find((a) => a.type === "text") &&
    content.find((a) => a.type === "function_use")
  ) {
    return {
      role: "assistant",
      content: content.find((a) => a.type === "text")?.text,
      function_call: JSON.stringify(
        content.find((a) => a.type === "function_use")
      ),
    };
  }
  throw new LlmExeError("Invalid response", {
    code: "llm.invalid_response_shape",
    context: {
      operation: "getResultAsMessage",
      expected:
        "single text item, single function_use item, or text + function_use pair",
      received: {
        count: content.length,
        types: content.map((a) => a?.type),
      },
      resolution:
        "Check provider response normalization for unexpected content shapes.",
    },
  });
}