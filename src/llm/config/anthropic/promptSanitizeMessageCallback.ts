import { IChatMessage } from "@/interfaces";
import { maybeParseJSON } from "@/utils";

export function anthropicPromptMessageCallback(_message: IChatMessage) {
  /// TODO: Type this properly, its an Anthropic message
  let message: Record<string, any> = { ..._message };

  if (message.role === "function") {
    message.role = "user";
    message.content = [
      {
        type: "tool_result",
        tool_use_id: message.id,
        content: message.content,
      },
    ];

    delete message.id;
  }

  if (message?.function_call) {
    const { function_call } = message;
    const toolsArr = Array.isArray(function_call)
      ? function_call
      : [function_call];
    message.role = "assistant";

    message.content = toolsArr.map((call: any) => {
      const { id, name, arguments: input } = call;
      return {
        type: "tool_use",
        id,
        name,
        input: maybeParseJSON(input),
      };
    });

    delete message.function_call;
  }

  return message;
}
