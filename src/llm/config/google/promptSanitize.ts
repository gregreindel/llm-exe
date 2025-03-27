import { IChatMessages } from "@/types";
import { googleGeminiPromptMessageCallback } from "./promptSanitizeMessageCallback";

export function googleGeminiPromptSanitize(
  _messages: string | IChatMessages,
  _inputBodyObj: Record<string, any>,
  _outputObj: Record<string, any>
) {
  /**
   * If _messages is a string, return it as is.
   */
  if (typeof _messages === "string") {
    return _messages;
  }
  if (Array.isArray(_messages)) {
    if (_messages.length === 0) {
      throw new Error("Empty messages array");
    }
  }

  /**
   * TODO:
   * system messages can go into `systemInstruction`
   *   - remains same shape as text input ({text})
   */

  return _messages.map(googleGeminiPromptMessageCallback);
}
