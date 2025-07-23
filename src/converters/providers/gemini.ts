/**
 * Gemini Message Converter
 *
 * Handles conversion between Google Gemini's message format and the internal format.
 * Supports parts arrays with text, functionCall, and functionResponse.
 */

import { ConversionError, ValidationError, ConverterOptions } from "../types";
import {
  GeminiPart,
  GeminiTextPart,
  GeminiInlineDataPart,
  GeminiFileDataPart,
  GeminiFunctionCallPart,
  GeminiFunctionResponsePart,
} from "../../interfaces/gemini";
import { isInternalMessage, maybeParseJSON, maybeStringifyJSON } from "@/utils";
import {
  ContentPart,
  InternalMessage,
  MultimediaContentPart,
  TextContentPart,
} from "@/types";
import { generateUniqueNameId } from "@/utils/modules/generateUniqueNameId";

/**
 * Gemini message format
 */
export interface GeminiMessage {
  role: "user" | "model" | "function";
  parts: GeminiPart[];
  // Gemini doesn't use content field, only parts
}

/**
 * Type guards for Gemini parts
 */
function isTextPart(part: any): part is GeminiTextPart {
  return part && "text" in part && typeof part.text === "string";
}

function isInlineDataPart(part: any): part is GeminiInlineDataPart {
  return (
    part &&
    "inlineData" in part &&
    part.inlineData &&
    typeof part.inlineData.mimeType === "string" &&
    typeof part.inlineData.data === "string"
  );
}

function isFileDataPart(part: any): part is GeminiFileDataPart {
  return (
    part &&
    "fileData" in part &&
    part.fileData &&
    typeof part.fileData.mimeType === "string" &&
    typeof part.fileData.fileUri === "string"
  );
}

function isFunctionCallPart(part: any): part is GeminiFunctionCallPart {
  return (
    part &&
    "functionCall" in part &&
    part.functionCall &&
    typeof part.functionCall.name === "string" &&
    part.functionCall.args !== undefined
  );
}

function isFunctionResponsePart(part: any): part is GeminiFunctionResponsePart {
  return (
    part &&
    "functionResponse" in part &&
    part.functionResponse &&
    typeof part.functionResponse.name === "string" &&
    part.functionResponse.response !== undefined
  );
}

/**
 * Validate Gemini message format
 */
function validateGeminiMessage(msg: any, _options?: ConverterOptions): void {
  if (!msg || typeof msg !== "object") {
    throw new ValidationError("Message must be an object", "message", msg);
  }

  const validRoles = ["user", "model", "function"];
  if (!validRoles.includes(msg.role)) {
    throw new ValidationError(
      `Invalid role: ${msg.role}. Must be one of: ${validRoles.join(", ")}`,
      "role",
      msg.role
    );
  }

  // Validate parts array
  if (!Array.isArray(msg.parts)) {
    throw new ValidationError("Parts must be an array", "parts", msg.parts);
  }

  // Validate each part
  msg.parts.forEach((part: any, index: number) => {
    if (!part || typeof part !== "object") {
      throw new ValidationError(
        `Invalid part at index ${index}: must be an object`,
        `parts[${index}]`,
        part
      );
    }

    const isValid =
      isTextPart(part) ||
      isInlineDataPart(part) ||
      isFileDataPart(part) ||
      isFunctionCallPart(part) ||
      isFunctionResponsePart(part);

    if (!isValid) {
      throw new ValidationError(
        `Invalid part type at index ${index}`,
        `parts[${index}]`,
        part
      );
    }

    // Additional validation for function calls
    if (isFunctionCallPart(part)) {
      try {
        // Ensure args can be serialized
        JSON.stringify(part.functionCall.args);
      } catch (error) {
        throw new ValidationError(
          `Invalid function args at index ${index}: not serializable`,
          `parts[${index}].functionCall.args`,
          part.functionCall.args
        );
      }
    }

    // Additional validation for function responses
    if (isFunctionResponsePart(part)) {
      try {
        // Ensure response can be serialized
        JSON.stringify(part.functionResponse.response);
      } catch (error) {
        throw new ValidationError(
          `Invalid function response at index ${index}: not serializable`,
          `parts[${index}].functionResponse.response`,
          part.functionResponse.response
        );
      }
    }
  });

  // Role-specific validations
  if (msg.role === "model") {
    const hasFunctionResponse = msg.parts.some((p: any) =>
      isFunctionResponsePart(p)
    );
    if (hasFunctionResponse) {
      throw new ValidationError(
        "Model messages cannot contain functionResponse",
        "parts",
        msg.parts
      );
    }
  }

  if (msg.role === "user") {
    const hasFunctionCall = msg.parts.some((p: any) => isFunctionCallPart(p));
    if (hasFunctionCall) {
      throw new ValidationError(
        "User messages cannot contain functionCall",
        "parts",
        msg.parts
      );
    }
  }
}

