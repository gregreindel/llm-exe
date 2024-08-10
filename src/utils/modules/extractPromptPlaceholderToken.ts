import { get, unEscape } from ".";

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
          assistant: get(matchAssistant, "[2]", ""),
          user: get(matchUser, "[2]", ""),
        };
      }
    } else if (token.substring(2, 20) === ">SingleChatMessage") {
      const matchRole = tok.match(/role=(['"`])((?:(?!\1).)*)\1/);
      const matchContent = tok.match(/content=(['"`])((?:(?!\1).)*)\1/);
      const matchName = tok.match(/name=(['"`])((?:(?!\1).)*)\1/);
      if (matchRole) {
        return {
          token: ">SingleChatMessage",
          name: get(matchName, "[2]"),
          content: unEscape(get(matchContent, "[2]", "")),
          role: get(matchRole, "[2]", ""),
        };
      }
    }
    return { token: "" };
  }
  