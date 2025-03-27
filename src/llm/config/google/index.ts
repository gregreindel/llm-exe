import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { googleGeminiPromptSanitize } from "./promptSanitize";

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