/**
 * Convert a single Gemini message to internal format
 */
export function geminiMessageToInternal(
  msg: any,
  options: ConverterOptions = {}
): InternalMessage[] {
  const results: InternalMessage[] = [];
  const idGenerator = options.generateId || generateUniqueNameId;

  // Validate if requested
  if (options.validate !== false) {
    validateGeminiMessage(msg, options);
  }

  // Convert role
  const internalRole = msg.role === "model" ? "assistant" : msg.role;

  // Handle empty parts array
  if (msg.parts.length === 0) {
    results.push({
      role: internalRole,
      content: [],
      _meta: {
        original: {
          provider: "gemini",
          hadEmptyParts: true,
        },
      },
    });
    return results;
  }

  // Process parts - need to handle mixed content properly
  const groupId = `group_${idGenerator()}`;
  let position = 0;

  // First, collect all non-function parts into content
  const contentParts: ContentPart[] = [];
  const functionParts: GeminiPart[] = [];

  msg.parts.forEach((part: GeminiPart) => {
    if (isTextPart(part)) {
      contentParts.push({
        type: "text",
        text: part.text,
      });
    } else if (isInlineDataPart(part)) {
      contentParts.push({
        type: "image",
        mediaType: part.inlineData.mimeType,
        source: {
          type: "base64",
          data: part.inlineData.data,
        },
      } as MultimediaContentPart);
    } else if (isFileDataPart(part)) {
      contentParts.push({
        type: "image",
        mediaType: part.fileData.mimeType,
        source: {
          type: "url",
          url: part.fileData.fileUri,
        },
      } as MultimediaContentPart);
    } else if (isFunctionCallPart(part) || isFunctionResponsePart(part)) {
      functionParts.push(part);
    }
  });

  // If we have content parts, create a content message
  if (contentParts.length > 0) {
    results.push({
      role: internalRole,
      content: contentParts,
      _meta: {
        group:
          functionParts.length > 0
            ? {
                id: groupId,
                position: position++,
                total:
                  contentParts.length > 0 && functionParts.length > 0 ? 2 : 1,
              }
            : undefined,
        original: {
          provider: "gemini",
          hasMultipleParts: true,
        },
      },
    });
  }

  // Process function parts
  functionParts.forEach((part) => {
    if (isFunctionCallPart(part)) {
      results.push({
        role: "assistant",
        content: [],
        function_call: {
          name: part.functionCall.name,
          arguments: maybeStringifyJSON(part.functionCall.args),
        },
        _meta: {
          group:
            contentParts.length > 0 || functionParts.length > 1
              ? {
                  id: groupId,
                  position: position++,
                  total:
                    (contentParts.length > 0 ? 1 : 0) + functionParts.length,
                }
              : undefined,
          original: {
            provider: "gemini",
            partType: "functionCall",
          },
        },
      });
    } else if (isFunctionResponsePart(part)) {
      // Function responses are separate messages
      results.push({
        role: "function",
        name: part.functionResponse.name,
        content: [
          {
            type: "text",
            text: maybeStringifyJSON(part.functionResponse.response),
          },
        ],
        _meta: {
          original: {
            provider: "gemini",
            partType: "functionResponse",
          },
        },
      });
    }
  });

  return results;
}

/**
 * Convert internal messages back to Gemini format
 */
