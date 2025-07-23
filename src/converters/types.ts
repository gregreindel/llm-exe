/**
 * Message Conversion System Types
 *
 * These types define the internal message format and metadata structure
 * used for bidirectional conversion between provider formats.
 */

import { InternalMessage } from "@/types";

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
