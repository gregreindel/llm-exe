import { OutputResultContent } from "@/interfaces";

export function getResultText(content: OutputResultContent[]): string {
  if (content.length === 1 && content.every((a) => a.type === "text")) {
    return content[0]?.text || "";
  }

  return "";
}
