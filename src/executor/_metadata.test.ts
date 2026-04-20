import { ExecutorExecutionMetadataState, createMetadataState } from "@/executor/_metadata";


/**
 * Tests CoreExecutor
 */
describe("llm-exe:executor/ExecutorExecutionMetadataState", () => {
  it("createMetadataState", () => {
    const metadata = createMetadataState();
    expect(metadata).toBeInstanceOf(ExecutorExecutionMetadataState);
  });

  it("createMetadataState with initial items", () => {
    const start = Date.now();
    const metadata = createMetadataState({ start, input: "test" });
    expect(metadata).toBeInstanceOf(ExecutorExecutionMetadataState);
    const result = metadata.asPlainObject();
    expect(result.start).toEqual(start);
    expect(result.input).toEqual("test");
  });

  it("has basic properties", () => {
    const metadata = new ExecutorExecutionMetadataState();
    expect(metadata).toHaveProperty("setItem");
    expect(metadata).toHaveProperty("asPlainObject");
    expect(Object.keys(metadata).length).toEqual(0);
  });
  it("has basic properties with defaults", () => {
    const start = new Date().getTime()
    const metadata = new ExecutorExecutionMetadataState({ start, "input": "hi"});
    const result = metadata.asPlainObject()
    expect(result).toHaveProperty("start");
    expect(result).toHaveProperty("input");
    expect(result.input).toEqual("hi");
    expect(result.start).toEqual(start);
  });

  it("default state has all null/undefined values", () => {
    const metadata = new ExecutorExecutionMetadataState();
    const result = metadata.asPlainObject();
    expect(result.start).toBeNull();
    expect(result.end).toBeNull();
    expect(result.input).toBeUndefined();
    expect(result.handlerInput).toBeUndefined();
    expect(result.handlerOutput).toBeUndefined();
    expect(result.output).toBeUndefined();
    expect(result.errorMessage).toBeUndefined();
    expect(result.error).toBeUndefined();
    expect(result.metadata).toBeNull();
  });

  it("setItem", () => {
    const metadata = new ExecutorExecutionMetadataState();
    metadata.setItem({"input": "hi"})
    const result = metadata.asPlainObject()
    expect(result).toHaveProperty("input");
    expect(result.input).toEqual("hi");
  });

  it("setItem returns this for chaining", () => {
    const metadata = new ExecutorExecutionMetadataState();
    const returned = metadata.setItem({ input: "hi" });
    expect(returned).toBe(metadata);
  });

  it("setItem overwrites previous values", () => {
    const metadata = new ExecutorExecutionMetadataState();
    metadata.setItem({ input: "first" });
    metadata.setItem({ input: "second" });
    expect(metadata.asPlainObject().input).toEqual("second");
  });

  it("setItem sets multiple properties at once", () => {
    const start = Date.now();
    const end = start + 1000;
    const metadata = new ExecutorExecutionMetadataState();
    metadata.setItem({
      start,
      end,
      input: "test-input",
      output: "test-output",
      errorMessage: "something failed",
      error: new Error("fail"),
      handlerInput: { key: "val" },
      handlerOutput: "handler-result",
      metadata: { tokens: 42 },
    });
    const result = metadata.asPlainObject();
    expect(result.start).toEqual(start);
    expect(result.end).toEqual(end);
    expect(result.input).toEqual("test-input");
    expect(result.output).toEqual("test-output");
    expect(result.errorMessage).toEqual("something failed");
    expect(result.error).toBeInstanceOf(Error);
    expect(result.handlerInput).toEqual({ key: "val" });
    expect(result.handlerOutput).toEqual("handler-result");
    expect(result.metadata).toEqual({ tokens: 42 });
  });

  it("setItem invalid item", () => {
    const metadata = new ExecutorExecutionMetadataState();
    metadata.setItem("" as any)
    metadata.setItem("yo" as any)
    const result = metadata.asPlainObject()
    expect(result.input).toEqual(undefined);

    metadata.setItem(["yo"] as any)
    const result2 = metadata.asPlainObject()
    expect(result2.input).toEqual(undefined);

  });

  it("setItem with null does not throw", () => {
    const metadata = new ExecutorExecutionMetadataState();
    const returned = metadata.setItem(null as any);
    expect(returned).toBe(metadata);
    expect(metadata.asPlainObject().input).toBeUndefined();
  });

  it("asPlainObject returns a frozen object", () => {
    const metadata = new ExecutorExecutionMetadataState();
    metadata.setItem({ input: "frozen-test" });
    const result = metadata.asPlainObject();
    expect(Object.isFrozen(result)).toBe(true);
    expect(() => {
      (result as any).input = "modified";
    }).toThrow();
  });

  it("asPlainObject returns a new snapshot each time", () => {
    const metadata = new ExecutorExecutionMetadataState();
    metadata.setItem({ input: "v1" });
    const snap1 = metadata.asPlainObject();
    metadata.setItem({ input: "v2" });
    const snap2 = metadata.asPlainObject();
    expect(snap1.input).toEqual("v1");
    expect(snap2.input).toEqual("v2");
    expect(snap1).not.toBe(snap2);
  });

  it("chained setItem calls work correctly", () => {
    const metadata = new ExecutorExecutionMetadataState();
    metadata
      .setItem({ start: 100 })
      .setItem({ end: 200 })
      .setItem({ output: "done" });
    const result = metadata.asPlainObject();
    expect(result.start).toEqual(100);
    expect(result.end).toEqual(200);
    expect(result.output).toEqual("done");
  });
});
