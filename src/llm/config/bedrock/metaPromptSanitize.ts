import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";

export function metaPromptSanitize(messages: any) {
  if (typeof messages === "string") {
    return messages;
  } else {
    return replaceTemplateString(`{{>DialogueHistory key='messages'}}`, {
      messages,
    });
  }
}