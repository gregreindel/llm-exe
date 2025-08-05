import { withDefaultModel } from "@/llm/_utils.withDefaultModel";
import { Config } from "@/types";
import { getEnvironmentVariable } from "@/utils/modules/getEnvironmentVariable";
import { googleGeminiPromptSanitize } from "./promptSanitize";
import { OutputGoogleGeminiChat } from "@/llm/output/google.gemini";

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
      transform: googleGeminiPromptSanitize,
    },
    // topP: {
    //   key: "top_p",
    // }
  },
  transformResponse: OutputGoogleGeminiChat,
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
  "google.gemini-2.5-flash": withDefaultModel(
    googleGeminiChatV1,
    "gemini-2.5-flash"
  ),
  "google.gemini-2.5-flash-lite": withDefaultModel(
    googleGeminiChatV1,
    "gemini-2.5-flash-lite"
  ),
  "google.gemini-1.5-pro": withDefaultModel(
    googleGeminiChatV1,
    "gemini-1.5-pro"
  ),
  "google.gemini-2.5-pro": withDefaultModel(
    googleGeminiChatV1,
    "gemini-2.5-pro"
  ),
};