export function internalMessagesToGemini(
  messages: InternalMessage[],
  options: ConverterOptions = {}
): GeminiMessage[] {
  if (!Array.isArray(messages)) {
    throw new ConversionError("Messages must be an array", "gemini");
  }

  const results: GeminiMessage[] = [];
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

      // Handle grouped assistant messages
      if (msg.role === "assistant" && msg._meta?.group) {
        const group: InternalMessage[] = [];
        const groupId = msg._meta.group.id;

        // Collect all messages in group
        for (let j = i; j < messages.length; j++) {
          if (messages[j]._meta?.group?.id === groupId) {
            group.push(messages[j]);
          } else {
            break;
          }
        }

        // Sort by original part index if available, otherwise by position
        group.sort((a, b) => {
          const aIndex =
            a._meta?.original?.partIndex ?? a._meta?.group?.position ?? 0;
          const bIndex =
            b._meta?.original?.partIndex ?? b._meta?.group?.position ?? 0;
          return aIndex - bIndex;
        });

        // Build parts array preserving order
        const parts: GeminiPart[] = [];

        group.forEach((m) => {
          if (m.function_call) {
            // Function call
            parts.push({
              functionCall: {
                name: m.function_call.name,
                args: maybeParseJSON(m.function_call.arguments),
              },
            });
          } else if (m.content.length > 0) {
            // Convert content parts to Gemini parts
            m.content.forEach((contentPart) => {
              if (contentPart.type === "text") {
                parts.push({ text: contentPart.text });
              } else if (contentPart.type === "image") {
                if (contentPart.source.type === "base64") {
                  parts.push({
                    inlineData: {
                      mimeType: contentPart.mediaType,
                      data: contentPart.source.data!,
                    },
                  });
                } else if (contentPart.source.type === "url") {
                  parts.push({
                    fileData: {
                      mimeType: contentPart.mediaType,
                      fileUri: contentPart.source.url!,
                    },
                  });
                }
              }
              // Other content types not supported by Gemini, skip
            });
          }
        });

        results.push({
          role: "model",
          parts,
        });
        i += group.length;
      }
      // Handle function messages by grouping consecutive ones
      else if (msg.role === "function") {
        const functionResponses: GeminiFunctionResponsePart[] = [];

        while (i < messages.length && messages[i].role === "function") {
          const funcMsg = messages[i];
          // Extract text content from ContentPart array
          const textContent = funcMsg.content
            .filter((part): part is TextContentPart => part.type === "text")
            .map((part) => part.text)
            .join("");
          const responseValue = maybeParseJSON(textContent || "{}");

          functionResponses.push({
            functionResponse: {
              name: funcMsg.name || "unknown",
              response: { result: responseValue },
            },
          });
          i++;
        }

        // Function responses go in user messages in Gemini
        results.push({
          role: "user",
          parts: functionResponses,
        });
      }
      // Handle simple assistant messages
      else if (msg.role === "assistant") {
        // Check if this was originally empty parts
        if (msg._meta?.original?.hadEmptyParts) {
          results.push({
            role: "model",
            parts: [],
          });
        } else if (msg.function_call) {
          // Single function call without grouping
          results.push({
            role: "model",
            parts: [
              {
                functionCall: {
                  name: msg.function_call.name,
                  args: maybeParseJSON(msg.function_call.arguments),
                },
              },
            ],
          });
        } else {
          // Convert content parts to Gemini parts
          const parts: GeminiPart[] = [];
          msg.content.forEach((contentPart) => {
            if (contentPart.type === "text") {
              parts.push({ text: contentPart.text });
            } else if (contentPart.type === "image") {
              if (contentPart.source.type === "base64") {
                parts.push({
                  inlineData: {
                    mimeType: contentPart.mediaType,
                    data: contentPart.source.data!,
                  },
                });
              } else if (contentPart.source.type === "url") {
                parts.push({
                  fileData: {
                    mimeType: contentPart.mediaType,
                    fileUri: contentPart.source.url!,
                  },
                });
              }
            }
            // Other content types not supported by Gemini, skip
          });

          if (parts.length > 0) {
            results.push({
              role: "model",
              parts,
            });
          }
        }
        i++;
      }
      // Handle user messages
      else if (msg.role === "user") {
        if (msg._meta?.original?.hadEmptyParts) {
          results.push({
            role: "user",
            parts: [],
          });
        } else {
          // Convert content parts to Gemini parts
          const parts: GeminiPart[] = [];
          msg.content.forEach((contentPart) => {
            if (contentPart.type === "text") {
              parts.push({ text: contentPart.text });
            } else if (contentPart.type === "image") {
              if (contentPart.source.type === "base64") {
                parts.push({
                  inlineData: {
                    mimeType: contentPart.mediaType,
                    data: contentPart.source.data!,
                  },
                });
              } else if (contentPart.source.type === "url") {
                parts.push({
                  fileData: {
                    mimeType: contentPart.mediaType,
                    fileUri: contentPart.source.url!,
                  },
                });
              }
            }
            // Other content types not supported by Gemini, skip
          });

          if (parts.length > 0) {
            results.push({
              role: "user",
              parts,
            });
          }
        }
        i++;
      }
      // Handle system messages (convert to user with prefix)
      else if (msg.role === "system") {
        const textContent = msg.content
          .filter((part): part is TextContentPart => part.type === "text")
          .map((part) => part.text)
          .join(" ");
        results.push({
          role: "user",
          parts: [{ text: `[System] ${textContent}` }],
        });
        i++;
      } else {
        // Unknown role - skip in strict mode, convert to user in non-strict
        if (options.strict !== false) {
          throw new ValidationError(
            `Cannot convert role '${msg.role}' to Gemini format`,
            "role",
            msg.role
          );
        }
        const textContent = msg.content
          .filter((part): part is TextContentPart => part.type === "text")
          .map((part) => part.text)
          .join(" ");
        results.push({
          role: "user",
          parts: [{ text: textContent }],
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
 * Detect if messages are in Gemini format
 */
export function isGeminiFormat(message: any): boolean {
  // Check for Gemini-specific indicators
  return (
    message?.role === "model" ||
    "text" in message ||
    "functionCall" in message ||
    "functionResponse" in message
  );
}
