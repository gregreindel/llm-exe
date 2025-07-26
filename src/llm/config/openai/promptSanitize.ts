import { IChatMessages } from "@/types";
import { openaiPromptMessageCallback } from "./promptSanitizeMessageCallback";

export function openaiPromptSanitize(
  _messages: IChatMessages | string,
  _inputBodyObj: Record<string, any>,
  _outputObj: Record<string, any>
) {
  if (typeof _messages === "string") {
    return [{ role: "user", content: _messages }];
  }

  return _messages.map(openaiPromptMessageCallback);
}
