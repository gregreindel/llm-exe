import {
  PlainObject,
  ExecutorMetadata,
  CoreExecutorHooks,
  CoreExecutorHookInput,
  ExecutorExecutionMetadata,
  CoreExecutorExecuteOptions,
} from "@/types";

import { ensureInputIsObject, uuid } from "@/utils";
import { createMetadataState } from "./_metadata";

const hookNames: (keyof CoreExecutorHookInput)[] = [
  "onComplete",
  "onError",
  "filterResult",
];

export abstract class BaseExecutor<I extends PlainObject, O = any> {
  /**
   * @property id - internal id of the executor
   */
  readonly id;

  /**
   * @property type - type of executor
   */
  public type;

  /**
   * @property created - timestamp date created
   */
  readonly created;

  /**
   * @property name - name of executor
   */
  public name;

  /**
   * @property executions - Prompt type (chat)
   */
  public executions;

  /**
   * @property hooks - hooks to be ran during execution
   */
  public hooks: CoreExecutorHooks;

  constructor(
    name: string,
    type: string,
    options?: CoreExecutorExecuteOptions
  ) {
    this.id = uuid();
    this.type = type;
    this.name = name;
    this.created = new Date().getTime();
    this.executions = 0;
    this.hooks = {};

    if (options?.hooks) {
      this.setHooks(options.hooks);
    }
  }

  abstract handler(input: I): Promise<any>;

  /**
   *
   * Used to filter the input of the handler
   * @param _input
   * @returns original input formatted for handler
   */
  getHandlerInput(
    _input: I,
    _metadata: ExecutorExecutionMetadata<I, any>
  ): any {
    return ensureInputIsObject(_input);
  }

  /**
   *
   * Used to filter the output of the handler
   * @param _input
   * @returns output O
   */
  getHandlerOutput(out: any, _metadata: ExecutorExecutionMetadata<any, O>): O {
    return out as O;
  }
  /**
   *
   * execute - Runs the executor
   * @param _input
   * @returns handler output
   */
  async execute(_input: I): Promise<O> {
    this.executions++;
    const _metadata = createMetadataState({
      start: new Date().getTime(),
      input: _input,
    });

    try {
      const input = this.getHandlerInput(_input, _metadata.asPlainObject());

      _metadata.setItem({ handlerInput: input });

      let result = await this.handler(input);

      _metadata.setItem({ handlerOutput: result });

      if (this.hooks.filterResult) {
        for (const filter of this.hooks.filterResult) {
          if (filter) {
            const filterResult = filter<typeof result>(
              result,
              _metadata.asPlainObject(),
              this.getMetadata()
            );
            result = filterResult;
            _metadata.setItem({ handlerOutput: filterResult });
          }
        }
      }

      const output = this.getHandlerOutput(result, _metadata.asPlainObject());
      _metadata.setItem({ output });
      return output;
    } catch (error: any) {
      _metadata.setItem({ error, errorMessage: error.message });
      this.runHook("onError", _metadata.asPlainObject());
      throw error;
    } finally {
      _metadata.setItem({ end: new Date().getTime() });
      this.runHook("onComplete", _metadata.asPlainObject());
    }
  }

  metadata(): Record<string, any> {
    return {};
  }

  getMetadata(metadata?: Record<string, any>): ExecutorMetadata {
    return Object.assign({}, this.metadata(), {
      id: this.id,
      type: this.type,
      name: this.name,
      created: this.created,
      executions: this.executions,
      metadata,
    });
  }

  runHook(hook: keyof CoreExecutorHooks, _metadata: ExecutorExecutionMetadata) {
    const { [hook]: hooks = [] } = this.hooks;
    for (const hookFn of hooks) {
      /* istanbul ignore next */
      if (typeof hookFn === "function") {
        hookFn(_metadata, this.getMetadata());
      }
    }
  }
  setHooks(hooks: CoreExecutorHookInput = {}) {
    const hookKeys = Object.keys(hooks) as (keyof typeof hooks)[];
    for (const hookKey of hookKeys.filter((k) => hookNames.includes(k))) {
      const hookInput = hooks[hookKey];
      if (hookInput) {
        const hook = Array.isArray(hookInput) ? hookInput : [hookInput];
        const cleanHooks = hook.filter((h) => h && typeof h === "function");
        if (!this.hooks[hookKey]) this.hooks[hookKey] = [];
        /* istanbul ignore next */
        this.hooks[hookKey]?.push(...cleanHooks);
      }
    }
  }
}
