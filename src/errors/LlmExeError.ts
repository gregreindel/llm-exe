import type {
  CategoryFor,
  ErrorCategory,
  ErrorCodes,
  ErrorContextByCode,
  LlmExeErrorJson,
  LlmExeErrorOptions,
} from "./types";
import { KNOWN_ERROR_CODES } from "./knownCodes";
import { serializeLlmExeError } from "./serialize";

export const LLM_EXE_ERROR_SYMBOL: unique symbol = Symbol.for("llm-exe.error");

function deriveCategory(code: unknown): ErrorCategory | undefined {
  if (typeof code !== "string") return undefined;
  if (!KNOWN_ERROR_CODES.has(code)) return undefined;
  const dot = code.indexOf(".");
  return code.slice(0, dot) as ErrorCategory;
}

export class LlmExeError<
  C extends ErrorCodes = "unknown.unclassified",
> extends Error {
  readonly name = "LlmExeError" as const;
  readonly isLlmExeError = true as const;
  readonly [LLM_EXE_ERROR_SYMBOL] = true as const;
  readonly category!: CategoryFor<C>;
  readonly code!: C;
  readonly context?: ErrorContextByCode[C];

  constructor(message: string, options: LlmExeErrorOptions<C>) {
    super(message);

    const providedCode = options ? options.code : undefined;
    const category = deriveCategory(providedCode);

    if (!category) {
      (this as { code: ErrorCodes }).code = "internal.invariant_failed";
      (this as { category: ErrorCategory }).category = "internal";
      (this as { context: unknown }).context = {
        invariant: "invalid_error_code",
        received: providedCode,
      };
    } else {
      (this as { code: ErrorCodes }).code = providedCode as ErrorCodes;
      (this as { category: ErrorCategory }).category = category;
      if (options.context !== undefined) {
        (this as { context: unknown }).context = options.context;
      }
    }

    if (options && options.cause !== undefined) {
      Object.defineProperty(this, "cause", {
        value: options.cause,
        configurable: true,
        writable: true,
        enumerable: false,
      });
    }

    const capture = (
      Error as { captureStackTrace?: (target: object, ctor: unknown) => void }
    ).captureStackTrace;
    if (typeof capture === "function") {
      capture(this, LlmExeError);
    }
  }

  toJSON(): LlmExeErrorJson<C> {
    return serializeLlmExeError(this) as LlmExeErrorJson<C>;
  }
}
