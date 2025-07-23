/**
 * Message Conversion System Types
 *
 * These types define the internal message format and metadata structure
 * used for bidirectional conversion between provider formats.
 */

/**
 * Content types supported by internal messages
 */
export type ContentPartType = "text" | "image" | "audio" | "video" | "document";

/**
 * Base content part interface
 */
export interface BaseContentPart {
  /** Type of content */
  type: ContentPartType;
}

/**
 * Text content part
 */
export interface TextContentPart extends BaseContentPart {
  type: "text";
  /** Text content */
  text: string;
}

/**
 * Multimedia content part
 */
export interface MultimediaContentPart extends BaseContentPart {
  type: "image" | "audio" | "video" | "document";
  /** MIME type of the content (e.g., 'image/png', 'audio/mp3') */
  mediaType: string;
  /** Source of the content */
  source: {
    /** Type of source */
    type: "url" | "base64";
    /** URL if source type is 'url' */
    url?: string;
    /** Base64 encoded data if source type is 'base64' */
    data?: string;
  };
  /** Optional metadata about the content */
  metadata?: {
    /** File name if available */
    fileName?: string;
    /** File size in bytes */
    fileSize?: number;
    /** Image dimensions */
    dimensions?: {
      width: number;
      height: number;
    };
    /** Duration in seconds for audio/video */
    duration?: number;
    /** Any additional metadata */
    [key: string]: any;
  };
}

/**
 * Union type for all content parts
 */
export type ContentPart = TextContentPart | MultimediaContentPart;

/**
 * Metadata for tracking message origins and grouping
 */
export interface MessageMetadata {
  /**
   * Grouping information for messages that were split from a single provider message
   */
  group?: {
    /** Unique identifier for this group of messages */
    id: string;
    /** Position of this message within the group (0-indexed) */
    position: number;
    /** Total number of messages in this group */
    total: number;
  };

  /**
   * Original provider-specific information
   */
  original?: {
    /** Which provider this message came from */
    provider: "openai" | "anthropic" | "gemini";
    /** Tool/function call ID from the provider */
    tool_call_id?: string;
    /** Original message ID if available */
    message_id?: string;
    /** Index in content array (for Anthropic/Gemini) */
    contentIndex?: number;
    /** Type of content in original message */
    contentType?:
      | "text"
      | "tool_use"
      | "tool_result"
      | "functionCall"
      | "functionResponse";
    /** Index in parts array (for Gemini) */
    partIndex?: number;
    /** Type of part in original message */
    partType?: "text" | "functionCall" | "functionResponse";
    /** Whether the original content was an array (for preservation) */
    wasArray?: boolean;
    /** Whether the original had empty parts/content */
    hadEmptyParts?: boolean;
    /** Any other provider-specific data */
    [key: string]: any;
  };

  /**
   * Hints for conversion behavior
   */
  hints?: {
    /** Whether this message should be combined with text when converting back */
    combine_with_text?: boolean;
    /** Whether to preserve null content as-is */
    preserve_null_content?: boolean;
  };

  /**
   * Format version for future compatibility
   */
  version?: number;
}

/**
 * Content type for internal messages
 * Can be either a string (for text-only messages) or an array of content parts
 */

/**
 * Internal message format used by llm-exe
 * This is the canonical format that all provider messages are converted to/from
 */
export interface InternalMessage {
  /** Message role (user, assistant, system, function, tool) */
  role: string;
  /** Message content - array of content parts (text or multimedia) */
  content: ContentPart[];
  /** Function call information (legacy format, still used internally) */
  function_call?: {
    name: string;
    arguments: string;
  };
  /** Function name (for function role messages) */
  name?: string;
  /** Tool call ID (for matching responses to calls) */
  tool_call_id?: string;
  /** Metadata for tracking origins and conversion hints */
  _meta?: MessageMetadata;
}

/**
 * Converter function signatures
 */
export type ToInternalConverter<T = any> = (messages: T[]) => InternalMessage[];
export type FromInternalConverter<T = any> = (
  messages: InternalMessage[]
) => T[];

/**
 * Error types for conversion failures
 */
export class ConversionError extends Error {
  constructor(
    message: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = "ConversionError";
  }
}

/**
 * Validation error for invalid message formats
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public value: any
  ) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Provider detection result
 */
export interface ProviderDetectionResult {
  provider: "openai" | "anthropic" | "gemini" | "unknown";
  confidence: number;
  reason: string;
}

/**
 * Converter options
 */
export interface ConverterOptions {
  /** Whether to validate messages before conversion */
  validate?: boolean;
  /** Whether to throw on validation errors or skip invalid messages */
  strict?: boolean;
  /** Whether to preserve unknown fields in metadata */
  preserveUnknown?: boolean;
  /** Custom ID generator for groups and tool calls */
  generateId?: () => string;
}

/**
 * Default ID generator
 */
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Type guard for InternalMessage
 */
export function isInternalMessage(msg: any): msg is InternalMessage {
  return (
    msg &&
    typeof msg === "object" &&
    typeof msg.role === "string" &&
    Array.isArray(msg.content) &&
    msg.content.every((part: any) => 
      part && typeof part === "object" && typeof part.type === "string"
    ) &&
    (!msg.function_call ||
      (typeof msg.function_call === "object" &&
        typeof msg.function_call.name === "string" &&
        typeof msg.function_call.arguments === "string"))
  );
}

/**
 * Helper to safely parse JSON with fallback
 */
export function safeJsonParse<T = any>(str: string, fallback?: T): T {
  try {
    return JSON.parse(str);
  } catch (error) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new ConversionError(
      `Failed to parse JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
      "json",
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Helper to safely stringify JSON
 */
export function safeJsonStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    throw new ConversionError(
      `Failed to stringify JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
      "json",
      error instanceof Error ? error : undefined
    );
  }
}
