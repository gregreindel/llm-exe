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
    created: result?.created || new Date().getTime(),
    usage: result.usage,
    options: [...(result?.options || [])],
    content: result.content,
    stopReason: result.stopReason,
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
    const [item] = __result.content;
    if (item?.text) {
      return item?.text;
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

  return {
    getResultContent,
    getResultText,
    getResult,
  };
}

// export abstract class BaseLlmOutput {
//   protected id: string;
//   protected name: string;
//   protected created: number;
//   protected stopReason: string;

//   protected content: OutputResultContent[] = [];
//   protected options: OutputResultContent[][] = [];

//   protected usage = {
//     input_tokens: 0,
//     output_tokens: 0,
//     total_tokens: 0,
//   };

//   constructor(result: any) {
//     this.id = uuid();
//     this.setResult(result);
//   }

//   toOutput(): OutputResult {
//     // OutputResult
//     return {
//       id: this.id,
//       name: this.name,
//       created: this.created,
//       usage: this.usage,
//       content: this.content,
//       stopReason: this.stopReason,
//     };
//   }

//   getContent(index?: number) {
//     if (index && index > 0) {
//       return [this.options[index]];
//     }
//     return [...this.content];
//   }

//   abstract setResult(result: any): void;

//   abstract getResultText(resultIndex?: number): any;
//   abstract getResultAsMessage(resultIndex?: number): any;
// }
