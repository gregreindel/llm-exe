import { CoreExecutor } from "@/executor";

/**
 * Tests CoreExecutor
 */
describe("llm-exe:executor/CoreExecutor", () => {
  it("has basic properties", () => {
    const handler = () => ({});
    const executor = new CoreExecutor({ handler });
    expect(executor).toHaveProperty("id");
    expect(executor).toHaveProperty("type");
    expect(executor).toHaveProperty("name");
    expect(executor).toHaveProperty("created");
    expect(executor).toHaveProperty("executions");
    expect(executor).toHaveProperty("hooks");

    expect(executor).toHaveProperty("execute");
    expect(typeof executor.execute).toEqual("function");

    expect(executor).toHaveProperty("getHandlerInput");
    expect(typeof executor.getHandlerInput).toEqual("function");

    expect(executor).toHaveProperty("getHandlerOutput");
    expect(typeof executor.getHandlerOutput).toEqual("function");

    expect(executor).toHaveProperty("metadata");
    expect(typeof executor.metadata).toEqual("function");

    expect(executor).toHaveProperty("getMetadata");
    expect(typeof executor.getMetadata).toEqual("function");

    expect(executor).toHaveProperty("runHook");
    expect(typeof executor.runHook).toEqual("function");

    expect(executor).toHaveProperty("setHooks");
    expect(typeof executor.setHooks).toEqual("function");
  });

  it("infers name from passed in function", () => {
    const handler = () => ({});
    const executor = new CoreExecutor({ handler });
    expect(executor.name).toEqual("handler");
  });
  it("infers name from passed in async function", () => {
    const namedAsync = async () => ({});
    const executor = new CoreExecutor({ handler: namedAsync });
    expect(executor.name).toEqual("namedAsync");
  });
  it("uses name if defined", () => {
    const namedAsync = async () => ({ result: "Correct response" });
    const executor = new CoreExecutor({
      handler: namedAsync,
      name: "otherName",
    });
    expect(executor.name).toEqual("otherName");
    expect(typeof executor._handler).toEqual("function");
  });
});
