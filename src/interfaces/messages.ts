import { ContentPart } from "./content";

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
