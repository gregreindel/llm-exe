import { IChatMessages } from "@/types";
import { anthropicPromptMessageCallback } from "./promptSanitizeMessageCallback";

export function anthropicPromptSanitize(
  _messages: string | IChatMessages,
  _inputBodyObj: Record<string, any>,
  _outputObj: Record<string, any>
) {
  if (typeof _messages === "string") {
    return [{ role: "user", content: _messages }].map(
      anthropicPromptMessageCallback
    );
  }

  const [first, ...messages] = [..._messages.map((a) => ({ ...a }))];

  // if a single system message is passed in:
  // - we'll treat as a user message
  if (first.role === "system" && messages.length === 0) {
    return [{ role: "user", content: first.content }, ...messages].map(
      anthropicPromptMessageCallback
    );
  }

  // if more than one message is passed in, and the first is a system message:
  //   - we'll "delete" the system message and set it to the output object
  //   - and return the rest of the messages
  if (first.role === "system" && messages.length > 0) {
    _outputObj.system = first.content;
    return messages
      .map((m) => {
        if (m.role === "system") {
          return { ...m, role: "user" };
        }
        return m;
      })
      .map(anthropicPromptMessageCallback);
  }

  // otherwise, don't make assumptions?
  return [
    first,
    ...messages.map((m) => {
      if (m.role === "system") {
        return { ...m, role: "user" };
      }
      return m;
    }),
  ].map(anthropicPromptMessageCallback);
}
