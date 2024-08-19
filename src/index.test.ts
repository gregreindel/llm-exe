import * as llmExe from "@/index";

describe("llmExe", () => {
  test("has all exports", () => {
    /**
     * Utilities
     */
    expect(llmExe).toHaveProperty("utils");
    /**
     * Llm
     */
    expect(llmExe).toHaveProperty("useLlm");
    /**
     * Prompt
     */
    expect(llmExe).toHaveProperty("BasePrompt");
    expect(llmExe).toHaveProperty("TextPrompt");
    expect(llmExe).toHaveProperty("ChatPrompt");
    expect(llmExe).toHaveProperty("createPrompt");
    expect(llmExe).toHaveProperty("createChatPrompt");
    /**
     * Parsers
     */
    expect(llmExe).toHaveProperty("BaseParser");
    expect(llmExe).toHaveProperty("CustomParser");
    expect(llmExe).toHaveProperty("createParser");
    expect(llmExe).toHaveProperty("createCustomParser");
    /**
     * Core Functions
     */
    expect(llmExe).toHaveProperty("BaseExecutor");
    expect(llmExe).toHaveProperty("createCoreExecutor");
    expect(llmExe).toHaveProperty("createLlmExecutor");

    /**
     * Callable
     */
    expect(llmExe).toHaveProperty("useExecutors");
    expect(llmExe).toHaveProperty("createCallableExecutor");
    /**
     * Embedding
     */
    expect(llmExe).toHaveProperty("createEmbedding");
    /**
     * State
     */
    expect(llmExe).toHaveProperty("DefaultState");
    expect(llmExe).toHaveProperty("BaseStateItem");
    expect(llmExe).toHaveProperty("DefaultStateItem");
    expect(llmExe).toHaveProperty("createState");
    expect(llmExe).toHaveProperty("createStateItem");
  });
});
