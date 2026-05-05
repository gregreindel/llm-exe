import { stateFromOptions } from "@/llm/_utils.stateFromOptions";
import { deepFreeze } from "@/utils/modules/deepFreeze";
import { asyncCallWithTimeout } from "@/utils/modules/asyncCallWithTimeout";
import { backOff } from "exponential-backoff";
import { Config } from "@/types";
import { apiRequestWrapper } from "@/utils/modules/requestWrapper";


jest.mock("exponential-backoff", () => ({
  backOff: jest.fn(),
}));

jest.mock("@/llm/_utils.stateFromOptions", () => ({
  stateFromOptions: jest.fn(),
}));

jest.mock("@/utils/modules/deepFreeze", () => ({
  deepFreeze: jest.fn(),
}));

jest.mock("@/utils/modules/asyncCallWithTimeout", () => ({
  asyncCallWithTimeout: jest.fn(),
}));


describe("apiRequestWrapper", () => {
  const backOffMock = backOff as jest.Mock;
  const stateFromOptionsMock = stateFromOptions as jest.Mock;
  const deepFreezeMock = deepFreeze as jest.Mock;
  const asyncCallWithTimeoutMock = asyncCallWithTimeout as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    stateFromOptionsMock.mockReset()
    deepFreezeMock.mockReset()
    asyncCallWithTimeoutMock.mockReset()
    backOffMock.mockReset()
  });

  const mockConfig: Config<any> = {} as any;
  const mockOptions = {
    timeout: 10000,
    maxDelay: 2000,
    numOfAttempts: 3,
    jitter: "full" as "none" | "full",
    traceId: "test-trace-id",
  };
  const mockHandler = jest.fn<Promise<any>, any>();
  const mockState = {};
  const mockMessages = { messageContent: "test" }

  stateFromOptionsMock.mockReturnValue(mockState);
  deepFreezeMock.mockImplementation((obj) => obj);

  function setupAPIRequestWrapper(doNotRetryErrorMessages: string[] = []) {
    return apiRequestWrapper(mockConfig, mockOptions, mockHandler, doNotRetryErrorMessages);
  }

  it("should initialize with correct state and options", () => {
    setupAPIRequestWrapper();
    expect(stateFromOptionsMock).toHaveBeenCalledWith(mockOptions, mockConfig);
  });

  it("should return the correct metadata", () => {
    const apiRequest = setupAPIRequestWrapper();
    const metadata = apiRequest.getMetadata();
    expect(metadata).toEqual({
      traceId: "test-trace-id",
      timeout: mockOptions.timeout,
      jitter: mockOptions.jitter,
      maxDelay: mockOptions.maxDelay,
      numOfAttempts: mockOptions.numOfAttempts,
      metrics: {
        total_calls: 0,
        total_call_success: 0,
        total_call_retry: 0,
        total_call_error: 0,
        history: [],
      },
    });
  });

  it("should return the correct traceId", () => {
    const apiRequest = setupAPIRequestWrapper();
    expect(apiRequest.getTraceId()).toBe("test-trace-id");
  });

  it("should update traceId correctly", () => {
    const apiRequest = apiRequestWrapper(mockConfig, mockOptions, mockHandler, []);
    apiRequest.withTraceId("new-trace-id");
    expect(apiRequest.getTraceId()).toBe("new-trace-id");
  });

//   it("should call handler and backOff with correct parameters and handle success", async () => {
//     backOffMock.mockImplementation(async (fn) => {
//       return fn();
//     });
//     asyncCallWithTimeoutMock.mockResolvedValue(mockResult);

//     const apiRequest = setupAPIRequestWrapper();
//     const result = await apiRequest.call(mockMessages);
    
//     const metrics = (apiRequest.getMetadata().metrics as any);
//     expect(metrics.total_calls).toBe(1);
//     expect(metrics.total_call_success).toBe(1);
//     expect(metrics.total_call_retry).toBe(0);
//     expect(metrics.total_call_error).toBe(0);
//     expect(result).toEqual(mockResult);

//     expect(mockHandler).toHaveBeenCalledWith(
//       deepFreeze(mockState),
//       deepFreeze(mockMessages),
//       deepFreeze({})
//     );

