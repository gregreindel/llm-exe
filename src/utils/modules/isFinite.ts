export function isFinite(value: any): boolean {
    return typeof value === "number" && Number.isFinite(value);
  }
  
  