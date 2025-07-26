import { IChatMessage } from "@/types";
import { maybeParseJSON } from "@/utils";

export function googleGeminiPromptMessageCallback(_message: IChatMessage) {
  /// TODO: Type this properly, its a Gemini message
  let message: Record<string, any> = { ..._message };

  const parts = [];

  if (message.role === "assistant") {
    message.role = "model";
  }

  // this should not happen, its guarded before this
  // if any get through, maybe we let later ones through?
  // should figure this out.
  // TODO: something
  if (message.role === "system") {
    message.role = "model";
  }

  // do gemini-specific transformations
  let { role, ...payload } = message;

  if (typeof payload.content === "string") {
    parts.push({ text: message.content });
  }

  if (message.role === "function") {
    role = "user";
    parts.push({
      functionResponse: {
        name: message.name,
        response: {
          result: message.content,
        },
      },
    });

    delete message.id;
  }

  if (message?.function_call) {
    const { function_call } = message;
    const toolsArr = Array.isArray(function_call)
      ? function_call
      : [function_call];
    role = "model";

    parts.push(
      ...toolsArr.map((call: any) => {
        const { name, arguments: input } = call;
        return {
          functionCall: {
            name,
            args: maybeParseJSON(input),
          },
        };
      })
    );

    delete message.function_call;
  }

  return {
    role,
    parts,
  };
}
