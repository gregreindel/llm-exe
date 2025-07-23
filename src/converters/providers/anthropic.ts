/**
 * Anthropic Message Converter
 *
 * Handles conversion between Anthropic's message format and the internal format.
 * Supports content arrays with mixed text and tool use.
 */

import {
  InternalMessage,
  ConversionError,
  ValidationError,
  ConverterOptions,
  generateId,
  safeJsonParse,
  safeJsonStringify,
  TextContentPart,
  ContentPart,
} from "../types";

/**
 * Anthropic content types
 */
export interface AnthropicTextContent {
  type: "text";
  text: string;
}

export interface AnthropicToolUseContent {
  type: "tool_use";
  id: string;
  name: string;
  input: any;
}

export interface AnthropicToolResultContent {
  type: "tool_result";
  tool_use_id: string;
  content: string;
}

export interface AnthropicImageContent {
  type: "image";
  source: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

export type AnthropicContent =
  | AnthropicTextContent
  | AnthropicToolUseContent
  | AnthropicToolResultContent
  | AnthropicImageContent;

/**
 * Anthropic message format
 */
export interface AnthropicMessage {
  role: "user" | "assistant" | "system";
  content: string | AnthropicContent[];
}

/**
 * Type guards for Anthropic content
 */
function isTextContent(content: any): content is AnthropicTextContent {
  return content?.type === "text" && typeof content.text === "string";
}

function isToolUseContent(content: any): content is AnthropicToolUseContent {
  return (
    content?.type === "tool_use" &&
    typeof content.id === "string" &&
    typeof content.name === "string" &&
    content.input !== undefined
  );
}

function isToolResultContent(
  content: any
): content is AnthropicToolResultContent {
  return (
    content?.type === "tool_result" &&
    typeof content.tool_use_id === "string" &&
    typeof content.content === "string"
  );
}

function isImageContent(content: any): content is AnthropicImageContent {
  return (
    content?.type === "image" &&
    content?.source?.type === "base64" &&
    typeof content.source.media_type === "string" &&
    typeof content.source.data === "string"
  );
}

/**
 * Validate Anthropic message format
 */
function validateAnthropicMessage(msg: any, _options?: ConverterOptions): void {
  if (!msg || typeof msg !== "object") {
    throw new ValidationError("Message must be an object", "message", msg);
  }

  const validRoles = ["user", "assistant", "system"];
  if (!validRoles.includes(msg.role)) {
    throw new ValidationError(
      `Invalid role: ${msg.role}. Must be one of: ${validRoles.join(", ")}`,
      "role",
      msg.role
    );
  }

  // Validate content
  if (typeof msg.content === "string") {
    // String content is valid
  } else if (Array.isArray(msg.content)) {
    // Validate each content item
    msg.content.forEach((item: any, index: number) => {
      if (!item || typeof item !== "object" || !item.type) {
        throw new ValidationError(
          `Invalid content item at index ${index}: missing type`,
          `content[${index}]`,
          item
        );
      }

      if (
        !isTextContent(item) &&
        !isToolUseContent(item) &&
        !isToolResultContent(item) &&
        !isImageContent(item)
      ) {
        throw new ValidationError(
          `Invalid content type at index ${index}: ${item.type}`,
          `content[${index}].type`,
          item.type
        );
      }

      // Additional validation for tool_use
      if (isToolUseContent(item)) {
        try {
          // Ensure input can be serialized
          JSON.stringify(item.input);
        } catch (error) {
          throw new ValidationError(
            `Invalid tool input at index ${index}: not serializable`,
            `content[${index}].input`,
            item.input
          );
        }
      }
    });
  } else {
    throw new ValidationError(
      "Content must be string or array",
      "content",
      msg.content
    );
  }

  // Role-specific validations
  if (msg.role === "user" && Array.isArray(msg.content)) {
    const hasToolUse = msg.content.some((c: any) => c.type === "tool_use");
    if (hasToolUse) {
      throw new ValidationError(
        "User messages cannot contain tool_use",
        "content",
        msg.content
      );
    }
  }
}

/**
 * Convert a single Anthropic message to internal format
 */
export function anthropicMessageToInternal(
  msg: any,
  options: ConverterOptions = {}
): InternalMessage[] {
  const results: InternalMessage[] = [];
  const idGenerator = options.generateId || generateId;

  // Validate if requested
  if (options.validate !== false) {
    validateAnthropicMessage(msg, options);
  }

  // Handle content array format
  if (Array.isArray(msg.content)) {
    const groupId = `group_${idGenerator()}`;
    const contentParts: ContentPart[] = [];

    // Convert each Anthropic content item to internal ContentPart
    msg.content.forEach((contentItem: any, contentIndex: number) => {
      if (isTextContent(contentItem)) {
        contentParts.push({
          type: "text",
          text: contentItem.text,
        });
      } else if (isImageContent(contentItem)) {
        contentParts.push({
          type: "image",
          mediaType: contentItem.source.media_type,
          source: {
            type: "base64",
            data: contentItem.source.data,
          },
        });
      } else if (isToolUseContent(contentItem)) {
        // Tool use content is converted to function_call, not content part
        results.push({
          role: "assistant",
          content: [],
          function_call: {
            name: contentItem.name,
            arguments: safeJsonStringify(contentItem.input),
          },
          _meta: {
            group: {
              id: groupId,
              position: results.length,
              total: msg.content.length,
            },
            original: {
              provider: "anthropic",
              tool_call_id: contentItem.id,
              contentIndex,
              contentType: "tool_use",
            },
          },
        });
      } else if (isToolResultContent(contentItem)) {
        // Tool result is a separate message
        results.push({
          role: "function",
          name: "function",
          content: [{ type: "text", text: contentItem.content }],
          tool_call_id: contentItem.tool_use_id,
          _meta: {
            original: {
              provider: "anthropic",
              tool_call_id: contentItem.tool_use_id,
              contentType: "tool_result",
            },
          },
        });
      }
    });

    // If we have content parts (text/images), create a message
    if (contentParts.length > 0) {
      results.push({
        role: msg.role,
        content: contentParts,
        _meta: {
          group:
            results.length > 0
              ? {
                  id: groupId,
                  position: results.length,
                  total: msg.content.length,
                }
              : undefined,
          original: {
            provider: "anthropic",
            wasArray: true,
          },
        },
      });
    }

    // If the content array was empty and no messages were created, add an empty message
    if (msg.content.length === 0 && results.length === 0) {
      results.push({
        role: msg.role,
        content: [],
        _meta: {
          original: {
            provider: "anthropic",
            wasArray: true,
            hadEmptyParts: true,
          },
        },
      });
    }
  }
  // Handle string content
  else if (typeof msg.content === "string") {
    const internalMsg: InternalMessage = {
      role: msg.role,
      content: [{ type: "text", text: msg.content }],
      _meta: {
        original: { provider: "anthropic" },
      },
    };

    // Preserve unknown fields if requested
    if (options.preserveUnknown) {
      const knownFields = ["role", "content"];
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
 * Convert content parts to text string
 */
function contentPartsToText(content: ContentPart[]): string {
  return content
    .filter((part): part is TextContentPart => part.type === "text")
    .map((part) => part.text)
    .join("\n");
}

/**
 * Convert content parts to Anthropic content
 */
function contentPartsToAnthropic(content: ContentPart[]): AnthropicContent[] {
  return content.map((part) => {
    if (part.type === "text") {
      return {
        type: "text",
        text: part.text,
      };
    } else if (part.type === "image") {
      return {
        type: "image",
        source: {
          type: "base64",
          media_type: part.mediaType,
          data: part.source.data || "",
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
 * Convert internal messages back to Anthropic format
 */
export function internalMessagesToAnthropic(
  messages: InternalMessage[],
  options: ConverterOptions = {}
): AnthropicMessage[] {
  if (!Array.isArray(messages)) {
    throw new ConversionError("Messages must be an array", "anthropic");
  }

  const results: AnthropicMessage[] = [];
  const idGenerator = options.generateId || generateId;
  let i = 0;

  while (i < messages.length) {
    const msg = messages[i];

    try {
      // Special handling for grouped messages
      if (msg._meta?.group) {
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

        // Reconstruct the original content array
        const content: AnthropicContent[] = [];

        group.forEach((m) => {
          if (m.function_call) {
            content.push({
              type: "tool_use",
              id: m._meta?.original?.tool_call_id || `tool_${idGenerator()}`,
              name: m.function_call.name,
              input: safeJsonParse(m.function_call.arguments, {}),
            });
          } else {
            content.push(...contentPartsToAnthropic(m.content));
          }
        });

        results.push({
          role: group[0].role as any,
          content,
        });

        i += group.length;
      }
      // Special handling for consecutive function messages
      else if (msg.role === "function") {
        const toolResults: AnthropicToolResultContent[] = [];

        // Collect consecutive function messages
        while (i < messages.length && messages[i].role === "function") {
          const funcMsg = messages[i];
          toolResults.push({
            type: "tool_result",
            tool_use_id:
              funcMsg.tool_call_id ||
              funcMsg._meta?.original?.tool_call_id ||
              `tool_${idGenerator()}`,
            content: contentPartsToText(funcMsg.content),
          });
          i++;
        }

        results.push({
          role: "user",
          content: toolResults,
        });
      }
      // Single message conversion
      else {
        // Convert content
        const content =
          msg._meta?.original?.wasArray ||
          msg.content.some((p) => p.type !== "text")
            ? contentPartsToAnthropic(msg.content)
            : contentPartsToText(msg.content);

        results.push({
          role: msg.role as any,
          content,
        });
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
 * Detect if messages are in Anthropic format
 */
export function isAnthropicFormat(message: any): boolean {
  // Check for Anthropic-specific indicators
  return (
    message?.type === "text" ||
    message?.type === "tool_use" ||
    message?.type === "tool_result"
  );
}
