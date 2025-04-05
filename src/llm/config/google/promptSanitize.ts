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
    return [{ role: "user", parts: [{ text: _messages }] }];
  }
  if (Array.isArray(_messages)) {
    if (_messages.length === 0) {
      throw new Error("Empty messages array");
    }

    if (_messages.length === 1 && _messages[0].role === "system") {
      // if there is only one message and it is a system message, treat it as a user message
      return [{ role: "user", parts: [{ text: _messages[0].content }] }];
    }

    const hasSystemInstruction = _messages.some(
      (message) => message.role === "system"
    );

    // if there are system messages, we need to handle them differently
    if (hasSystemInstruction) {
      // remove system messages from the array
      const theSystemInstructions = _messages.filter(
        (message) => message.role === "system"
      );
      const withoutSystemInstructions = _messages.filter(
        (message) => message.role !== "system"
      );

      // add the system instructions from the messages on request.system_instruction
      _outputObj.system_instruction = {
        parts: theSystemInstructions.map((message) => ({ text: message.content }))
      }

      return withoutSystemInstructions.map(googleGeminiPromptMessageCallback);
    }

    return _messages.map(googleGeminiPromptMessageCallback);
  }

  throw new Error("Invalid messages format");
}
