import { asyncCallWithTimeout } from "@/utils";

describe("asyncCallWithTimeout", () => {
  it("should resolve if asyncPromise resolves within timeLimit", async () => {
    const asyncPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(42);
      }, 1000);
    });

    const result = await asyncCallWithTimeout(asyncPromise, 2000);
    expect(result).toBe(42);
  });

  it("should reject if asyncPromise takes longer than timeLimit", async () => {
    const asyncPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(42);
      }, 2000);
    });

    await expect(asyncCallWithTimeout(asyncPromise, 1000)).rejects.toThrow(
      "Unable to perform action. Try again, or use another action."
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

    const result = await asyncCallWithTimeout(asyncPromise, 1010);
    expect(result).toBe(42);
  });

  it("should reject if asyncPromise rejects within timeLimit", async () => {
    const asyncPromise = new Promise<number>((_resolve, reject) => {
      setTimeout(() => {
        reject(new Error("Async promise error"));
      }, 500);
    });

    await expect(asyncCallWithTimeout(asyncPromise, 1000)).rejects.toThrow(
      "Async promise error"
    );
  });

  it("should resolve if asyncPromise resolves within default timeLimit", async () => {
    const asyncPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(42);
      }, 5000);
    });

    const result = await asyncCallWithTimeout(asyncPromise);
    expect(result).toBe(42);
  }, 7000);

  it("should reject if asyncPromise takes longer than default timeLimit", async () => {
    const asyncPromise = new Promise<number>((resolve) => {
      setTimeout(() => {
        resolve(42);
      }, 11000);
    });

    await expect(asyncCallWithTimeout(asyncPromise)).rejects.toThrow(
      "Unable to perform action. Try again, or use another action."
    );
  }, 13000);

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
