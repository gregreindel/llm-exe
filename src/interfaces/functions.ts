import { BaseParser } from "@/parser";
import { BasePrompt } from "@/prompt";
import { PlainObject } from "./utils";
import { BaseExecutor } from "@/executor";
import { hookOnComplete, hookOnError, hookOnSuccess } from "@/utils/const";

export type ListenerFunction = (...args: any[]) => void;

export type ParserOutput<P> = P extends BaseParser<infer T> ? T : never;
export type PromptInput<P> = P extends BasePrompt<infer T> ? T : never;

export interface ExecutorWithLlmOptions<Llm, Prompt, Parser, State> {
  name?: string;
  llm: Llm;
  prompt: Prompt | ((values: PromptInput<Prompt>) => Prompt);
  parser?: Parser;
  state?: State;
  // maybe temp?
  __mock_response_key__?: string;
}

export interface CoreExecutorInput<I, O> {
  name?: string;
  handler: (input: I) => Promise<O> | O;
  getHandlerInput?(input: I): any;
  getHandlerOutput?(out: any): O;
}

export type FunctionOrExecutor<I extends PlainObject | { input: string }, O> =
  | ((input: I) => Promise<O> | O)
  | BaseExecutor<I, O>;

export interface ExecutorMetadata {
  id: string;
  type: string;
  name: string;
  created: number;
  executions: number;
  metadata?: Record<string, any>;
}

export interface ExecutorExecutionMetadata<I = any, O = any> {
  start: null | number;
  end: null | number;
  input: I;
  handlerInput?: any;
  handlerOutput?: any;
  output?: O;
  errorMessage?: string;
  error?: Error;
  metadata?: null | ExecutorMetadata;
}

export type ExecutorExecutionMetadataProperties = Pick<
  ExecutorExecutionMetadata,
  | "start"
  | "end"
  | "input"
  | "handlerInput"
  | "handlerOutput"
  | "output"
  | "errorMessage"
  | "error"
  | "metadata"
>;

export interface ExecutorContext<I = any, O = any, A = Record<string, any>>
  extends ExecutorExecutionMetadata<I, O> {
  metadata: ExecutorMetadata;
  attributes: A;
}

export interface BaseExecutorHooks {
  [hookOnError]: ListenerFunction[];
  [hookOnSuccess]: ListenerFunction[];
  [hookOnComplete]: ListenerFunction[];
}

export interface LlmExecutorHooks extends BaseExecutorHooks {
  /** 
   * If needed, can override allowedHooks on llmExecutor
   * and add llm-specific hooks here
   */
}

export type CoreExecutorHookInput<H = BaseExecutorHooks> = {
  [key in keyof H]?: ListenerFunction | ListenerFunction[];
};

export interface CoreExecutorExecuteOptions<T = BaseExecutorHooks> {
  hooks?: CoreExecutorHookInput<T>;
}

export interface CallableExecutorCore {
  name: string;
  description: string;
  parameters?: Record<string, any>;
}
