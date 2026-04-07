import { createLlmExecutor, createCoreExecutor } from "@/executor";
import { useLlm } from "@/llm";
import { createChatPrompt } from "@/prompt";
import { createParser, createCustomParser } from "@/parser";

/**
 * Tests for executor composition patterns — chaining executors
 * where one executor's output feeds into another's input.
 */
describe("llm-exe:executor composition", () => {
  const llm = useLlm("openai.chat-mock.v1", { model: "mock" });

  describe("chaining LlmExecutor outputs into another executor", () => {
    it("chains two LLM executors: extract then transform", async () => {
      // First executor: returns raw text from mock LLM
      const extractPrompt = createChatPrompt<{ text: string }>(
        "Extract: {{text}}"
      );
      const extractParser = createParser("string");
      const extractor = createLlmExecutor({
        llm,
        prompt: extractPrompt,
        parser: extractParser,
      });

      // Second executor: transforms the first executor's output
      const transformPrompt = createChatPrompt<{ input: string }>(
        "Transform: {{input}}"
      );
      const transformParser = createCustomParser("wrap", (text) => ({
        transformed: text,
        length: text.length,
      }));
      const transformer = createLlmExecutor({
        llm,
        prompt: transformPrompt,
        parser: transformParser,
      });

      // Chain: extractor -> transformer
      const extracted = await extractor.execute({ text: "hello world" });
      expect(typeof extracted).toBe("string");

      const result = await transformer.execute({ input: extracted });
      expect(result).toHaveProperty("transformed");
      expect(result).toHaveProperty("length");
      expect(typeof result.transformed).toBe("string");
      expect(result.length).toBe(result.transformed.length);
    });

    it("chains CoreExecutor into LlmExecutor", async () => {
      // Core executor: pure function that prepares input
      const preparer = createCoreExecutor((input: { raw: string }) => ({
        cleaned: input.raw.trim().toLowerCase(),
      }));

      const prompt = createChatPrompt<{ cleaned: string }>(
        "Process: {{cleaned}}"
      );
      const executor = createLlmExecutor({
        llm,
        prompt,
        parser: createParser("string"),
      });

      const prepared = await preparer.execute({ raw: "  HELLO WORLD  " });
      expect(prepared.cleaned).toBe("hello world");

      const result = await executor.execute(prepared);
      expect(typeof result).toBe("string");
      expect(result).toContain("hello world");
    });

    it("chains LlmExecutor into CoreExecutor for post-processing", async () => {
      const prompt = createChatPrompt("Return something");
      const llmExec = createLlmExecutor({
        llm,
        prompt,
        parser: createParser("string"),
      });

      const postProcessor = createCoreExecutor((input: { text: string }) => ({
        wordCount: input.text.split(/\s+/).length,
        uppercase: input.text.toUpperCase(),
      }));

      const llmResult = await llmExec.execute({});
      const result = await postProcessor.execute({ text: llmResult });
      expect(result).toHaveProperty("wordCount");
      expect(result).toHaveProperty("uppercase");
      expect(typeof result.wordCount).toBe("number");
      expect(result.uppercase).toBe(result.uppercase.toUpperCase());
    });
  });

  describe("parallel executor execution", () => {
    it("runs multiple executors concurrently with Promise.all", async () => {
      const executors = ["Task A", "Task B", "Task C"].map((task) => {
        const prompt = createChatPrompt(task);
        return createLlmExecutor({
          llm,
          prompt,
          parser: createParser("string"),
        });
      });

      const results = await Promise.all(
        executors.map((exec) => exec.execute({}))
      );

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it("each executor tracks its own execution count independently", async () => {
      const exec1 = createLlmExecutor({
        llm,
        prompt: createChatPrompt("Exec1"),
      });
      const exec2 = createLlmExecutor({
        llm,
        prompt: createChatPrompt("Exec2"),
      });

      await exec1.execute({});
      await exec1.execute({});
      await exec2.execute({});

      expect(exec1.getMetadata().executions).toBe(2);
      expect(exec2.getMetadata().executions).toBe(1);
    });
  });

  describe("executor with hooks in composition", () => {
    it("hooks fire independently for each executor in a chain", async () => {
      const hook1 = { onSuccess: jest.fn(), onComplete: jest.fn() };
      const hook2 = { onSuccess: jest.fn(), onComplete: jest.fn() };

      const exec1 = createLlmExecutor(
        { llm, prompt: createChatPrompt("Step 1") },
        { hooks: hook1 }
      );
      const exec2 = createLlmExecutor(
        {
          llm,
          prompt: createChatPrompt<{ input: string }>("Step 2: {{input}}"),
          parser: createParser("string"),
        },
        { hooks: hook2 }
      );

      const step1Result = await exec1.execute({});
      await exec2.execute({ input: step1Result });

      expect(hook1.onSuccess).toHaveBeenCalledTimes(1);
      expect(hook1.onComplete).toHaveBeenCalledTimes(1);
      expect(hook2.onSuccess).toHaveBeenCalledTimes(1);
      expect(hook2.onComplete).toHaveBeenCalledTimes(1);
    });

    it("error in second executor does not affect first executor's hooks", async () => {
      const hook1 = { onSuccess: jest.fn(), onComplete: jest.fn() };
      const hook2 = { onError: jest.fn(), onComplete: jest.fn() };

      const exec1 = createLlmExecutor(
        { llm, prompt: createChatPrompt("Step 1") },
        { hooks: hook1 }
      );
      const exec2 = createLlmExecutor(
        {
          llm,
          prompt: createChatPrompt("Step 2"),
          parser: createCustomParser("fail", () => {
            throw new Error("step 2 failed");
          }),
        },
        { hooks: hook2 }
      );

      await exec1.execute({});
      await expect(exec2.execute({})).rejects.toThrow("step 2 failed");

      expect(hook1.onSuccess).toHaveBeenCalledTimes(1);
      expect(hook2.onError).toHaveBeenCalledTimes(1);
      expect(hook2.onComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("CoreExecutor composition patterns", () => {
    it("chains multiple core executors as a pipeline", async () => {
      const step1 = createCoreExecutor((input: { value: number }) => ({
        value: input.value * 2,
      }));
      const step2 = createCoreExecutor((input: { value: number }) => ({
        value: input.value + 10,
      }));
      const step3 = createCoreExecutor((input: { value: number }) => ({
        result: `Final: ${input.value}`,
      }));

      const r1 = await step1.execute({ value: 5 });
      const r2 = await step2.execute(r1);
      const r3 = await step3.execute(r2);

      expect(r3.result).toBe("Final: 20");
    });

    it("handles async core executor in chain", async () => {
      const asyncStep = createCoreExecutor(
        async (input: { items: string[] }) => {
          return { count: input.items.length, joined: input.items.join(", ") };
        }
      );

      const formatStep = createCoreExecutor(
        (input: { count: number; joined: string }) => ({
          summary: `${input.count} items: ${input.joined}`,
        })
      );

      const r1 = await asyncStep.execute({ items: ["a", "b", "c"] });
      const r2 = await formatStep.execute(r1);

      expect(r2.summary).toBe("3 items: a, b, c");
    });
  });
});
