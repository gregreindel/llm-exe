import {
  PlainObject,
  ExecutorMetadata,
  ListenerFunction,
  CoreExecutorHookInput,
  ExecutorExecutionMetadata,
  CoreExecutorExecuteOptions,
  BaseExecutorHooks,
} from "@/types";
import { pick } from "@/utils/modules/pick";
import { ensureInputIsObject } from "@/utils/modules/ensureInputIsObject";
import { uuid } from "@/utils/modules/uuid";
import { createMetadataState } from "./_metadata";
import { hookOnComplete, hookOnError, hookOnSuccess } from "@/utils/const";

/**
 * BaseExecutor
 * @template I - Input type.
 * @template O - Output type.
 * @template H - Hooks type.
 */
export abstract class BaseExecutor<
  I extends PlainObject,
  O = any,
  H extends BaseExecutorHooks = BaseExecutorHooks
> {
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
   * @property executions -
   */
  public executions;

  public traceId: string | null = null;
  /**
   * @property hooks - hooks to be ran during execution
   */
  public hooks: any;
  readonly allowedHooks: any[] = [hookOnComplete, hookOnError, hookOnSuccess];

  constructor(
    name: string,
    type: string,
    options?: CoreExecutorExecuteOptions<H>
  ) {
    this.id = uuid();
    this.type = type;
    this.name = name;
    this.created = new Date().getTime();
    this.executions = 0;
    this.hooks = {
      onSuccess: [],
      onError: [],
      onComplete: [],
    };

    if (options?.hooks) {
      this.setHooks(options.hooks);
    }
  }

  abstract handler(input: I, _options?: any): Promise<any>;

  /**
   *
   * Used to filter the input of the handler
   * @param _input
   * @returns original input formatted for handler
   */
  async getHandlerInput(
    _input: I,
    _metadata: ExecutorExecutionMetadata<I, any>,
    _options?: any
  ): Promise<any> {
    return ensureInputIsObject(_input);
  }

  /**
   *
   * Used to filter the output of the handler
   * @param _input
   * @returns output O
   */
  getHandlerOutput(
    out: any,
    _metadata: ExecutorExecutionMetadata<any, O>,
    _options?: any
  ): O {
    return out as O;
  }
  /**
   *
   * execute - Runs the executor
   * @param _input
   * @returns handler output
   */
  async execute(_input: I, _options?: any): Promise<O> {
    this.executions++;
    const _metadata = createMetadataState({
      start: new Date().getTime(),
      input: _input,
    });

    try {
      const input = await this.getHandlerInput(
        _input,
        _metadata.asPlainObject(),
        _options
      );

      _metadata.setItem({ handlerInput: input });

      let result = await this.handler(input, _options);

      _metadata.setItem({ handlerOutput: result });

      const output = this.getHandlerOutput(
        result,
        _metadata.asPlainObject(),
        _options
      );
      _metadata.setItem({ output });

      this.runHook("onSuccess", _metadata.asPlainObject());
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
      traceId: this.getTraceId(),
      id: this.id,
      type: this.type,
      name: this.name,
      created: this.created,
      executions: this.executions,
      metadata,
    });
  }

  runHook(hook: keyof H, _metadata: ExecutorExecutionMetadata) {
    /* istanbul ignore next */
    const { [hook]: hooks = [] } = pick(this.hooks, this.allowedHooks);
    for (const hookFn of [...hooks] /** clone hooks */) {
      if (typeof hookFn === "function") {
        try {
          hookFn(_metadata, this.getMetadata());
        } catch (error) {
          /** TODO: We should call an error handler */
        }
      }
    }
  }
  setHooks(hooks: CoreExecutorHookInput<H> = {}) {
    const hookKeys = Object.keys(hooks) as (keyof typeof hooks)[];
    for (const hookKey of hookKeys.filter((k) =>
      this.allowedHooks.includes(k)
    )) {
      const hookInput = hooks[hookKey];
      if (hookInput) {
        const _hooks = Array.isArray(hookInput) ? hookInput : [hookInput];
        for (const hook of _hooks) {
          if (
            hook &&
            typeof hook === "function" &&
            !this.hooks[hookKey].find((h: ListenerFunction) => h === hook)
          ) {
            this.hooks[hookKey].push(hook);
          }
        }
      }
    }
    return this;
  }

  removeHook(eventName: keyof H, fn: ListenerFunction) {
    if (typeof fn !== "function") return this;
    const lis = this.hooks[eventName];
    if (!lis) return this;
    for (let i = lis.length; i >= 0; i--) {
      if (lis[i] === fn) {
        lis.splice(i, 1);
        break;
      }
    }
    return this;
  }

  on(eventName: keyof H, fn: ListenerFunction) {
    return this.setHooks({ [eventName]: fn } as CoreExecutorHookInput<H>);
  }

  off(eventName: keyof H, fn: ListenerFunction) {
    return this.removeHook(eventName, fn);
  }

  once(eventName: keyof H, fn: ListenerFunction) {
    if (typeof fn !== "function") return this;
    const onceWrapper: ListenerFunction = (...args: any[]) => {
      fn(...args);
      this.off(eventName, onceWrapper);
    };
    this.hooks[eventName].push(onceWrapper);
    return this;
  }
  withTraceId(traceId: string) {
    this.traceId = traceId;
    return this;
  }
  getTraceId() {
    return this.traceId;
  }
}
