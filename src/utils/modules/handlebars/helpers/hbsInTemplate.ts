import { replaceTemplateString } from "@/utils/modules/replaceTemplateString";

export function hbsInTemplate(this: any, arg1: string) {
  const data = this;
  const replace = replaceTemplateString(arg1, data);
  return replace;
}
