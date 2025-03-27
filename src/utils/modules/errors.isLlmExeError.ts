import { ErrorCodes } from "@/interfaces/errors";
import { LlmExeError } from "./errors";

export function isLlmExeError<C extends ErrorCodes>(
    error: any,
    code?: C
  ): error is LlmExeError<C> {
    return (
      error instanceof LlmExeError &&
      (code ? error.code === code : true)
    );
  }