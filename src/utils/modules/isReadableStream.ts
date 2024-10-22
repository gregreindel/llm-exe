export function isReadableStream(obj: any) {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.pipe === "function" &&
    typeof obj._read === "function"
  );
}
