export function promptSanitize(v: any) {
  if (typeof v === "string") {
    return [{ role: "user", content: v }];
  }
  return v;
}