import { IChatMessages, InternalMessage } from "@/types";
import { generateToolCallId } from "@/utils/modules/generateToolCallId";
import { fromInternal } from "@/converters";

export function anthropicPromptSanitize(
  _messages: string | IChatMessages,
  _inputBodyObj: Record<string, any>,
  _outputObj: Record<string, any>
) {
  if (typeof _messages === "string") {
    return [{ role: "user", content: _messages }];
  }

  if (!_messages || !Array.isArray(_messages)) {
    return _messages || [];
  }

  // Clone messages to avoid mutations
  const messages = [..._messages.map((a) => ({ ...a }))];

  // Check if messages have _meta field (indicating they came from converters)
  const hasMetadata = messages.some((msg: any) => msg._meta !== undefined);

  if (hasMetadata) {
    try {
      // Messages have metadata - use converter to reconstruct Anthropic format
      const anthropicMessages = fromInternal(
        messages as InternalMessage[],
        "anthropic",
        {
          strict: false,
          validate: false,
        }
      );

      // Extract system message if present
      const [first, ...rest] = anthropicMessages;
      if (first && first.role === "system" && rest.length > 0) {
        _outputObj.system = first.content;
        return rest;
      } else if (first && first.role === "system" && rest.length === 0) {
        // Single system message becomes user message
        return [{ role: "user", content: first.content }];
      }

      return anthropicMessages;
    } catch (error) {
      console.warn(
        "Failed to convert messages back to Anthropic format:",
        error
      );
      // Fall through to legacy logic
    }
  }

  // Legacy transformation logic for backward compatibility
  // Handle system message extraction (existing logic)
  const [first, ...rest] = messages;
  let messagesToProcess = messages;

  // Extract system message to output object if it's first
  if (first && first.role === "system" && rest.length > 0) {
    _outputObj.system = first.content;
    messagesToProcess = rest;
  } else if (first && first.role === "system" && rest.length === 0) {
    // Single system message becomes user message
    return [{ role: "user", content: first.content }];
  }

  // Now transform messages for tool calling
  const transformedMessages: any[] = [];
  const pendingToolCalls = new Map<string, string>(); // name -> id mapping

  for (let i = 0; i < messagesToProcess.length; i++) {
    const msg = messagesToProcess[i];

    // Transform assistant messages with function_call
    if (msg.role === "assistant" && (msg as any).function_call) {
      const toolUseId = generateToolCallId("anthropic");
      pendingToolCalls.set((msg as any).function_call.name, toolUseId);

      const content = [];

      // Add text content if present
      if (msg.content) {
        content.push({ type: "text", text: msg.content });
      }

      // Add tool use block
      content.push({
        type: "tool_use",
        id: toolUseId,
        name: (msg as any).function_call.name,
        input:
          typeof (msg as any).function_call.arguments === "string"
            ? JSON.parse((msg as any).function_call.arguments) // Trust LLM-generated JSON is valid
            : (msg as any).function_call.arguments,
      });

      transformedMessages.push({
        role: "assistant",
        content,
      });
    }

    // Transform function messages to tool results
    else if (msg.role === "function") {
      const toolResults = [];

      // Collect this and any consecutive function messages
      // (Anthropic requires all parallel tool results in one user message)
      while (
        i < messagesToProcess.length &&
        messagesToProcess[i].role === "function"
      ) {
        const funcMsg = messagesToProcess[i] as any;

        // Try to find matching tool use ID
        let tool_use_id = funcMsg.tool_call_id;
        if (!tool_use_id && pendingToolCalls.has(funcMsg.name)) {
          tool_use_id = pendingToolCalls.get(funcMsg.name);
        }
        if (!tool_use_id) {
          tool_use_id = generateToolCallId("anthropic");
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id,
          content: String(funcMsg.content) || "No response",
        });

        i++; // Move to next message
      }
      i--; // Adjust for loop increment

      // Add user message with all tool results
      transformedMessages.push({
        role: "user",
        content: toolResults,
      });
    }

    // Transform system messages to user messages (keep existing behavior)
    else if (msg.role === "system") {
      transformedMessages.push({
        role: "user",
        content: msg.content, // Don't transform to content blocks
      });
    }

    // Pass through all other messages unchanged
    else {
      transformedMessages.push(msg);
    }
  }

  return transformedMessages;
}
