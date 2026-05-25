import { createLlmExecutor, createCoreExecutor, LlmExecutorWithFunctions } from "@/executor";
import { useLlm } from "@/llm";
import { createChatPrompt } from "@/prompt";
import { createParser } from "@/parser";

/**
 * Tests for executor composition — proving that one executor's output
 * can feed another executor's input, and that the full typed pipeline works.
 */
describe("llm-exe:executor composition", () => {
  const llm = useLlm("openai.chat-mock.v1", { model: "mock" });

  it("chains a core executor after an llm executor", async () => {
    const llmExec = createLlmExecutor({
      llm,
      prompt: createChatPrompt("Say something"),
      parser: createParser("string"),
    });

    const coreExec = createCoreExecutor((input: { text: string }) => ({
      length: input.text.length,
      upper: input.text.toUpperCase(),
    }));

    const llmResult = await llmExec.execute({});
    const finalResult = await coreExec.execute({ text: llmResult });

    expect(typeof finalResult.length).toBe("number");
    expect(finalResult.length).toBe(llmResult.length);
    expect(finalResult.upper).toBe(llmResult.toUpperCase());
  });

  it("chains two core executors sequentially", async () => {
    const step1 = createCoreExecutor((input: { x: number }) => ({
      doubled: input.x * 2,
    }));

    const step2 = createCoreExecutor((input: { doubled: number }) => ({
      result: input.doubled + 1,
    }));

    const mid = await step1.execute({ x: 5 });
    const final = await step2.execute(mid);

    expect(final.result).toBe(11);
  });

  it("chains an llm executor into a custom parser executor", async () => {
    const summarizer = createLlmExecutor({
      llm,
      prompt: createChatPrompt("Summarize"),
      parser: createParser("string"),
    });

    const wordCounter = createCoreExecutor((input: { text: string }) => ({
      words: input.text.split(/\s+/).length,
    }));

    const summary = await summarizer.execute({});
    const counted = await wordCounter.execute({ text: summary });

    expect(typeof counted.words).toBe("number");
    expect(counted.words).toBeGreaterThan(0);
  });

  it("preserves trace IDs across chained executors", async () => {
    const exec1 = createLlmExecutor({
      llm,
      prompt: createChatPrompt("Step 1"),
    });
    const exec2 = createCoreExecutor((input: { text: string }) => input.text.length);

    exec1.withTraceId("chain-trace-001");
    exec2.withTraceId("chain-trace-001");

    const result1 = await exec1.execute({});
    await exec2.execute({ text: result1 });

    expect(exec1.getTraceId()).toBe("chain-trace-001");
    expect(exec2.getTraceId()).toBe("chain-trace-001");
  });

  it("hooks fire independently on each executor in a chain", async () => {
    const hook1 = jest.fn();
    const hook2 = jest.fn();

    const exec1 = createLlmExecutor(
      { llm, prompt: createChatPrompt("First") },
      { hooks: { onComplete: hook1 } }
    );
    const exec2 = createCoreExecutor(
      (input: { text: string }) => input.text.length,
      { hooks: { onComplete: hook2 } }
    );

    const mid = await exec1.execute({});
    await exec2.execute({ text: mid });

    expect(hook1).toHaveBeenCalledTimes(1);
    expect(hook2).toHaveBeenCalledTimes(1);
  });
});

describe("llm-exe:executor/LlmExecutorWithFunctions additional coverage", () => {
  const llm = useLlm("openai.chat-mock.v1", { model: "mock" });

  it("works with prompt as function", async () => {
    const promptFn = (input: Record<string, any>) =>
      createChatPrompt(`Process: ${input?.task || "default"}`);

    const executor = new LlmExecutorWithFunctions({ llm, prompt: promptFn as any });
    const result = await executor.execute(
      { task: "test" },
      { functionCall: "none", functions: [] }
    );
    expect(result).toBeDefined();
  });

  it("defaults to StringParser when no parser is provided", () => {
    const executor = new LlmExecutorWithFunctions({
      llm,
      prompt: createChatPrompt("Test"),
    });
    expect(executor.parser).toBeDefined();
    expect(executor.parser.target).toBe("function_call");
  });

  it("fires hooks on successful function execution", async () => {
    const onSuccess = jest.fn();
    const onComplete = jest.fn();

    const executor = new LlmExecutorWithFunctions(
      { llm, prompt: createChatPrompt("With hooks") },
      { hooks: { onSuccess, onComplete } }
    );

    await executor.execute(
      {},
      { functionCall: "none", functions: [] }
    );

    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("increments execution count", async () => {
    const executor = new LlmExecutorWithFunctions({
      llm,
      prompt: createChatPrompt("Count test"),
    });

    expect(executor.executions).toBe(0);
    await executor.execute({}, { functionCall: "none", functions: [] });
    expect(executor.executions).toBe(1);
    await executor.execute({}, { functionCall: "auto", functions: [] });
    expect(executor.executions).toBe(2);
  });
});
