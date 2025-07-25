import { OutputResult } from "@/types";
import { isOutputResultContentText } from "@/utils/guards";

export function getResultText(result: OutputResult, index?: number): string {
  if (typeof index === "number" && index > 0) {
    const arr = result?.options || [];
    const val = arr[index];
    return isOutputResultContentText(val?.[0]) ? val[0]?.text : "";
  }

  return isOutputResultContentText(result?.content?.[0])
    ? result.content[0]?.text
    : "";
}
