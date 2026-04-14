import {
  createLlmFunctionExecutor,
  LlmExecutorWithFunctions,
} from "@/executor";
import { useLlm } from "@/llm";
import { createChatPrompt } from "@/prompt";
import { JsonParser, StringParser } from "@/parser";
import { LlmFunctionParser } from "@/parser/parsers/LlmNativeFunctionParser";
import { mockOutputResultObject } from "../../utils/mock.helpers";

/**
 * Integration tests for LlmExecutorWithFunctions
 *
 * Covers behavior beyond constructor smoke tests:
 *  - parser wrapping (default + custom)
 *  - function_use content pass-through
 *  - text fallback when LLM returns no function call
 *  - inner parser is invoked on text content
 */
describe("llm-exe:executor/LlmExecutorWithFunctions integration", () => {
  const llm = useLlm("openai.chat-mock.v1", { model: "mock" });
  const prompt = createChatPrompt("This is a prompt.");

  describe("parser wrapping", () => {
    it("wraps the executor parser in an LlmFunctionParser", () => {
      const executor = new LlmExecutorWithFunctions({ llm, prompt });
      expect(executor.parser).toBeInstanceOf(LlmFunctionParser);
      expect(executor.parser.target).toEqual("function_call");
    });

    it("uses StringParser as the inner parser by default", () => {
      const executor = new LlmExecutorWithFunctions({ llm, prompt });
      const wrapped = executor.parser as LlmFunctionParser<StringParser>;
      expect(wrapped.parser).toBeInstanceOf(StringParser);
    });

    it("preserves a user-supplied parser as the inner parser", () => {
      const inner = new JsonParser();
      const executor = new LlmExecutorWithFunctions({
        llm,
        prompt,
        parser: inner,
      });
      const wrapped = executor.parser as LlmFunctionParser<JsonParser>;
      expect(wrapped.parser).toBe(inner);
    });

    it("createLlmFunctionExecutor produces an executor with the same wrapping", () => {
      const inner = new StringParser();
      const executor = createLlmFunctionExecutor({
        llm,
        prompt,
        parser: inner,
      });
      expect(executor).toBeInstanceOf(LlmExecutorWithFunctions);
      expect(executor.parser).toBeInstanceOf(LlmFunctionParser);
      expect(
        (executor.parser as LlmFunctionParser<StringParser>).parser
      ).toBe(inner);
    });
  });

  describe("execute output handling", () => {
    it("returns parsed text when LLM responds with text only", async () => {
      const executor = new LlmExecutorWithFunctions({ llm, prompt });
      const result = await executor.execute(
        { input: "anything" },
        { functionCall: "auto", functions: [] }
      );
      // mock LLM echoes the prompt back as text and the inner StringParser
      // returns the same string.
      expect(typeof result).toBe("string");
    });

    it("returns the content array when the LLM emits a function_use block", async () => {
      const executor = new LlmExecutorWithFunctions({ llm, prompt });

      const functionCallContent = [
        {
          type: "function_use" as const,
          functionId: "call-1",
          name: "lookup_user",
          input: { id: "abc" },
        },
      ];

      // Replace the LLM call with a response containing a function_use block.
      jest.spyOn(executor.llm, "call").mockResolvedValue({
        getResult: () => mockOutputResultObject(functionCallContent),
        getResultContent: () => functionCallContent,
        getResultText: () => "",
      } as any);

      const result = await executor.execute(
        { input: "anything" },
        { functionCall: "auto", functions: [] }
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(functionCallContent);
    });

    it("delegates to the inner parser when no function_use block is present", async () => {
      const inner = new JsonParser();
      const innerSpy = jest.spyOn(inner, "parse");
      const executor = new LlmExecutorWithFunctions({
        llm,
        prompt,
        parser: inner,
      });

      const textContent = [
        { type: "text" as const, text: '{"ok": true}' },
      ];

      jest.spyOn(executor.llm, "call").mockResolvedValue({
        getResult: () => mockOutputResultObject(textContent),
        getResultContent: () => textContent,
        getResultText: () => '{"ok": true}',
      } as any);

      const result = await executor.execute(
        { input: "anything" },
        { functionCall: "none", functions: [] }
      );

      expect(innerSpy).toHaveBeenCalledWith('{"ok": true}');
      expect(result).toEqual({ ok: true });
    });
  });
});
