import { resolveAsPromise } from "./resolveAsPromise";

describe("resolveAsPromise", () => {
  it("should resolve a synchronous function", async () => {
    const syncFn = () => "sync result";
    await expect(resolveAsPromise(syncFn)).resolves.toBe("sync result");
  });

  it("should resolve an asynchronous function", async () => {
    const asyncFn = async () => "async result";
    await expect(resolveAsPromise(asyncFn)).resolves.toBe("async result");
  });

  it("should throw a TypeError if the argument is not a function", async () => {
    // @ts-expect-error passing incorrect type for testing
    await expect(resolveAsPromise("not a function")).rejects.toThrow(TypeError);
  });

  it("should throw a TypeError with the correct message if the argument is not a function", async () => {
    // @ts-expect-error passing incorrect type for testing
    await expect(resolveAsPromise("not a function")).rejects.toThrow(
      "Expected a function as an argument."
    );
  });
});
