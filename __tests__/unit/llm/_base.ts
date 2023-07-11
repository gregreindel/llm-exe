import { BaseLlm } from '@/llm';
import { BaseLlmOptions } from "@/interfaces";
import { OutputDefault } from '@/llm/output';

/**
 * Tests BaseLlm
 */
describe("llm-exe:executor/BaseLlm", () => { 
  class MockLlm extends BaseLlm<null> {
    constructor(options: BaseLlmOptions = {}) {
      super(options);
    }
  }
  class MockLlmThrowsError extends BaseLlm<null> {
    constructor(options: BaseLlmOptions = {}) {
      super(options);
    }
    async _call(){
      throw new Error("This does not work") 
      return {}  as any
    }
  }

  it("MockLlm has basic properties", () => {
    const executor = new MockLlm();
    expect(executor).toHaveProperty("client");
    expect(executor).toHaveProperty("promptType");
    expect(executor).toHaveProperty("timeout");
    expect(executor).toHaveProperty("maxDelay");
    expect(executor).toHaveProperty("numOfAttempts");
    expect(executor).toHaveProperty("jitter");
    expect(executor).toHaveProperty("metrics");
  });
  it("MockLlm has basic methods", () => {
    const executor = new MockLlm();
    expect(executor).toHaveProperty("getPromptType");
    expect(executor).toHaveProperty("getMetrics");
    expect(executor).toHaveProperty("getMetadata");
    expect(executor).toHaveProperty("call");
    expect(executor).toHaveProperty("_callWithRetry");
    expect(executor).toHaveProperty("_call");
    expect(executor).toHaveProperty("shouldRetry");
    expect(executor).toHaveProperty("handleError");
  });

  it("MockLlm has basic properties", () => {
    const executor = new MockLlm();
    expect(executor.getPromptType()).toEqual("text");
  });

  it("MockLlm can use withTraceId", () => {
    const executor = new MockLlm();
    executor.withTraceId("1234")
    expect(executor.getTraceId()).toEqual("1234");
  });
  
  it("MockLlm can use withTraceId", () => {
    const executor = new MockLlm({traceId: "1234"});
    expect(executor.getTraceId()).toEqual("1234");
  });

  it("MockLlm shouldRetry defaults true", () => {
    const executor = new MockLlm();
    expect(executor.shouldRetry(new Error(), 2)).toEqual(true);
  });

  it("MockLlm handleError throws", () => {
    const executor = new MockLlm();
    expect(() => executor.handleError(new Error("error-message"))).toThrowError("error-message");
  });

  it("MockLlm has default properties", () => {
    const executor = new MockLlm();
    expect(executor.getMetadata()).toEqual({
        promptType: "text",
        timeout: 30000,
        jitter: "none",
        maxDelay: 5000,
        numOfAttempts: 5,
        traceId: null,
        metrics: executor.getMetrics(),
      });
  });
  it("MockLlm has custom properties", () => {
    const executor = new MockLlm({numOfAttempts: 10, jitter: "full", timeout: 60000, maxDelay: 10000 });
    expect(executor.getMetadata()).toEqual({
        promptType: "text",
        timeout: 60000,
        jitter: "full",
        maxDelay: 10000,
        numOfAttempts: 10,
        traceId: null,
        metrics: executor.getMetrics(),
      });
  });
  it("MockLlm has custom properties", async () => {
  const executor = new MockLlm({numOfAttempts: 10, jitter: "full", timeout: 60000, maxDelay: 10000 });
   await executor.call({})
    expect(executor.getMetrics()).toEqual({
        total_calls: 1,
        total_call_success: 1,
        total_call_retry: 0,
        total_call_error: 0,
        history: [],
      });
  });

  it("MockLlm has basic properties", async () => {
    const executor = new MockLlm();
    const res = await executor._call({})
    expect(res).toBeInstanceOf(OutputDefault);
  });


  
  it("MockLlm has basic properties", async () => {
    const executor = new MockLlm();
    const spyOnCall = jest.spyOn(executor, "_call");
    const res = await executor._callWithRetry({ input: "input-val" }, {})
    expect(res).toBeInstanceOf(OutputDefault);
    const metrics = executor.getMetrics()
    expect(metrics.total_call_success).toEqual(1);
    expect(spyOnCall).toHaveBeenCalledWith({ input: "input-val" }, {})
  });
  it("MockLlm has basic properties", async () => {
    const executor = new MockLlmThrowsError({numOfAttempts: 1});
    const spyOnCall = jest.spyOn(executor, "_call");

    try {
      await executor._callWithRetry({ input: "input-val" }, {})
    } catch (error) {
      const metrics = executor.getMetrics()
      expect(metrics.total_call_success).toEqual(0);
      expect(metrics.total_call_error).toEqual(1);
      expect(metrics.total_call_retry).toEqual(1);
      expect(spyOnCall).toHaveBeenCalledWith({ input: "input-val" }, {})
    }
  });

  it("MockLlm has basic properties", async () => {
    const executor = new MockLlmThrowsError({numOfAttempts: 5});
    try {
      await executor._callWithRetry({ input: "input-val" }, {})
    } catch (error) {
      const metrics = executor.getMetrics()
      expect(metrics.total_call_success).toEqual(0);
      expect(metrics.total_calls).toEqual(1);
      expect(metrics.total_call_error).toEqual(1);
      expect(metrics.total_call_retry).toEqual(5);
    }
  });
})







