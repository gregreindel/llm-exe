import { backOff } from "exponential-backoff";
import { BaseLlmOptions, PromptType } from "@/types";
import { asyncCallWithTimeout } from "@/utils";
import { BaseLlmOutput, OutputDefault } from "@/llm/output";

/**
 * BaseLlm is an abstract class that provides a base structure for implementing
 * specific Low Latency Models (LLMs). It handles retries, timeouts, and metrics
 * for the calls made to the LLM.
 */
export abstract class BaseLlm<C = any> {
  /**
   * A property to hold the client instance for the specific LLM.
   */
  protected client: C;

  /**
   * The type of prompt to create. Options are "text" or "chat"
   */
  protected promptType: PromptType;

  /**
   * The maximum time (in milliseconds) to wait for a response before timing out.
   */
  protected timeout: number;

  /**
   * The maximum delay (in milliseconds) between retries.
   */
  protected maxDelay: number;

  /**
   * The maximum number of retries before giving up.
   */
  protected numOfAttempts: number;

  /**
   * The jitter strategy to use between retries. Options are "none" or "full".
   */
  protected jitter: "none" | "full";

  protected traceId: null | string ;
  /**
   * An object to store metrics related to the LLM calls.
   */
  protected metrics: any = {
    total_calls: 0,
    total_call_success: 0,
    total_call_retry: 0,
    total_call_error: 0,
    history: [],
  };

  /**
   * The BaseLlm constructor takes an options object and sets up the instance.
   * @param {BaseLlmOptions} options - The options object for LLM configuration.
   */
  constructor(options: BaseLlmOptions, client: C) {
    this.traceId = options?.traceId || null;
    this.client = client;
    this.promptType = options?.promptType || "text";
    this.timeout = options.timeout || 30000;
    this.jitter = options.jitter || "none";
    this.maxDelay = options.maxDelay || 5000;
    this.numOfAttempts = options.numOfAttempts || 5;
  }

  shouldRetry(_error: any, _stepNumber: number) {
    return true;
  }

  handleError(_error: any) {
    throw _error
  }

  getPromptType() {
    return this.promptType;
  }

  /**
   * getMetrics returns the metrics object for the LLM.
   */
  getMetrics() {
    return { ...this.metrics };
  }

  /**
   * getMetadata - Used to return metrics and data about executions.
   */
  getMetadata() {
    return {
      traceId: this.getTraceId(),
      promptType: this.promptType,
      timeout: this.timeout,
      jitter: this.jitter,
      maxDelay: this.maxDelay,
      numOfAttempts: this.numOfAttempts,
      metrics: this.getMetrics(),
    };
  }

  /**
   * call makes a call to the specific LLM with input and returns the output.
   * It also handles retries and updates the metrics.
   * @param _input - The input to the LLM.
   * @return The output from the LLM.
   */
  async call(
    _input: any,
    ...args: any[]
  ): Promise<BaseLlmOutput> {
    return this._callWithRetry(_input, ...args);
  }

  /**
   * _callWithRetry is a private method that handles retries and timeouts for the LLM call.
   * @param _input - The input to the LLM.
   * @return The result of the LLM call.
   * @throws An error if the maximum number of retries is reached.
   */
  async _callWithRetry(_input: any, ...args: any[]) {
    try {
      this.metrics.total_calls++;
      const result = await backOff<any>(
        () =>
          asyncCallWithTimeout(this._call(_input, ...args), this.timeout),
        {
          startingDelay: 0,
          maxDelay: this.maxDelay,
          numOfAttempts: this.numOfAttempts,
          jitter: this.jitter,
          retry: (_error: any, _stepNumber: number) => {
            this.metrics.total_call_retry++;
            console.log(`Handler timeout after ${this.timeout}. Retrying...`);
            return true
          },
        }
      );
      this.metrics.total_call_success++;
      return result;
    } catch (error) {
      this.metrics.total_call_error++;
      this.handleError(error)
    }
  }

  /**
   * _call is an method that must be implemented by subclasses to make the actual LLM call.
   * @param {any} _input - The input to the LLM.
   * @return The output from the LLM.
   */
  async _call(
    _input: any,
    ..._args: any[]
  ): Promise<BaseLlmOutput> {
    return new OutputDefault(undefined);
  }
  withTraceId(traceId : string){
    this.traceId = traceId
    return this;
  }
  getTraceId(){
    return this.traceId
  }
}
