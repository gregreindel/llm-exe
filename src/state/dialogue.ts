import {
  IChatMessageContentDetailed,
  IChatMessages,
  InternalMessage,
} from "@/types";
import { BaseStateItem } from "./item";
import { maybeStringifyJSON } from "@/utils";
import { LlmExeError } from "@/utils/modules/errors";
import { toInternal, fromInternal } from "@/converters";

export class Dialogue extends BaseStateItem<InternalMessage[]> {
  public name: string;

  constructor(name: string) {
    super(name, [] as InternalMessage[]);
    this.name = name;
  }

  setUserMessage(
    content: string | IChatMessageContentDetailed[],
    name?: string
  ) {
    if (content) {
      // Use toInternal for consistent conversion
      const msg = { role: "user", content, ...(name && { name }) };
      const internalMessages = toInternal(msg);
      this.value.push(...internalMessages);
    }
    return this;
  }

  setAssistantMessage(content: string | null) {
    // Only add if content is truthy (maintains backward compatibility)
    if (content) {
      const msg = { role: "assistant", content };
      const internalMessages = toInternal(msg);
      this.value.push(...internalMessages);
    }
    return this;
  }

  setSystemMessage(content: string) {
    if (content) {
      const msg = { role: "system", content };
      const internalMessages = toInternal(msg);
      this.value.push(...internalMessages);
    }
    return this;
  }

  setFunctionMessage(content: string, name: string) {
    if (content) {
      const msg = { role: "function", content, name };
      const internalMessages = toInternal(msg);
      this.value.push(...internalMessages);
    }
    return this;
  }
  setFunctionCallMessage(input: {
    function_call: { name: string; arguments: string };
  }) {
    if (!input?.function_call) {
      throw new LlmExeError(`Invalid arguments`, "state", {
        error: `Invalid arguments: missing required function_call`,
        module: "dialogue",
      });
    }
    const msg = {
      role: "assistant",
      content: null,
      function_call: {
        name: input?.function_call.name,
        arguments: maybeStringifyJSON(input?.function_call.arguments),
      }
    };
    const internalMessages = toInternal(msg);
    this.value.push(...internalMessages);
    return this;
  }
  setMessageTurn(
    userMessage: string,
    assistantMessage: string,
    systemMessage: string = ""
  ) {
    this.setUserMessage(userMessage);
    this.setAssistantMessage(assistantMessage);
    this.setSystemMessage(systemMessage);
    return this;
  }

  setHistory(messages: IChatMessages | any[]): this {
    // Clear existing
    this.value = [];
    
    if (!Array.isArray(messages)) {
      throw new Error('setHistory expects an array of messages');
    }
    
    // Convert each message using toInternal for proper format detection
    for (const [index, message] of messages.entries()) {
      try {
        const internalMessages = toInternal(message);
        this.value.push(...internalMessages);
      } catch (error: any) {
        // Log the error with context but don't fail completely
        console.warn(`Failed to convert message at index ${index}:`, error.message, message);
        
        // Fallback to manual parsing for edge cases
        switch (message?.role) {
          case "user":
            this.setUserMessage(message?.content, message?.name);
            break;
          case "assistant":
            if (message.function_call) {
              this.setFunctionCallMessage({
                function_call: message.function_call,
              });
            } else if (message?.content !== undefined) {
              this.setAssistantMessage(message?.content);
            }
            break;
          case "system":
            this.setSystemMessage(message?.content);
            break;
          case "function":
            this.setFunctionMessage(message?.content, message.name);
            break;
          case "tool":
            this.setToolMessage(message?.content, message.tool_call_id);
            break;
          case "model": // Gemini's "model" is equivalent to "assistant"
            this.setAssistantMessage(message?.content);
            break;
        }
      }
    }
    return this;
  }

  getHistory(provider: "openai" | "anthropic" | "gemini" | "unknown" = "unknown"): any[] {
    // fromInternal doesn't support "unknown", so handle it specially
    if (provider === "unknown") {
      // Return a generic format that matches IChatMessages
      return this.value.map(msg => {
        const base: any = {
          role: msg.role,
          content: msg.content.length === 1 && msg.content[0].type === "text" 
            ? msg.content[0].text 
            : msg.content.length === 0 && msg.function_call
            ? null  // Function calls have null content
            : msg.content
        };
        if (msg.name) base.name = msg.name;
        if (msg.function_call) base.function_call = msg.function_call;
        if (msg.tool_call_id) base.tool_call_id = msg.tool_call_id;
        return base;
      });
    }
    return fromInternal(this.value, provider, {
      strict: false,
      validate: false
    });
  }

  // Override getValue to maintain correct type
  getValue(): InternalMessage[] {
    return this.value;
  }

  // New method for tool messages (new OpenAI format)
  setToolMessage(content: string, toolCallId: string): this {
    if (content) {
      const msg = { role: "tool", content, tool_call_id: toolCallId };
      const internalMessages = toInternal(msg);
      this.value.push(...internalMessages);
    }
    return this;
  }

  // Override setValue to handle type conversion
  setValue(value: any) {
    if (!Array.isArray(value)) {
      throw new Error("Dialogue value must be an array");
    }
    // If it looks like IChatMessages, convert it
    if (value.length > 0 && value[0].role && typeof value[0].content !== "undefined") {
      // Convert each message individually
      this.value = [];
      for (const msg of value) {
        const internalMessages = toInternal(msg);
        this.value.push(...internalMessages);
      }
    } else {
      // Assume it's already InternalMessage[]
      this.value = value;
    }
  }

  serialize() {
    return {
      class: "Dialogue",
      name: this.name,
      value: this.getHistory() // Serialize in legacy format for backward compatibility
    };
  }
  // deserialize() {}
}
