import { BaseLlmOutput, OutputAnthropicClaude3Chat } from "@/llm/output";

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:output/OutputAnthropicClaude3Chat", () => {
  const mock = {
    id: "chatcmpl-7KfsdfdsfZj1waHPfsdEZ",
    model: "claude-3-5-sonnet-20240620",
    type: "message",
    stop_reason: "end_turn",
    stop_sequence: null,
    usage: {
      input_tokens: 427,
      output_tokens: 1,
    },
    content: [
      {
        type: "text",
        text: "This is the assistant message content.",
      },
    ],
  };
  it("creates class with expected properties", () => {
    const output = new OutputAnthropicClaude3Chat(mock);
    expect(output).toBeInstanceOf(BaseLlmOutput);
    expect(output).toBeInstanceOf(OutputAnthropicClaude3Chat);
    expect(output).toHaveProperty("id");
    expect(output).toHaveProperty("name");
    expect(output).toHaveProperty("created");
    expect(output).toHaveProperty("results");
    expect(output).toHaveProperty("usage");
  });
  it("creates class with expected properties", () => {
    const output = new OutputAnthropicClaude3Chat(mock);
    expect((output as any).id).toEqual(mock.id);
    expect((output as any).name).toEqual(mock.model);
    expect((output as any).results).toEqual(mock.content);
    expect((output as any).usage).toEqual(mock.usage);
  });
  it("creates class with expected methods", () => {
    const output = new OutputAnthropicClaude3Chat(mock);
    expect(output).toBeInstanceOf(BaseLlmOutput);
    expect(output).toBeInstanceOf(OutputAnthropicClaude3Chat);
    expect(output).toHaveProperty("getResults");
    expect(typeof output.getResults).toEqual("function");
    expect(output).toHaveProperty("setResult");
    expect(typeof output.setResult).toEqual("function");
    expect(output).toHaveProperty("getResult");
    expect(typeof output.getResult).toEqual("function");
    expect(output).toHaveProperty("getResultContent");
    expect(typeof output.getResultContent).toEqual("function");
  });
//   it("getResults gets results", () => {
//     const output = new OutputAnthropicClaude3Chat(mock);
//     expect(output.getResults()).toEqual([
//       {
//         message: {
//           role: "assistant",
//           content: "This is the assistant message content.",
//         },
//         finish_reason: "stop",
//         index: 0,
//       },
//     ]);
//   });
//   it("getResult gets result", () => {
//     const output = new OutputAnthropicClaude3Chat(mock);
//     expect(output.getResult()).toEqual({
//       message: {
//         role: "assistant",
//         content: "This is the assistant message content.",
//       },
//       finish_reason: "stop",
//       index: 0,
//     });
//   });
  it("getResultContent gets result", () => {
    const output = new OutputAnthropicClaude3Chat(mock);
    expect(output.getResultContent()).toEqual(
      "This is the assistant message content."
    );
  });

  it("getResultContent gets undefined if not exists", () => {
    const output = new OutputAnthropicClaude3Chat(mock);
    expect(output.getResultContent(8)).toEqual(undefined);
  });

//   it("getResultContent gets function_call if content is null", () => {
//     const output = new OutputAnthropicClaude3Chat({
//       id: "chatcmpl-7KfsdfdsfZj1waHPfsdEZ",
//       object: "chat.completion",
//       created: 1685025755,
//       model: "gpt-3.5-turbo-0301",
//       usage: {
//         prompt_tokens: 427,
//         completion_tokens: 1,
//         total_tokens: 428,
//       },
//       choices: [
//         {
//           message: {
//             role: "assistant",
//             content: null,
//             function_call: {
//               name: "test_fn",
//               arguments: "{}",
//             },
//           },
//           finish_reason: "stop",
//           index: 0,
//         },
//       ],
//     });
//     expect(output.getResultContent()).toEqual(
//       JSON.stringify({ function_call: { name: "test_fn", arguments: "{}" } })
//     );
//   });
});

// getResultContent
