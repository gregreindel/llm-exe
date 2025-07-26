import { OutputResult, OutputResultContent } from "@/interfaces";

type BaseLlmOutput2Optional = "id" | "created" | "options";

export function getResultContent(
  result: Omit<OutputResult, BaseLlmOutput2Optional> &
    Partial<Pick<OutputResult, BaseLlmOutput2Optional>>,
  index?: number
): OutputResultContent[] {
  if (typeof index === "number" && index > 0) {
    const arr = result?.options || [];
    const val = arr[index];
    return val ? val : [];
  }
  return [...result.content];
}
