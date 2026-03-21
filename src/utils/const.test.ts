import { hookOnComplete, hookOnError, hookOnSuccess } from "@/utils/const";

describe("llm-exe:utils/const", () => {
  it("should export hookOnComplete as 'onComplete'", () => {
    expect(hookOnComplete).toBe("onComplete");
  });

  it("should export hookOnError as 'onError'", () => {
    expect(hookOnError).toBe("onError");
  });

  it("should export hookOnSuccess as 'onSuccess'", () => {
    expect(hookOnSuccess).toBe("onSuccess");
  });
});
