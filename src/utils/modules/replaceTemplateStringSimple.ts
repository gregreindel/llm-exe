export function replaceTemplateStringSimple(
  template: string,
  context: Record<string, any>
): string {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_match, key) => {
    const keys = key.split(".");
    let value: any = context;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return ""
      }
    }

    return typeof value === "string" ? value : String(value);
  });
}