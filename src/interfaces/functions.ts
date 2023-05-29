import { BaseParser } from "@/parser";
import { BasePrompt } from "@/prompt";
import { PlainObject } from "./utils";
import { BaseExecutor } from "@/executor";

export type ParserOutput<P> = P extends BaseParser<infer T> ? T : never;
export type PromptInput<P> = P extends BasePrompt<infer T> ? T : never;

export interface CoreExecutorExecuteOptions {
  hooks?: CoreExecutorHookInput;
}

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

export interface Temporary {
  id: string;
  initialInput?: any;
  currentStepNumber: number;
  results: any[];
  attributes: any;
}

export interface ExecutorExecutionMetadata<I = any, O = any> {
  start: null | number;
  end: null | number;
  input: I;
  handlerInput?: any;
  handlerOutput?: any;
  output?: O;
  _handlerOutput: any[];
  _output: O[];
  errorMessage?: string;
  error?: Error;
  metadata?: null | ExecutorMetadata | Temporary;
}

export type ExecutorExecutionMetadataProperties = Pick<
  ExecutorExecutionMetadata,
  | "start"
  | "end"
  | "input"
  | "handlerInput"
  | "handlerOutput"
  | "output"
  | "_handlerOutput"
  | "_output"
  | "errorMessage"
  | "error"
  | "metadata"
>;

export interface ExecutorContext<I = any, O = any, A = Record<string, any>>
  extends ExecutorExecutionMetadata<I, O> {
  metadata: ExecutorMetadata;
  attributes: A;
}

export interface CoreExecutorHookMethods<I = any, O = any> {
  onError?(execution: ExecutorExecutionMetadata<I, O>, context?: any): void;
  onComplete?(execution: ExecutorExecutionMetadata<I, O>, context?: any): void;
  filterResult?<O>(
    output: O,
    execution?: ExecutorExecutionMetadata<I, O>,
    context?: any
  ): O;
}

export type CoreExecutorHooks = {
  [K in keyof CoreExecutorHookMethods]: CoreExecutorHookMethods[K][];
};

export interface CoreExecutorHookInput {
  onError?: (
    execution: ExecutorExecutionMetadata,
    context?: any
  ) => void | ((execution: ExecutorExecutionMetadata, context?: any) => void)[];
  onComplete?: (
    execution: ExecutorExecutionMetadata,
    context?: any
  ) => void | ((execution: ExecutorExecutionMetadata, context?: any) => void)[];
  filterResult?: <O>(
    output: O,
    execution: ExecutorExecutionMetadata,
    context?: any
  ) =>
    | O
    | (<O>(
        output: O,
        execution: ExecutorExecutionMetadata,
        context?: any
      ) => O)[];
}
