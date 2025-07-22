import { generateToolCallId } from "@/utils/modules/generateToolCallId";

/**
 * Sanitizes messages for OpenAI API, transforming deprecated function/function_call
 * format to the new tools/tool_calls format.
 */
export function promptSanitize(messages: any) {
  // If it's a simple string, convert to messages array
  if (typeof messages === "string") {
    return [{ role: "user", content: messages }];
  }
  
  // Handle null/undefined cases
  if (!messages || !Array.isArray(messages)) {
    return messages || [];
  }
  
  // Track tool call IDs for matching responses (O(1) lookup)
  const toolCallMap = new Map<string, string>();
  
  return messages.map((msg: any, index: number) => {
    // Transform assistant messages with function_call to tool_calls
    if (msg.role === 'assistant' && msg.function_call) {
      const toolCallId = generateToolCallId('openai');
      
      // Store mapping for potential responses
      toolCallMap.set(`${msg.function_call.name}_${index}`, toolCallId);
      
      return {
        role: 'assistant',
        content: msg.content || null,  // OpenAI allows null content
        tool_calls: [{
          id: toolCallId,
          type: 'function',
          function: {
            name: msg.function_call.name,
            arguments: typeof msg.function_call.arguments === 'string' 
              ? msg.function_call.arguments 
              : JSON.stringify(msg.function_call.arguments)
          }
        }]
      };
    }
    
    // Transform function messages to tool messages
    if (msg.role === 'function') {
      let tool_call_id = msg.tool_call_id;
      
      // If no tool_call_id provided, try to match with previous assistant message
      if (!tool_call_id) {
        for (let i = index - 1; i >= 0; i--) {
          const prevMsg = messages[i];
          if (prevMsg.role === 'assistant' && 
              prevMsg.function_call && 
              prevMsg.function_call.name === msg.name) {
            tool_call_id = toolCallMap.get(`${msg.name}_${i}`);
            break;
          }
        }
      }
      
      // If still no ID, generate one
      if (!tool_call_id) {
        tool_call_id = generateToolCallId('openai');
      }
      
      return {
        role: 'tool',
        content: String(msg.content),  // Must be string
        tool_call_id
      };
    }
    
    // Pass through other messages unchanged
    return msg;
  });
}

export function useJsonSanitize(v: any) {
  return v ? "json_object" : "text";
}