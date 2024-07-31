import { OutputResult, OutputResultContent } from "@/interfaces";
import { uuid } from "@/utils";

type BaseLlmOutput2Optional = "id" | "created" | "options";

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

  function getResultText(): string {
    if (
      __result.content.length === 1 &&
      __result.content.every((a) => a.type === "text")
    ) {
      return __result.content[0]?.text || ""
    }
  
    return "";
  }

  function getResultContent(index?: number): OutputResultContent[] {
    if (index && index > 0) {
      const arr = __result?.options || [];
      const val = arr[index];
      return val ? val : [];
    }
    return [...__result.content];
  }

  function getResultAsMessage(){
    if (
      __result.content.length === 1 &&
      __result.content.every((a) => a.type === "text")
    ) {
      return {
        role: "assistant",
        content: __result.content[0]?.text || ""
      }
    }
    if (
      __result.content.length === 1 &&
      __result.content.every((a) => a.type === "function_use")
    ) {
      return {
        role: "assistant",
        content: null,
        function_call: JSON.stringify(__result.content.find(a=>a.type === "function_use"))
      }
    }
    if (
      __result.content.length === 2 &&
      __result.content.find((a) => a.type === "text") && 
      __result.content.find((a) => a.type === "function_use")
    ) {
      return {
        role: "assistant",
        content: __result.content.find((a) => a.type === "text")?.text,
        function_call: JSON.stringify(__result.content.find(a=>a.type === "function_use"))
      }
    }
    throw new Error("Invalid response")
  }

  return {
    getResultAsMessage,
    getResultContent,
    getResultText,
    getResult,
  };
}