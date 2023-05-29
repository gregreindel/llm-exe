import { PlainObject } from "@/types";
import {
  UseExecutorsBase,
  CallableExecutor,
  CallableExecutorInput,
} from "./callable";

/**
 * Creates a new CallableExecutor instance.
 * @function createCallableExecutor
 * @param options - The input options for the callable core function.
 * @returns A new CallableExecutor instance.
 */
export function createCallableExecutor<
  I extends PlainObject | { input: string },
  O
>(options: CallableExecutorInput<I, O>) {
  return new CallableExecutor(options);
}

export function useExecutors<
  I extends PlainObject | { input: string },
  O extends any
>(
  executors: [
    ...(CallableExecutor<any, any> | CallableExecutorInput<any, any>)[]
  ]
) {
  class UseExecutors extends UseExecutorsBase<I, O> {
    constructor(handlers: CallableExecutor<I, O>[]) {
      super(handlers);
    }
  }
  return new UseExecutors(
    executors.map((e) => {
      if (e instanceof CallableExecutor) return e;
      return createCallableExecutor(e);
    })
  );
}
