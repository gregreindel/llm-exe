import { OutputResultContent } from "@/interfaces";

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
  throw new Error("Invalid response");
}