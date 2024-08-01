import { OutputResult, OutputResultContent } from "@/interfaces";
import { uuid } from "@/utils";

type BaseLlmOutput2Optional = "id" | "created" | "options";

export function getResultAsMessage(
  content: OutputResultContent[]
) {
  if (
    content.length === 1 &&
    content.every((a) => a.type === "text")
  ) {
    return {
      role: "assistant",
      content: content[0]?.text || "",
    };
  }
  if (
    content.length === 1 &&
    content.every((a) => a.type === "function_use")
  ) {
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

export function getResultText(
  content: OutputResultContent[]
): string {
  if (
    content.length === 1 &&
    content.every((a) => a.type === "text")
  ) {
    return content[0]?.text || "";
  }

  return "";
}

export function getResultContent(
  result: Omit<OutputResult, BaseLlmOutput2Optional> &
    Partial<Pick<OutputResult, BaseLlmOutput2Optional>>,
  index?: number
): OutputResultContent[] {
  if (index && index > 0) {
    const arr = result?.options || [];
    const val = arr[index];
    return val ? val : [];
  }
  return [...result.content];
}

export function BaseLlmOutput2(
  result: Omit<OutputResult, BaseLlmOutput2Optional> &
    Partial<Pick<OutputResult, BaseLlmOutput2Optional>>
) {
  const __result = Object.freeze({
    id: result.id || uuid(),
    name: result.name,
    usage: result.usage,
    stopReason: result.stopReason,
    options: [...(result?.options || [])],
    content: [...(result?.content || [])],
    created: result?.created || new Date().getTime(),
  });

  function getResult(): OutputResult {
    return {
      id: __result.id,
      name: __result.name,
      created: __result.created,
      usage: __result.usage,
      options: __result.options,
      content: __result.content,
      stopReason: __result.stopReason,
    };
  }

  return {
    getResultAsMessage: () => getResultAsMessage(__result.content),
    getResultContent: (index?: number) => getResultContent(__result, index),
    getResultText: () => getResultText(__result.content),
    getResult,
  };
}