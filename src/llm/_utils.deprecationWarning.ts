import { Config } from "@/types";

const warned = new Set<string>();

export class LlmExeDeprecationWarning extends Error {
  readonly code: string;
  readonly shorthand: string;
  constructor(opts: { message: string; shorthand: string }) {
    super(opts.message);
    this.name = "DeprecationWarning";
    this.code = "LLM_EXE_DEPRECATED";
    this.shorthand = opts.shorthand;
  }
}

export function emitDeprecationWarning(config: Config<any>): void {
  if (!config.deprecated) return;
  if (
    typeof process !== "object" ||
    typeof process?.emitWarning !== "function"
  ) {
    return;
  }
  const { shorthand, message } = config.deprecated;
  if (warned.has(shorthand)) return;
  warned.add(shorthand);

  process.emitWarning(new LlmExeDeprecationWarning({ message, shorthand }));
}

export function deprecateShorthand<K extends string>(
  shorthand: K,
  args: {
    config: Config<any>;
    message: string;
  }
): Record<K, Config<any>> {
  const entry: Config<any> = {
    ...args.config,
    deprecated: Object.freeze({
      shorthand,
      message: args.message,
    }),
  };
  return { [shorthand]: entry } as Record<K, Config<any>>;
}

export function _resetDeprecationWarnings(): void {
  warned.clear();
}
