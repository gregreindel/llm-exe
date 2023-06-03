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
});
