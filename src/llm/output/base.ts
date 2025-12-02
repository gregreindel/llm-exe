import { OutputResult } from "@/interfaces";
import { uuid } from "@/utils/modules/uuid";
import { getResultContent } from "./_utils/getResultContent";
import { getResultText } from "./_utils/getResultText";

type BaseLlmOutput2Optional = "id" | "created" | "options";

export function BaseLlmOutput(
  result: Omit<OutputResult, BaseLlmOutput2Optional> &
    Partial<Pick<OutputResult, BaseLlmOutput2Optional>>
) {
  const __result = Object.freeze({
    id: result.id || uuid(),
    name: result.name,
    usage: result.usage,
    stopReason: result.stopReason,
    options: [...(result?.options || [])],
    content: [...result.content],
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
    getResultContent: (index?: number) => getResultContent(__result, index),
    getResultText: (index?: number) => getResultText(__result, index),
    getResult,
  };
}
