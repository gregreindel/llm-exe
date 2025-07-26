export function openaiPromptMessageCallback(_message: any) {
  let message = { ..._message };

  if (message.role === "function") {
    message.role = "tool";
    message.tool_call_id = message.id;
    delete message.id;
  }

  if (message?.function_call) {
    const { function_call } = message;
    const toolsArr = Array.isArray(function_call)
      ? function_call
      : [function_call];
    message.role = "assistant";
    message.tool_calls = toolsArr.map((call: any) => {
      const { id, ...functionCall } = call;
      return {
        id,
        type: "function",
        function: functionCall,
      };
    });
    delete message.function_call;
  }

  // do openai-specific transformations
  return message;
}
