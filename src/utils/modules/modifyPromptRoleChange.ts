import type { IChatMessage, IChatMessages } from "@/types";

export function modifyPromptRoleChange(
  messages: IChatMessages,
  roleChanges: { from: string; to: string }[]
): IChatMessages;

export function modifyPromptRoleChange(
  messages: IChatMessage,
  roleChanges: { from: string; to: string }[]
): IChatMessage;

export function modifyPromptRoleChange(
  messages: IChatMessages | IChatMessage,
  roleChanges: { from: string; to: string }[]
) {
  const roleChangeMap = new Map(roleChanges.map(({ from, to }) => [from, to]));

  if (Array.isArray(messages)) {
    return messages.map((message) => {
      const newRole = roleChangeMap.get(message.role);
      return newRole ? { ...message, role: newRole } : message;
    });
  }

  const newRole = roleChangeMap.get(messages.role);
  return newRole ? { ...messages, role: newRole } : messages;
}
