import { ErrorCodes, ErrorContextMap } from "@/interfaces/errors";

export class LlmExeError<
  C extends ErrorCodes = "unknown"
> extends Error {
  public code;
  public context;
  constructor(message?: string, code?: C, context?: ErrorContextMap[C]) {
    super(message ?? "");
    this.name = this.constructor.name;
    this.code = code ?? "unknown";
    this.context = context as ErrorContextMap[C];

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
