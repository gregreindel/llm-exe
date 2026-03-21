import { asyncCallWithTimeout } from "@/utils/modules/asyncCallWithTimeout";

describe("asyncCallWithTimeout", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should resolve if asyncPromise resolves within timeLimit", async () => {
    const asyncPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(42);
      }, 1000);
    });

    const resultPromise = asyncCallWithTimeout(asyncPromise, 2000);
    jest.advanceTimersByTime(1000);
    const result = await resultPromise;
    expect(result).toBe(42);
  });

  it("should reject if asyncPromise takes longer than timeLimit", async () => {
    const asyncPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(42);
      }, 2000);
    });

    const resultPromise = asyncCallWithTimeout(asyncPromise, 1000);
    jest.advanceTimersByTime(1000);
    await expect(resultPromise).rejects.toThrow(
      "LLM call timed out after 1000ms"
    );
  });

  it("should resolve if asyncPromise resolves immediately", async () => {
    const asyncPromise = Promise.resolve(42);

    const result = await asyncCallWithTimeout(asyncPromise, 1000);
    expect(result).toBe(42);
  });

  it("should resolve if asyncPromise resolves slightly before timeLimit", async () => {
    const asyncPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(42);
      }, 1000);
    });

    const resultPromise = asyncCallWithTimeout(asyncPromise, 1010);
    jest.advanceTimersByTime(1000);
    const result = await resultPromise;
    expect(result).toBe(42);
  });

  it("should reject if asyncPromise rejects within timeLimit", async () => {
    const asyncPromise = new Promise<number>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Async promise error"));
      }, 500);
    });

    const resultPromise = asyncCallWithTimeout(asyncPromise, 1000);
    jest.advanceTimersByTime(500);
    await expect(resultPromise).rejects.toThrow(
      "Async promise error"
    );
  });

  it("should resolve if asyncPromise resolves within default timeLimit", async () => {
    const asyncPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(42);
      }, 5000);
    });

    const resultPromise = asyncCallWithTimeout(asyncPromise);
    jest.advanceTimersByTime(5000);
    const result = await resultPromise;
    expect(result).toBe(42);
  });

  it("should reject if asyncPromise takes longer than default timeLimit", async () => {
    const asyncPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(42);
      }, 11000);
    });

    const resultPromise = asyncCallWithTimeout(asyncPromise);
    jest.advanceTimersByTime(10000);
    await expect(resultPromise).rejects.toThrow(
      "LLM call timed out after 10000ms"
    );
  });

  it("should include the timeout duration in the error message", async () => {
    const asyncPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(42);
      }, 6000);
    });

    const resultPromise = asyncCallWithTimeout(asyncPromise, 5000);
    jest.advanceTimersByTime(5000);
    await expect(resultPromise).rejects.toThrow(
      "LLM call timed out after 5000ms"
    );
  });

  it("should reject if asyncPromise rejects immediately", async () => {
    const asyncPromise = Promise.reject(new Error("Async promise error"));

    await expect(asyncCallWithTimeout(asyncPromise, 1000)).rejects.toThrow(
      "Async promise error"
    );
  });

  it("should resolve with different data types", async () => {
    const stringPromise = Promise.resolve("Hello, World!");
    const objectPromise = Promise.resolve({ key: "value" });
    const arrayPromise = Promise.resolve([1, 2, 3]);

    const stringResult = await asyncCallWithTimeout(stringPromise, 1000);
    const objectResult = await asyncCallWithTimeout(objectPromise, 1000);
    const arrayResult = await asyncCallWithTimeout(arrayPromise, 1000);

    expect(stringResult).toBe("Hello, World!");
    expect(objectResult).toEqual({ key: "value" });
    expect(arrayResult).toEqual([1, 2, 3]);
  });
});
