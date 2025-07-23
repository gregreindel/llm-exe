// Google Gemini-specific types

export type GeminiModelName = 
  | "gemini-pro"
  | "gemini-1.5-pro"
  | "gemini-1.5-flash"
  | "gemini-1.5-flash-8b"
  | `gemini-${string}`;

// Gemini Function Calling Types
export interface GeminiFunctionCall {
  name: string;
  args: any;
}

export interface GeminiFunctionResponse {
  name: string;
  response: {
    result: any;
  };
}

export interface GeminiTextPart {
  text: string;
}

export interface GeminiInlineDataPart {
  inlineData: {
    mimeType: string;
    data: string; // Base64 encoded
  };
}

export interface GeminiFileDataPart {
  fileData: {
    mimeType: string;
    fileUri: string;
  };
}

export interface GeminiFunctionCallPart {
  functionCall: GeminiFunctionCall;
}

export interface GeminiFunctionResponsePart {
  functionResponse: GeminiFunctionResponse;
}

export type GeminiPart = 
  | GeminiTextPart
  | GeminiInlineDataPart
  | GeminiFileDataPart
  | GeminiFunctionCallPart
  | GeminiFunctionResponsePart;

export interface GeminiModelMessage {
  role: 'model';
  parts: GeminiPart[];
}

export interface GeminiUserMessage {
  role: 'user';
  parts: GeminiPart[];
}

export type GeminiMessage = 
  | GeminiModelMessage
  | GeminiUserMessage;