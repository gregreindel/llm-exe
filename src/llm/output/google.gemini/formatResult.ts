import { OutputGoogleGeminiChatChoice, OutputResultContent } from "@/types";

export function formatResult(
  result: OutputGoogleGeminiChatChoice
): OutputResultContent | undefined {
  const { parts = [] } = result?.content || {};

  if (parts.length === 1) {
    const answer = parts[0];
    if (!!answer?.functionCall && typeof answer?.functionCall === "object") {
      return {
        type: "function_use",
        name: answer.functionCall.name,
        input: JSON.parse(answer.functionCall.args),
      };
    } else {
      return {
        type: "text",
        text: answer.text || "",
      };
    }
  }

  // error??
  return {
    type: "text",
    text: "",
  };
}
