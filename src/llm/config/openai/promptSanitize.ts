// Extract the EXACT existing logic - no changes
export function promptSanitize(v: any) {
  if (typeof v === "string") {
    return [{ role: "user", content: v }];
  }
  return v;
}

export function useJsonSanitize(v: any) {
  return v ? "json_object" : "text";
}