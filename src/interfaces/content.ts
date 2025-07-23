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
