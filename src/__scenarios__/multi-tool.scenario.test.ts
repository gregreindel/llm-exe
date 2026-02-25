/**
 * Scenario: Multiple parallel tool calls through provider pipelines.
 *
 * Traces what happens when an LLM returns 2+ tool_use blocks in one response,
 * and the user sends both tool results back. We mock up to the API call
 * boundary to see exactly what the request body looks like.
 */
import { createDialogue } from "@/state";
import { anthropicPromptSanitize } from "@/llm/config/anthropic/promptSanitize";
import { googleGeminiPromptSanitize } from "@/llm/config/google/promptSanitize";
import { mockOutputResult } from "./mock.scenarios";

function buildParallelToolDialogue() {
  const dialogue = createDialogue("main");

  dialogue.setSystemMessage("You are a weather assistant.");
  dialogue.setUserMessage("Compare weather in SF and NYC.");

  dialogue.addFromOutput(
    mockOutputResult(
      [
        {
          type: "function_use",
          name: "get_weather",
          input: { location: "San Francisco" },
          functionId: "toolu_sf",
        },
        {
          type: "function_use",
          name: "get_weather",
          input: { location: "New York" },
          functionId: "toolu_nyc",
        },
      ],
      { stopReason: "tool_use" }
    )
  );

  dialogue.setFunctionMessage(
    '{"temp": 65, "condition": "foggy"}',
    "get_weather",
    "toolu_sf"
  );
  dialogue.setFunctionMessage(
    '{"temp": 45, "condition": "clear"}',
    "get_weather",
    "toolu_nyc"
  );

  return dialogue;
}

describe("Scenario: Anthropic parallel tool calls", () => {
  it("merges parallel tool calls into one assistant message", () => {
    const dialogue = buildParallelToolDialogue();
    const outputObj: Record<string, any> = {};
    const sanitized = anthropicPromptSanitize(
      dialogue.getHistory(),
      {},
      outputObj
    );

    expect(outputObj.system).toEqual("You are a weather assistant.");

    // Should be: user, assistant, user (alternating)
    const roles = sanitized.map((m: any) => m.role);
    expect(roles).toEqual(["user", "assistant", "user"]);

    // Assistant message has both tool_use blocks
    expect(sanitized[1].content).toHaveLength(2);
    expect(sanitized[1].content[0].type).toEqual("tool_use");
    expect(sanitized[1].content[0].name).toEqual("get_weather");
    expect(sanitized[1].content[0].id).toEqual("toolu_sf");
    expect(sanitized[1].content[1].type).toEqual("tool_use");
    expect(sanitized[1].content[1].name).toEqual("get_weather");
    expect(sanitized[1].content[1].id).toEqual("toolu_nyc");

    // User message has both tool_result blocks
    expect(sanitized[2].content).toHaveLength(2);
    expect(sanitized[2].content[0].type).toEqual("tool_result");
    expect(sanitized[2].content[0].tool_use_id).toEqual("toolu_sf");
    expect(sanitized[2].content[1].type).toEqual("tool_result");
    expect(sanitized[2].content[1].tool_use_id).toEqual("toolu_nyc");
  });

  it("does not merge non-consecutive same-role messages", () => {
    const dialogue = createDialogue("main");
    dialogue.setSystemMessage("System.");
    dialogue.setUserMessage("First question");
    dialogue.setAssistantMessage("First answer");
    dialogue.setUserMessage("Second question");

    const outputObj: Record<string, any> = {};
    const sanitized = anthropicPromptSanitize(
      dialogue.getHistory(),
      {},
      outputObj
    );

    const roles = sanitized.map((m: any) => m.role);
    expect(roles).toEqual(["user", "assistant", "user"]);
    // The two user messages are NOT merged because there's an assistant between them
    expect(sanitized[0].content).toEqual("First question");
    expect(sanitized[2].content).toEqual("Second question");
  });

  it("does not merge consecutive messages with string content", () => {
    const dialogue = createDialogue("main");
    // Two consecutive user messages with string content — unusual but possible
    dialogue.setUserMessage("Part one");
    dialogue.setUserMessage("Part two");

    const outputObj: Record<string, any> = {};
    const sanitized = anthropicPromptSanitize(
      dialogue.getHistory(),
      {},
      outputObj
    );

    // String content messages are NOT merged (only array content merges)
    expect(sanitized).toHaveLength(2);
    expect(sanitized[0].content).toEqual("Part one");
    expect(sanitized[1].content).toEqual("Part two");
  });
});

describe("Scenario: Google Gemini parallel tool calls", () => {
  it("merges parallel tool calls into one model message", () => {
    const dialogue = buildParallelToolDialogue();
    const outputObj: Record<string, any> = {};
    const sanitized = googleGeminiPromptSanitize(
      dialogue.getHistory(),
      {},
      outputObj
    );

    // System extracted
    expect(outputObj.system_instruction).toBeDefined();

    // Should be: user, model, user (alternating)
    const roles = sanitized.map((m: any) => m.role);
    expect(roles).toEqual(["user", "model", "user"]);

    // Model message has both functionCall parts
    expect(sanitized[1].parts).toHaveLength(2);
    expect(sanitized[1].parts[0].functionCall.name).toEqual("get_weather");
    expect(sanitized[1].parts[1].functionCall.name).toEqual("get_weather");

    // User message has both functionResponse parts
    expect(sanitized[2].parts).toHaveLength(2);
    expect(sanitized[2].parts[0].functionResponse.name).toEqual("get_weather");
    expect(sanitized[2].parts[1].functionResponse.name).toEqual("get_weather");
  });
});
