import { IChatMessages } from "@/types";
import { fromInternal } from "@/converters";
import { InternalMessage } from "@/converters/types";

// Define types for Gemini message parts
interface GeminiTextPart {
  text: string;
}

interface GeminiFunctionCallPart {
  functionCall: {
    name: string;
    args: any;
  };
}

interface GeminiFunctionResponsePart {
  functionResponse: {
    name: string;
    response: {
      result: any;
    };
  };
}

type GeminiPart =
  | GeminiTextPart
  | GeminiFunctionCallPart
  | GeminiFunctionResponsePart;

interface GeminiMessage {
  role: string;
  parts: GeminiPart[];
}

export function googleGeminiPromptSanitize(
  _messages: string | IChatMessages,
  _inputBodyObj: Record<string, any>,
  _outputObj: Record<string, any>
): GeminiMessage[] {
  /**
   * If _messages is a string, return it as is.
   */
  if (typeof _messages === "string") {
    return [{ role: "user", parts: [{ text: _messages }] }];
  }

  if (!Array.isArray(_messages)) {
    if (!_messages) {
      return [];
    }
    throw new Error("Invalid messages format");
  }

  if (_messages.length === 0) {
    throw new Error("Empty messages array");
  }

  // Clone messages to avoid mutations
  const messages = [..._messages.map((a) => ({ ...a }))];

  // Check if messages have _meta field (indicating they came from converters)
  const hasMetadata = messages.some((msg: any) => msg._meta !== undefined);

  if (hasMetadata) {
    try {
      // Messages have metadata - use converter to reconstruct Gemini format
      const geminiMessages = fromInternal(
        messages as InternalMessage[],
        "gemini",
        {
          strict: false,
          validate: false,
        }
      );

      // Extract system instructions if present
      const systemMessages = geminiMessages.filter(
        (msg: any) => msg.role === "system"
      );
      const nonSystemMessages = geminiMessages.filter(
        (msg: any) => msg.role !== "system"
      );

      if (systemMessages.length > 0) {
        // Add system instructions to output object
        _outputObj.system_instruction = {
          parts: systemMessages.map((message: any) => ({
            text:
              typeof message.content === "string"
                ? message.content
                : String(message.content),
          })),
        };
      }

      // If only system messages, convert to user message
      if (nonSystemMessages.length === 0 && systemMessages.length === 1) {
        return [
          {
            role: "user",
            parts: [
              {
                text:
                  typeof systemMessages[0].content === "string"
                    ? systemMessages[0].content
                    : String(systemMessages[0].content),
              },
            ],
          },
        ];
      }

      return nonSystemMessages;
    } catch (error) {
      console.warn("Failed to convert messages back to Gemini format:", error);
      // Fall through to legacy logic
    }
  }

  // Legacy transformation logic for backward compatibility
  // Handle single system message case
  if (messages.length === 1 && messages[0].role === "system") {
    return [{ role: "user", parts: [{ text: messages[0].content }] }];
  }

  // Extract system instructions
  const systemMessages = messages.filter((msg) => msg.role === "system");
  const nonSystemMessages = messages.filter((msg) => msg.role !== "system");

  if (systemMessages.length > 0) {
    // Add system instructions to output object
    _outputObj.system_instruction = {
      parts: systemMessages.map((message) => ({ text: message.content })),
    };
  }

  // Transform messages for tool calling
  const transformedMessages: GeminiMessage[] = [];
  const pendingFunctionCalls = new Map<string, any>(); // name -> args mapping

  for (let i = 0; i < nonSystemMessages.length; i++) {
    const msg = nonSystemMessages[i];

    // Transform assistant messages with function_call
    if (msg.role === "assistant" && (msg as any).function_call) {
      // Store function call details for matching responses
      pendingFunctionCalls.set(
        (msg as any).function_call.name,
        (msg as any).function_call.arguments
      );

      const parts = [];

      // Add text part if content exists
      if (msg.content) {
        parts.push({ text: msg.content });
      }

      // Add function call part
      parts.push({
        functionCall: {
          name: (msg as any).function_call.name,
          args:
            typeof (msg as any).function_call.arguments === "string"
              ? JSON.parse((msg as any).function_call.arguments) // Trust LLM-generated JSON is valid
              : (msg as any).function_call.arguments,
        },
      });

      transformedMessages.push({
        role: "model", // Gemini uses 'model' instead of 'assistant'
        parts,
      });
    }

    // Transform function messages to function responses
    else if (msg.role === "function") {
      // Gemini puts function responses in user messages
      transformedMessages.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: (msg as any).name,
              response: {
                result: msg.content,
              },
            },
          },
        ],
      });
    }

    // Transform regular user messages
    else if (msg.role === "user") {
      transformedMessages.push({
        role: "user",
        parts:
          typeof msg.content === "string"
            ? [{ text: msg.content }]
            : Array.isArray(msg.content)
              ? (msg.content as any) // Pass through array content as-is
              : [{ text: String(msg.content) }],
      });
    }

    // Transform assistant to model role
    else if (msg.role === "assistant") {
      transformedMessages.push({
        role: "model",
        parts: [{ text: msg.content as string }],
      });
    }

    // Pass through other messages with appropriate transformation
    else {
      transformedMessages.push({
        role: (msg as any).role,
        parts: [{ text: String((msg as any).content) }],
      });
    }
  }

  return transformedMessages;
}
