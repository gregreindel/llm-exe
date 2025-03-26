import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config, IChatMessages, IChatMessage } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { modifyPromptRoleChange } from "@/utils/modules/modifyPromptRoleChange";

function googleGeminiPromptMessageCallback(_message: IChatMessage) {
  let message = { ..._message };

  message = modifyPromptRoleChange(_message, [
    { from: "assistant", to: "model" },
    { from: "system", to: "model" },
  ]);

  // do gemini-specific transformations
  const { role, ...payload } = message;
  const parts = [];
  if (typeof payload.content === "string") {
    parts.push({ text: message.content });
  }

  return {
    role,
    parts,
  };
}

export function googleGeminiPromptSanitize(
  _messages: string | IChatMessages,
  _inputBodyObj: Record<string, any>,
  _outputObj: Record<string, any>
) {
  if (typeof _messages === "string") {
    return _messages;
  }
  if (Array.isArray(_messages)) {
    if (_messages.length === 0) {
      // throw?
    }
    if (_messages.length === 1) {
      return _messages[0].content;
    }
  }

  /**
   * system messages can go into `systemInstruction`
   *   - remains same shape as text input ({text})
   */

  return _messages.map(googleGeminiPromptMessageCallback);
}

const googleGeminiChatV1: Config = {
  key: "google.chat.v1",
  provider: "google.chat",
  endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{{model}}:generateContent?key={{geminiApiKey}}`,
  options: {
    prompt: {},
    // topP: {},
    geminiApiKey: {
      default: getEnvironmentVariable("GEMINI_API_KEY"),
    },
  },
  method: "POST",
  headers: `{"Content-Type": "application/json" }`,
  mapBody: {
    prompt: {
      key: "contents",
      sanitize: googleGeminiPromptSanitize,
    },
    // topP: {
    //   key: "top_p",
    // }
  },
};

export const google = {
  "google.chat.v1": googleGeminiChatV1,
  "google.gemini-2.0-flash": withDefaultModel(
    googleGeminiChatV1,
    "gemini-2.0-flash"
  ),
  "google.gemini-2.0-flash-lite": withDefaultModel(
    googleGeminiChatV1,
    "gemini-2.0-flash-lite"
  ),
  "google.gemini-1.5-pro": withDefaultModel(
    googleGeminiChatV1,
    "gemini-1.5-pro"
  ),
};
