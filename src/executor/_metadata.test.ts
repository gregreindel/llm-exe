import { ExecutorExecutionMetadataState, createMetadataState } from "@/executor/_metadata";


/**
 * Tests CoreExecutor
 */
describe("llm-exe:executor/ExecutorExecutionMetadataState", () => {
  it("createMetadataState", () => {
    const metadata = createMetadataState();
    expect(metadata).toBeInstanceOf(ExecutorExecutionMetadataState);
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
  it("setItem", () => {
    const metadata = new ExecutorExecutionMetadataState();
    metadata.setItem({"input": "hi"})
    const result = metadata.asPlainObject()
    expect(result).toHaveProperty("input");
    expect(result.input).toEqual("hi");
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

  it("asPlainObject returns a frozen object", () => {
    const metadata = new ExecutorExecutionMetadataState({ start: 100 });
    const plain = metadata.asPlainObject();
    expect(Object.isFrozen(plain)).toBe(true);
    expect(() => {
      (plain as any).start = 999;
    }).toThrow();
  });

  it("asPlainObject returns all expected keys with defaults", () => {
    const metadata = new ExecutorExecutionMetadataState();
    const plain = metadata.asPlainObject();
    expect(plain).toEqual({
      start: null,
      end: null,
      input: undefined,
      handlerInput: undefined,
      handlerOutput: undefined,
      output: undefined,
      errorMessage: undefined,
      error: undefined,
      metadata: null,
    });
  });

  it("setItem updates values progressively", () => {
    const metadata = new ExecutorExecutionMetadataState({ start: 1000 });
    metadata.setItem({ input: { key: "val" } });
    metadata.setItem({ handlerInput: "formatted" });
    metadata.setItem({ handlerOutput: "response" });
    metadata.setItem({ output: "parsed" });
    metadata.setItem({ end: 2000 });

    const plain = metadata.asPlainObject();
    expect(plain.start).toBe(1000);
    expect(plain.input).toEqual({ key: "val" });
    expect(plain.handlerInput).toBe("formatted");
    expect(plain.handlerOutput).toBe("response");
    expect(plain.output).toBe("parsed");
    expect(plain.end).toBe(2000);
    expect(plain.error).toBeUndefined();
  });

  it("setItem can overwrite previously set values", () => {
    const metadata = new ExecutorExecutionMetadataState({ start: 100 });
    metadata.setItem({ input: "first" });
    expect(metadata.asPlainObject().input).toBe("first");

    metadata.setItem({ input: "second" });
    expect(metadata.asPlainObject().input).toBe("second");
  });

  it("setItem records error and errorMessage", () => {
    const metadata = new ExecutorExecutionMetadataState({ start: 100 });
    const err = new Error("something broke");
    metadata.setItem({ error: err, errorMessage: err.message });

    const plain = metadata.asPlainObject();
    expect(plain.error).toBe(err);
    expect(plain.errorMessage).toBe("something broke");
  });

  it("setItem is chainable", () => {
    const metadata = new ExecutorExecutionMetadataState();
    const result = metadata.setItem({ input: "test" });
    expect(result).toBe(metadata);
  });

  it("setItem with null as input returns this without changes", () => {
    const metadata = new ExecutorExecutionMetadataState();
    const result = metadata.setItem(null as any);
    expect(result).toBe(metadata);
    expect(metadata.asPlainObject().input).toBeUndefined();
  });

  it("asPlainObject snapshots are independent", () => {
    const metadata = new ExecutorExecutionMetadataState({ start: 100 });
    const snap1 = metadata.asPlainObject();

    metadata.setItem({ input: "added later" });
    const snap2 = metadata.asPlainObject();

    expect(snap1.input).toBeUndefined();
    expect(snap2.input).toBe("added later");
  });

  it("createMetadataState with initial items sets all provided fields", () => {
    const metadata = createMetadataState({
      start: 500,
      input: { data: true },
    });
    const plain = metadata.asPlainObject();
    expect(plain.start).toBe(500);
    expect(plain.input).toEqual({ data: true });
  });
});
