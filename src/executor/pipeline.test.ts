import { createLlmExecutor, createCoreExecutor } from "@/executor";
import { useLlm } from "@/llm";
import { createChatPrompt } from "@/prompt";
import { createParser, createCustomParser } from "@/parser";
import { createDialogue } from "@/state";

/**
 * Pipeline tests: verify the full Prompt → LLM → Parser → Typed Result flow
 * with real parsing logic (not just type/instance checks).
 * Uses the mock LLM provider which echoes the formatted prompt.
 */
describe("llm-exe:pipeline end-to-end", () => {
  const llm = useLlm("openai.chat-mock.v1", { model: "mock" });

  describe("custom parser transforms", () => {
    it("parser receives the raw LLM text and returns structured output", async () => {
      const prompt = createChatPrompt("Return data");
      const parser = createCustomParser("extractor", (raw) => {
        return { raw, length: raw.length };
      });
      const executor = createLlmExecutor({ llm, prompt, parser });

      const result = await executor.execute({});
      expect(result.raw).toContain("Hello world from LLM!");
      expect(result.length).toBe(result.raw.length);
    });

    it("parser can return an array", async () => {
      const prompt = createChatPrompt("Split words");
      const parser = createCustomParser("splitter", (raw) =>
        raw.split(" ").filter((w) => w.length > 0)
      );
      const executor = createLlmExecutor({ llm, prompt, parser });

      const result = await executor.execute({});
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result).toContain("Hello");
    });

    it("parser can return a number", async () => {
      const prompt = createChatPrompt("Count something");
      const parser = createCustomParser("counter", (raw) => raw.length);
      const executor = createLlmExecutor({ llm, prompt, parser });

      const result = await executor.execute({});
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThan(0);
    });
  });

  describe("template variables flow through to LLM and parser", () => {
    it("handlebars variables are rendered before LLM call", async () => {
      const prompt = createChatPrompt<{ topic: string }>(
        "Tell me about {{topic}}"
      );
      const parser = createParser("string");
      const executor = createLlmExecutor({ llm, prompt, parser });

      const result = await executor.execute({ topic: "TypeScript" });
      // Mock LLM echoes the formatted prompt, so we can verify template rendering
      expect(result).toContain("Tell me about TypeScript");
    });

    it("multiple template variables render correctly", async () => {
      const prompt = createChatPrompt<{ name: string; action: string }>(
        "{{name}} wants to {{action}}"
      );
      const parser = createCustomParser("check", (raw) => ({
        hasName: raw.includes("Alice"),
        hasAction: raw.includes("code"),
      }));
      const executor = createLlmExecutor({ llm, prompt, parser });

      const result = await executor.execute({ name: "Alice", action: "code" });
      expect(result.hasName).toBe(true);
      expect(result.hasAction).toBe(true);
    });
  });

  describe("executor composition", () => {
    it("output of one executor feeds into another", async () => {
      const prompt1 = createChatPrompt("Step one");
      const parser1 = createCustomParser("step1", (raw) => ({
        step1Result: raw.substring(0, 20),
      }));
      const executor1 = createLlmExecutor({ llm, prompt: prompt1, parser: parser1 });

      const prompt2 = createChatPrompt<{ input: string }>(
        "Step two with {{input}}"
      );
      const parser2 = createParser("string");
      const executor2 = createLlmExecutor({ llm, prompt: prompt2, parser: parser2 });

      const step1 = await executor1.execute({});
      const step2 = await executor2.execute({ input: step1.step1Result });

      expect(step2).toContain("Step two with");
      expect(step2).toContain(step1.step1Result);
    });

    it("CoreExecutor wraps sync logic alongside LLM executors", async () => {
      const postProcess = createCoreExecutor(
        (input: { text: string }) => input.text.toUpperCase()
      );

      const prompt = createChatPrompt("Hello");
      const executor = createLlmExecutor({ llm, prompt });

      const llmResult = await executor.execute({});
      const processed = await postProcess.execute({ text: llmResult });

      expect(processed).toBe(llmResult.toUpperCase());
    });
  });

  describe("hooks in pipeline", () => {
    it("onSuccess hook receives the parsed result", async () => {
      const successData: any[] = [];
      const prompt = createChatPrompt("Test hooks pipeline");
      const parser = createCustomParser("wrap", (raw) => ({ text: raw }));
      const executor = createLlmExecutor(
        { llm, prompt, parser },
        {
          hooks: {
            onSuccess: (data) => successData.push(data),
          },
        }
      );

      const result = await executor.execute({});
      expect(result.text).toContain("Hello world from LLM!");
      expect(successData).toHaveLength(1);
      expect(successData[0]).toHaveProperty("output");
    });

    it("onError and onComplete both fire when parser throws", async () => {
      const events: string[] = [];
      const prompt = createChatPrompt("Error test");
      const parser = createCustomParser("fail", () => {
        throw new Error("parse broke");
      });
      const executor = createLlmExecutor(
        { llm, prompt, parser },
        {
          hooks: {
            onError: () => events.push("error"),
            onComplete: () => events.push("complete"),
          },
        }
      );

      await expect(executor.execute({})).rejects.toThrow("parse broke");
      expect(events).toEqual(["error", "complete"]);
    });

    it("once hook fires exactly once across multiple executions", async () => {
      let count = 0;
      const prompt = createChatPrompt("Once test");
      const executor = createLlmExecutor({ llm, prompt });
      executor.once("onComplete", () => count++);

      await executor.execute({});
      await executor.execute({});
      await executor.execute({});

      expect(count).toBe(1);
    });
  });

  describe("dialogue integration with executor", () => {
    it("builds a conversation and uses it in an executor", async () => {
      const dialogue = createDialogue("test-conv");
      dialogue.addUserMessage("What is TypeScript?");
      dialogue.addAssistantMessage("TypeScript is a typed superset of JavaScript.");

      const prompt = createChatPrompt<{ history: string }>(
        "Given this conversation: {{history}}\nContinue the discussion."
      );
      const executor = createLlmExecutor({ llm, prompt });

      const result = await executor.execute({
        history: JSON.stringify(dialogue.getHistory()),
      });

      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });

    it("addFromOutput integrates with executor results via BaseLlmOutput", async () => {
      const dialogue = createDialogue("test-conv");
      dialogue.addUserMessage("Hello");

      // Execute and capture the raw LLM output (before parsing)
      const prompt = createChatPrompt("Respond to greeting");
      const llmInstance = useLlm("openai.chat-mock.v1", { model: "mock" });

      // Use the LLM directly to get an OutputResult
      const formatted = prompt.format({});
      const output = await llmInstance.call(formatted);

      dialogue.addFromOutput(output);

      const history = dialogue.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0].role).toEqual("user");
      expect(history[1].role).toEqual("assistant");
      expect(history[1].content).toContain("Hello world from LLM!");
    });

    it("multi-turn conversation with executor", async () => {
      const dialogue = createDialogue("multi-turn");

      // Turn 1
      dialogue.addUserMessage("First question");
      const prompt1 = createChatPrompt<{ question: string }>(
        "Answer: {{question}}"
      );
      const executor = createLlmExecutor({ llm, prompt: prompt1 });
      const answer1 = await executor.execute({ question: "First question" });
      dialogue.addAssistantMessage(answer1);

      // Turn 2
      dialogue.addUserMessage("Follow-up question");
      const answer2 = await executor.execute({ question: "Follow-up question" });
      dialogue.addAssistantMessage(answer2);

      const history = dialogue.getHistory();
      expect(history).toHaveLength(4);
      expect(history[0].role).toEqual("user");
      expect(history[1].role).toEqual("assistant");
      expect(history[2].role).toEqual("user");
      expect(history[3].role).toEqual("assistant");

      // Verify serialization captures the full conversation
      const serialized = dialogue.serialize();
      expect(serialized.value).toHaveLength(4);
      expect(serialized.class).toEqual("Dialogue");
    });
  });

  describe("boolean parser end-to-end", () => {
    it("boolean parser processes mock output", async () => {
      const prompt = createChatPrompt("Is the sky blue?");
      const parser = createParser("boolean");
      const executor = createLlmExecutor({ llm, prompt, parser });

      const result = await executor.execute({});
      // Mock LLM returns "Hello world..." which isn't a clear boolean,
      // but the parser should still produce a boolean
      expect(typeof result).toBe("boolean");
    });
  });

  describe("error recovery patterns", () => {
    it("executor can be reused after an error", async () => {
      let shouldFail = true;
      const prompt = createChatPrompt("Retry test");
      const parser = createCustomParser("conditional-fail", (raw) => {
        if (shouldFail) {
          shouldFail = false;
          throw new Error("transient failure");
        }
        return raw;
      });
      const executor = createLlmExecutor({ llm, prompt, parser });

      // First call fails
      await expect(executor.execute({})).rejects.toThrow("transient failure");
      expect(executor.getMetadata().executions).toBe(1);

      // Second call succeeds
      const result = await executor.execute({});
      expect(typeof result).toBe("string");
      expect(executor.getMetadata().executions).toBe(2);
    });
  });
});
