import { OutputResult } from "@/types";

export function getResultText(result: OutputResult, index?: number): string {
  if (typeof index === "number" && index > 0) {
    const arr = result?.options || [];
    const val = arr[index];
    return val[0]?.text || "";
  }

  return result.content[0]?.text || "";
}
