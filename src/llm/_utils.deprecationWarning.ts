import { Config } from "@/types";

const warned = new Set<string>();

export function emitDeprecationWarning(config: Config<any>): void {
  if (!config.deprecated) return;
  if (warned.has(config.key)) return;
  warned.add(config.key);

  const { message } = config.deprecated;
  process.emitWarning(message, {
    type: "DeprecationWarning",
    code: `LLM_EXE_DEPRECATED_${config.key}`,
  });
}

export function withDeprecation(
  config: Config<any>,
  deprecated: { message: string; shutdownDate?: string }
): Config<any> {
  return { ...config, deprecated };
}

export function _resetDeprecationWarnings(): void {
  warned.clear();
}
