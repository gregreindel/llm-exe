import { createLlmExecutor, createCoreExecutor } from "@/executor";
import { useLlm } from "@/llm";
import { createChatPrompt } from "@/prompt";
import { createParser, createCustomParser } from "@/parser";
import { defineSchema } from "@/utils/modules/defineSchema";

describe("llm-exe:executor advanced integration", () => {
  const llm = useLlm("openai.chat-mock.v1", { model: "mock" });

  describe("executor chaining (output of one feeds input of another)", () => {
    it("chains LLM executor into core executor for post-processing", async () => {
      const llmExec = createLlmExecutor({
        llm,
        prompt: createChatPrompt("Say hello"),
        parser: createParser("string"),
      });
      const postProcess = createCoreExecutor(
        (input: { text: string }) => input.text.length
      );

      const text = await llmExec.execute({});
      const length = await postProcess.execute({ text });

      expect(typeof text).toBe("string");
      expect(length).toBe(text.length);
    });

    it("chains custom parser output into second executor", async () => {
      const first = createLlmExecutor({
        llm,
        prompt: createChatPrompt<{ topic: string }>("Talk about {{topic}}"),
        parser: createCustomParser("extract-words", (text) => text.split(" ")),
      });
      const second = createCoreExecutor(
        (input: { words: string[] }) => input.words.length
      );

      const words = await first.execute({ topic: "testing" });
      expect(Array.isArray(words)).toBe(true);

      const count = await second.execute({ words });
      expect(typeof count).toBe("number");
      expect(count).toBe(words.length);
    });
  });

  describe("concurrent executions", () => {
    it("multiple executors can run concurrently without interference", async () => {
      const executors = Array.from({ length: 5 }, () =>
        createLlmExecutor({
          llm,
          prompt: createChatPrompt<{ id: number }>(`Request {{id}}`),
          parser: createParser("string"),
        })
      );

      const results = await Promise.all(
        executors.map((exec, i) => exec.execute({ id: i }))
      );

      expect(results).toHaveLength(5);
      results.forEach((r, i) => {
        expect(typeof r).toBe("string");
        expect(r).toContain(`Request ${i}`);
      });
    });

    it("same executor handles concurrent calls correctly", async () => {
      const executor = createLlmExecutor({
        llm,
        prompt: createChatPrompt<{ n: number }>("Number {{n}}"),
        parser: createParser("string"),
      });

      const results = await Promise.all([
        executor.execute({ n: 1 }),
        executor.execute({ n: 2 }),
        executor.execute({ n: 3 }),
      ]);

      expect(executor.getMetadata().executions).toBe(3);
      expect(results[0]).toContain("Number 1");
      expect(results[1]).toContain("Number 2");
      expect(results[2]).toContain("Number 3");
    });
  });

  describe("error metadata", () => {
    it("onError metadata includes input and error details", async () => {
      const onError = jest.fn();
      const executor = createLlmExecutor({
        llm,
        prompt: createChatPrompt("fail"),
        parser: createCustomParser("boom", () => {
          throw new Error("parser exploded");
        }),
      });
      executor.setHooks({ onError });

      await expect(executor.execute({ key: "val" })).rejects.toThrow(
        "parser exploded"
      );

      expect(onError).toHaveBeenCalledTimes(1);
      const meta = onError.mock.calls[0][0];
      expect(meta.input).toEqual({ key: "val" });
      expect(meta.errorMessage).toBe("parser exploded");
      expect(meta.error).toBeInstanceOf(Error);
      expect(meta.output).toBeUndefined();
    });

    it("onComplete receives metadata on both success and error paths", async () => {
      const completeMetas: any[] = [];
      const onComplete = jest.fn((meta) => completeMetas.push(meta));

      const successExec = createLlmExecutor({
        llm,
        prompt: createChatPrompt("ok"),
        parser: createParser("string"),
      });
      successExec.setHooks({ onComplete });
      await successExec.execute({});

      const failExec = createLlmExecutor({
        llm,
        prompt: createChatPrompt("fail"),
        parser: createCustomParser("throw", () => {
          throw new Error("fail");
        }),
      });
      failExec.setHooks({ onComplete });
      await expect(failExec.execute({})).rejects.toThrow();

      expect(completeMetas).toHaveLength(2);

      expect(completeMetas[0].output).toBeDefined();
      expect(completeMetas[0].error).toBeUndefined();

      expect(completeMetas[1].output).toBeUndefined();
      expect(completeMetas[1].errorMessage).toBe("fail");
    });
  });

  describe("json parser with schema", () => {
    it("passes jsonSchema option to handler when parser has a schema", async () => {
      const schema = defineSchema({
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
      });
      const parser = createParser("json", { schema });
      const executor = createLlmExecutor({ llm, prompt: createChatPrompt("json"), parser });

      jest.spyOn(executor, "handler");

      await executor.execute({});

      expect(executor.handler).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ jsonSchema: schema })
      );
    });
  });

  describe("custom naming", () => {
    it("executor uses provided name", () => {
      const executor = createLlmExecutor({
        llm,
        prompt: createChatPrompt("test"),
        name: "my-summarizer",
      });
      expect(executor.name).toBe("my-summarizer");
      expect(executor.getMetadata().name).toBe("my-summarizer");
    });

    it("executor defaults to anonymous-llm-executor without name", () => {
      const executor = createLlmExecutor({
        llm,
        prompt: createChatPrompt("test"),
      });
      expect(executor.name).toBe("anonymous-llm-executor");
    });
  });

  describe("parser types", () => {
    it("listToArray parser splits mock output into array", async () => {
      const parser = createCustomParser("split-lines", (text) =>
        text.split("\n").filter(Boolean)
      );
      const executor = createLlmExecutor({
        llm,
        prompt: createChatPrompt("list"),
        parser,
      });

      const result = await executor.execute({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("boolean parser returns boolean from mock output", async () => {
      const executor = createLlmExecutor({
        llm,
        prompt: createChatPrompt("yes or no"),
        parser: createParser("boolean"),
      });

      const result = await executor.execute({});
      expect(typeof result).toBe("boolean");
    });
  });

  describe("once hook fires only on first execution", () => {
    it("once onSuccess fires once across multiple executes", async () => {
      const onceFn = jest.fn();
      const alwaysFn = jest.fn();
      const executor = createLlmExecutor({
        llm,
        prompt: createChatPrompt("test"),
      });
      executor.once("onSuccess", onceFn);
      executor.on("onSuccess", alwaysFn);

      await executor.execute({});
      await executor.execute({});
      await executor.execute({});

      expect(onceFn).toHaveBeenCalledTimes(1);
      expect(alwaysFn).toHaveBeenCalledTimes(3);
    });
  });
});
