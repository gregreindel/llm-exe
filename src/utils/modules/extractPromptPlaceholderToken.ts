import { unescape } from "./unescape";
import { get } from "./get";

export function extractPromptPlaceholderToken(tok: string) {
  if (!tok) return { token: "" };
  const token = tok.replace(/ /g, "");
  if (token.substring(2, 18) === ">DialogueHistory") {
    const matchKey = tok.match(/key=(['"`])((?:(?!\1).)*)\1/);
    const matchAssistant = tok.match(/assistant=(['"`])((?:(?!\1).)*)\1/);
    const matchUser = tok.match(/user=(['"`])((?:(?!\1).)*)\1/);
    if (matchKey) {
      return {
        token: ">DialogueHistory",
        key: matchKey[2],
        assistant: matchAssistant ? get(matchAssistant, "[2]", "") : undefined,
        user: matchUser ? get(matchUser, "[2]", "") : matchUser,
      };
    }
  } else if (token.substring(2, 20) === ">SingleChatMessage") {
    const matchRole = tok.match(/role=(['"`])((?:(?!\1).)*)\1/);
    const matchContent = tok.match(/content=(['"`])((?:(?!\1).)*)\1/);
    const matchName = tok.match(/name=(['"`])((?:(?!\1).)*)\1/);
    if (matchRole) {
      return {
        token: ">SingleChatMessage",
        name: matchName ? get(matchName, "[2]") : undefined,
        content: matchContent ? unescape(get(matchContent, "[2]", "")) : undefined,
        role: get(matchRole, "[2]", ""),
      };
    }
  }
  return { token: "" };
}
