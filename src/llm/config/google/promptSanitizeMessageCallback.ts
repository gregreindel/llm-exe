import { IChatMessage } from "@/types";
import { modifyPromptRoleChange } from "@/utils/modules/modifyPromptRoleChange";

export function googleGeminiPromptMessageCallback(_message: IChatMessage) {
  let message = { ..._message };

  message = modifyPromptRoleChange(_message, [
    { from: "assistant", to: "model" },
  ]);

  // do gemini-specific transformations
  const { role, ...payload } = message;
  const parts = [];
  if (typeof payload.content === "string") {
    parts.push({ text: message.content });
  }

  return {
    role,
    parts,
  };
}
