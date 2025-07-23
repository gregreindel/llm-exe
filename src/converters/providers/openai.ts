/**
 * OpenAI Message Converter
 *
 * Handles conversion between OpenAI's message format and the internal format.
 * Supports both legacy (function_call) and new (tool_calls) formats.
 */

import { ConversionError, ValidationError, ConverterOptions } from "../types";
import { OpenAIContentPart, OpenAIMessage } from "../../interfaces/openai";
import { ContentPart, InternalMessage, TextContentPart } from "@/types";
import { generateUniqueNameId } from "@/utils/modules/generateUniqueNameId";
import { isInternalMessage } from "@/utils";

/**
 * Type guard for OpenAI tool call
 */
function isValidToolCall(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    obj.type === "function" &&
    obj.function &&
    typeof obj.function.name === "string" &&
    typeof obj.function.arguments === "string"
  );
}

/**
 * Convert content parts to text string
 */
function contentPartsToText(content: ContentPart[]): string {
  return content
    .filter((part): part is TextContentPart => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

/**
 * Convert internal content to OpenAI format intelligently
 * Decides whether to use string or array format based on content and metadata
 */
function internalContentToOpenAI(
  content: ContentPart[],
  role: string,
  metadata?: any
): string | null | OpenAIContentPart[] {
  if (content.length === 0) {
    // Empty content: assistant gets null, others get empty array
    return role === "assistant" ? null : [];
  } else if (metadata?.original?.wasArray) {
    // Respect original format if metadata exists
    return contentPartsToOpenAI(content);
  } else if (content.some((p) => p.type !== "text")) {
    // Non-text content must be array
    return contentPartsToOpenAI(content);
  } else if (content.length > 1) {
    // Multiple parts should be array (intelligent default)
    return contentPartsToOpenAI(content);
  } else {
    // Single text part can be string
    return contentPartsToText(content);
  }
}

/**
 * Convert content parts to OpenAI content
 */
function contentPartsToOpenAI(content: ContentPart[]): OpenAIContentPart[] {
  return content.map((part) => {
    if (part.type === "text") {
      return {
        type: "text",
        text: part.text,
      };
    } else if (part.type === "image") {
      // Convert image content
      // If it's base64, create a data URL
      const url =
        part.source.type === "base64"
          ? `data:${part.mediaType};base64,${part.source.data}`
          : part.source.url || "";

      return {
        type: "image_url",
        image_url: {
          url,
          detail: "auto",
        },
      };
    } else {
      // For unsupported types, convert to text
      return {
        type: "text",
        text: `[${part.type} content]`,
      };
    }
  });
}

/**
 * Convert OpenAI content to internal format
 */
function openAIContentToInternal(
  content: string | null | OpenAIContentPart[]
): ContentPart[] {
  if (content === null) {
    return [];
  }

  if (typeof content === "string") {
    return [{ type: "text", text: content }];
  }

  if (Array.isArray(content)) {
    return content.map((part) => {
      if (part.type === "text") {
        return {
          type: "text",
          text: part.text,
        };
      } else if (part.type === "image_url") {
        // Parse the URL to determine if it's base64 or regular URL
        const url = part.image_url.url;
        const isDataUrl = url.startsWith("data:");

        if (isDataUrl) {
          // Extract media type and base64 data
          const match = url.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            return {
              type: "image" as const,
              mediaType: match[1],
              source: {
                type: "base64" as const,
                data: match[2],
              },
            };
          }
        }

        // Regular URL
        return {
          type: "image" as const,
          mediaType: "image/jpeg", // Default, OpenAI doesn't specify
          source: {
            type: "url" as const,
            url,
          },
        };
      }

      // Unknown type, treat as text
      return {
        type: "text",
        text: `[Unknown content type: ${(part as any).type}]`,
      };
    });
  }

  return [];
}

/**
 * Validate OpenAI message format
 */
function validateOpenAIMessage(msg: any, _options?: ConverterOptions): void {
  if (!msg || typeof msg !== "object") {
    throw new ValidationError("Message must be an object", "message", msg);
  }

  const validRoles = ["system", "user", "assistant", "function", "tool"];
  if (!validRoles.includes(msg.role)) {
    throw new ValidationError(
      `Invalid role: ${msg.role}. Must be one of: ${validRoles.join(", ")}`,
      "role",
      msg.role
    );
  }

  // Validate content
  if (
    msg.content !== null &&
    typeof msg.content !== "string" &&
    !Array.isArray(msg.content)
  ) {
    throw new ValidationError(
      "Content must be string, array, or null",
      "content",
      msg.content
    );
  }

  // Validate content array if present
  if (Array.isArray(msg.content)) {
    msg.content.forEach((item: any, index: number) => {
      if (!item || typeof item !== "object" || !item.type) {
        throw new ValidationError(
          `Invalid content item at index ${index}: missing type`,
          `content[${index}]`,
          item
        );
      }

      if (item.type === "text" && typeof item.text !== "string") {
        throw new ValidationError(
          `Invalid text content at index ${index}`,
          `content[${index}].text`,
          item.text
        );
      }

      if (
        item.type === "image_url" &&
        (!item.image_url || typeof item.image_url.url !== "string")
      ) {
        throw new ValidationError(
          `Invalid image_url content at index ${index}`,
          `content[${index}].image_url`,
          item.image_url
        );
      }
    });
  }

  // Validate tool_calls if present
  if (msg.tool_calls !== undefined) {
    if (!Array.isArray(msg.tool_calls)) {
      throw new ValidationError(
        "tool_calls must be an array",
        "tool_calls",
        msg.tool_calls
      );
    }

    msg.tool_calls.forEach((tc: any, index: number) => {
      if (!isValidToolCall(tc)) {
        throw new ValidationError(
          `Invalid tool call at index ${index}`,
          `tool_calls[${index}]`,
          tc
        );
      }
    });
  }

  // Validate function_call if present
  if (msg.function_call !== undefined) {
    if (
      !msg.function_call ||
      typeof msg.function_call.name !== "string" ||
      typeof msg.function_call.arguments !== "string"
    ) {
      throw new ValidationError(
        "function_call must have name and arguments as strings",
        "function_call",
        msg.function_call
      );
    }
  }

  // Role-specific validations
  if (msg.role === "tool" && !msg.tool_call_id) {
    throw new ValidationError(
      "tool role requires tool_call_id",
      "tool_call_id",
      undefined
    );
  }

  if (msg.role === "function" && !msg.name) {
    throw new ValidationError("function role requires name", "name", undefined);
  }
}

/**
 * Convert a single OpenAI message to internal format
 */
export function openAIMessageToInternal(
  msg: any,
  options: ConverterOptions = {}
): InternalMessage[] {
  const results: InternalMessage[] = [];
  const idGenerator = options.generateId || generateUniqueNameId;

  // Validate if requested
  if (options.validate !== false) {
    validateOpenAIMessage(msg, options);
  }

  // Handle assistant messages with tool_calls (new format)
  if (msg.role === "assistant" && msg.tool_calls && msg.tool_calls.length > 0) {
    const groupId = `group_${idGenerator()}`;
    const hasContent = msg.content !== null && msg.content !== "";
    const startPosition = hasContent ? 1 : 0;
    const totalMessages = hasContent
      ? msg.tool_calls.length + 1
      : msg.tool_calls.length;

    // Add content message if present
    if (hasContent) {
      results.push({
        role: "assistant",
        content: openAIContentToInternal(msg.content),
        _meta: {
          group: {
            id: groupId,
            position: 0,
            total: totalMessages,
          },
          hints: { combine_with_text: true },
          original: {
            provider: "openai",
            wasArray: Array.isArray(msg.content),
          },
        },
      });
    }

    // Convert each tool call
    msg.tool_calls.forEach((toolCall: any, toolIndex: number) => {
      results.push({
        role: "assistant",
        content: [],
        function_call: {
          name: toolCall.function.name,
          arguments: toolCall.function.arguments,
        },
        _meta: {
          group: {
            id: groupId,
            position: startPosition + toolIndex,
            total: totalMessages,
          },
          original: {
            provider: "openai",
            tool_call_id: toolCall.id,
          },
        },
      });
    });
  }
  // Handle assistant messages with function_call (legacy format)
  else if (msg.role === "assistant" && msg.function_call) {
    results.push({
      role: "assistant",
      content: openAIContentToInternal(msg.content),
      function_call: {
        name: msg.function_call.name,
        arguments: msg.function_call.arguments,
      },
      _meta: {
        original: {
          provider: "openai",
          wasArray: Array.isArray(msg.content),
        },
      },
    });
  }
  // Handle tool response messages
  else if (msg.role === "tool") {
    results.push({
      role: "function",
      name: "function", // Generic name, matched by tool_call_id
      content: openAIContentToInternal(msg.content),
      tool_call_id: msg.tool_call_id,
      _meta: {
        original: {
          provider: "openai",
          tool_call_id: msg.tool_call_id,
        },
      },
    });
  }
  // Handle function response messages (legacy)
  else if (msg.role === "function") {
    const funcMsg: InternalMessage = {
      role: "function",
      name: msg.name || "function",
      content: openAIContentToInternal(msg.content),
      _meta: {
        original: { provider: "openai" },
      },
    };

    // Preserve tool_call_id if present
    if (msg.tool_call_id) {
      funcMsg.tool_call_id = msg.tool_call_id;
    }

    results.push(funcMsg);
  }
  // Handle regular messages
  else {
    const internalMsg: InternalMessage = {
      role: msg.role,
      content: openAIContentToInternal(msg.content),
      _meta: {
        original: {
          provider: "openai",
          wasArray: Array.isArray(msg.content),
        },
      },
    };

    // Preserve name if present (for user and system messages)
    if (msg.name) {
      internalMsg.name = msg.name;
    }

    // Preserve unknown fields if requested
    if (options.preserveUnknown) {
      const knownFields = [
        "role",
        "content",
        "name",
        "function_call",
        "tool_calls",
        "tool_call_id",
      ];
      Object.keys(msg).forEach((key) => {
        if (!knownFields.includes(key)) {
          internalMsg._meta!.original![key] = msg[key];
        }
      });
    }

    results.push(internalMsg);
  }

  return results;
}

/**
 * Convert internal messages back to OpenAI format
 */
export function internalMessagesToOpenAI(
  messages: InternalMessage[],
  options: ConverterOptions = {}
): OpenAIMessage[] {
  if (!Array.isArray(messages)) {
    throw new ConversionError("Messages must be an array", "openai");
  }

  const results: OpenAIMessage[] = [];
  const idGenerator = options.generateId || generateUniqueNameId;
  let i = 0;

  while (i < messages.length) {
    const msg = messages[i];

    try {
      // Validate if requested
      if (options.validate !== false && !isInternalMessage(msg)) {
        throw new ValidationError(
          "Invalid internal message format",
          "message",
          msg
        );
      }

      // Check for grouped assistant messages
      if (msg.role === "assistant" && msg._meta?.group) {
        const group: InternalMessage[] = [];
        const groupId = msg._meta.group.id;

        // Collect all messages in this group
        for (let j = i; j < messages.length; j++) {
          if (messages[j]._meta?.group?.id === groupId) {
            group.push(messages[j]);
          } else {
            break;
          }
        }

        // Sort by position to ensure correct order
        group.sort(
          (a, b) =>
            (a._meta?.group?.position || 0) - (b._meta?.group?.position || 0)
        );

        // Separate content messages from tool calls
        const contentMessages = group.filter(
          (m) => m.content.length > 0 && !m.function_call
        );
        const toolCalls = group.filter((m) => m.function_call);

        if (toolCalls.length > 0) {
          // Determine content for the message
          let content: string | null | OpenAIContentPart[] = null;

          if (contentMessages.length > 0) {
            const firstContent = contentMessages[0];
            content = internalContentToOpenAI(
              firstContent.content,
              "assistant",
              firstContent._meta
            );
          }

          // Create message with tool_calls array
          const openAIMsg: OpenAIMessage = {
            role: "assistant",
            content,
            tool_calls: toolCalls.map((m) => ({
              id: m._meta?.original?.tool_call_id || `call_${idGenerator()}`,
              type: "function" as const,
              function: {
                name: m.function_call!.name,
                arguments: m.function_call!.arguments,
              },
            })),
          };

          results.push(openAIMsg);
        } else if (contentMessages.length > 0) {
          // Just content
          const firstContent = contentMessages[0];
          const content = internalContentToOpenAI(
            firstContent.content,
            "assistant",
            firstContent._meta
          );

          results.push({
            role: "assistant",
            content,
          });
        }

        i += group.length;
      }
      // Single message conversion
      else {
        // Handle different roles
        if (msg.role === "function" && msg.tool_call_id) {
          // Function messages with tool_call_id become tool messages
          results.push({
            role: "tool",
            content: contentPartsToText(msg.content),
            tool_call_id: msg.tool_call_id,
          });
        } else if (msg.role === "function") {
          // Legacy function messages
          results.push({
            role: "function",
            content: contentPartsToText(msg.content),
            name: msg.name || "function",
          });
        } else if (msg.role === "assistant" && msg.function_call) {
          // Assistant with function call
          const content = internalContentToOpenAI(
            msg.content,
            "assistant",
            msg._meta
          );

          results.push({
            role: "assistant",
            content,
            tool_calls: [
              {
                id:
                  msg._meta?.original?.tool_call_id || `call_${idGenerator()}`,
                type: "function",
                function: {
                  name: msg.function_call.name,
                  arguments: msg.function_call.arguments,
                },
              },
            ],
          });
        } else {
          // Regular messages
          const content = internalContentToOpenAI(
            msg.content,
            msg.role,
            msg._meta
          );

          const openAIMsg: OpenAIMessage = {
            role: msg.role as any,
            content,
          };

          // Add name if present
          if (msg.name) {
            openAIMsg.name = msg.name;
          }

          results.push(openAIMsg);
        }
        i++;
      }
    } catch (error) {
      if (options.strict !== false) {
        throw error;
      }
      // In non-strict mode, skip invalid messages
      console.warn(`Skipping invalid internal message at index ${i}:`, error);
      i++;
    }
  }

  return results;
}

/**
 * Detect if messages are in OpenAI format
 */
export function isOpenAIFormat(messages: any): boolean {
  // Check for OpenAI-specific indicators
  return (
    messages?.tool_calls !== undefined ||
    messages?.tool_call_id !== undefined ||
    messages?.role === "tool" ||
    (messages?.role === "assistant" && messages?.function_call !== undefined)
  );
}