//     expect(asyncCallWithTimeoutMock).toHaveBeenCalledWith(expect.any(Promise), mockOptions.timeout);
//     expect(backOffMock).toHaveBeenCalledWith(expect.any(Function), {
//       startingDelay: 0,
//       maxDelay: mockOptions.maxDelay,
//       numOfAttempts: mockOptions.numOfAttempts,
//       jitter: mockOptions.jitter,
//       retry: expect.any(Function),
//     });
//   });

  it("should retry on failure and handle max retries", async () => {
    const error = new Error("Transient Error");
    asyncCallWithTimeoutMock.mockRejectedValue(error);
    backOffMock.mockClear().mockImplementation(async (fn, options) => {
      try {
        return await fn();
      } catch (err) {
        const shouldRetry = options.retry(err, 1);
        if (shouldRetry) {
          return await fn();
        } else {
          throw err;  
        }
      }
    });

    const apiRequest = setupAPIRequestWrapper();
    await expect(apiRequest.call(mockMessages)).rejects.toThrow("Transient Error");

    const metrics = (apiRequest.getMetadata().metrics as any);
    expect(metrics.total_calls).toBe(1);
    expect(metrics.total_call_success).toBe(0);
    expect(metrics.total_call_retry).toBe(1);
    expect(metrics.total_call_error).toBe(1);

    expect(backOffMock).toHaveBeenCalledWith(expect.any(Function), {
      startingDelay: 0,
      maxDelay: mockOptions.maxDelay,
      numOfAttempts: mockOptions.numOfAttempts,
      jitter: mockOptions.jitter,
      retry: expect.any(Function),
    });

    expect(mockHandler).toHaveBeenCalledWith(deepFreeze(mockState), deepFreeze(mockMessages), deepFreeze({}));
  });

  it("should not retry on certain errors", async () => {
    const specificError = new Error("Do Not Retry");
    asyncCallWithTimeoutMock.mockRejectedValue(specificError);
    backOffMock.mockClear().mockImplementation(async (fn, options) => {
      try {
        return await fn();
      } catch (err) {
        const shouldRetry = options.retry(err, 1);
        if (shouldRetry) {
          return await fn();
        } else {
          throw err;
        }
      }
    });

    const apiRequest = setupAPIRequestWrapper(["Do Not Retry"]);
    await expect(apiRequest.call(mockMessages)).rejects.toThrow("Do Not Retry");

    const metrics = (apiRequest.getMetadata().metrics as any);
    expect(metrics.total_calls).toBe(1);
    expect(metrics.total_call_success).toBe(0);
    expect(metrics.total_call_retry).toBe(0);
    expect(metrics.total_call_error).toBe(1);

    expect(backOffMock).toHaveBeenCalledWith(expect.any(Function), {
      startingDelay: 0,
      maxDelay: mockOptions.maxDelay,
      numOfAttempts: mockOptions.numOfAttempts,
      jitter: mockOptions.jitter,
      retry: expect.any(Function),
    });

    expect(mockHandler).toHaveBeenCalledWith(deepFreeze(mockState), deepFreeze(mockMessages), deepFreeze({}));
  });

  it("should call handler and return result on success", async () => {
    const mockResult = { data: "success response" };
    backOffMock.mockClear().mockImplementation(async (fn) => {
      return fn();
    });
    asyncCallWithTimeoutMock.mockResolvedValue(mockResult);

    const apiRequest = setupAPIRequestWrapper();
    const result = await apiRequest.call(mockMessages);

    expect(result).toEqual(mockResult);

    const metrics = (apiRequest.getMetadata().metrics as any);
    expect(metrics.total_calls).toBe(1);
    expect(metrics.total_call_success).toBe(1);
    expect(metrics.total_call_retry).toBe(0);
    expect(metrics.total_call_error).toBe(0);
  });

  it("should use default options when not provided", () => {
    const defaultOptions = {};
    stateFromOptionsMock.mockReturnValue({});

    const apiRequest = apiRequestWrapper(mockConfig, defaultOptions, mockHandler);
    const metadata = apiRequest.getMetadata();

    expect(metadata.timeout).toBe(30000);
    expect(metadata.maxDelay).toBe(5000);
    expect(metadata.numOfAttempts).toBe(2);
    expect(metadata.jitter).toBe("none");
    expect(metadata.traceId).toBeNull();
  });

  it("should exclude sensitive keys from metadata", () => {
    const sensitiveOptions = {
      ...mockOptions,
      awsSecretKey: "secret-aws-key",
      awsAccessKey: "access-aws-key",
      openAiApiKey: "sk-openai-key",
      anthropicApiKey: "sk-ant-key",
    };
    stateFromOptionsMock.mockReturnValue({});

    const apiRequest = apiRequestWrapper(mockConfig, sensitiveOptions, mockHandler);
    const metadata = apiRequest.getMetadata();

    expect(metadata).not.toHaveProperty("awsSecretKey");
    expect(metadata).not.toHaveProperty("awsAccessKey");
    expect(metadata).not.toHaveProperty("openAiApiKey");
    expect(metadata).not.toHaveProperty("anthropicApiKey");
  });

  it("should track metrics across multiple calls", async () => {
    const mockResult = { data: "ok" };
    backOffMock.mockClear().mockImplementation(async (fn) => fn());
    asyncCallWithTimeoutMock.mockResolvedValue(mockResult);

    const apiRequest = setupAPIRequestWrapper();

    await apiRequest.call(mockMessages);
    await apiRequest.call(mockMessages);

    const metrics = (apiRequest.getMetadata().metrics as any);
    expect(metrics.total_calls).toBe(2);
    expect(metrics.total_call_success).toBe(2);
  });

  it("should pass options to handler via deepFreeze", async () => {
    const mockResult = { data: "ok" };
    stateFromOptionsMock.mockReturnValue(mockState);
    deepFreezeMock.mockImplementation((obj) => obj);
    backOffMock.mockClear().mockImplementation(async (fn) => fn());
    asyncCallWithTimeoutMock.mockResolvedValue(mockResult);

    const apiRequest = setupAPIRequestWrapper();
    const callOptions = { functionCall: "auto", functions: [] } as any;

    await apiRequest.call(mockMessages, callOptions);

    expect(deepFreezeMock).toHaveBeenCalledTimes(3);
    expect(mockHandler).toHaveBeenCalledWith(mockState, mockMessages, callOptions);
  });

});