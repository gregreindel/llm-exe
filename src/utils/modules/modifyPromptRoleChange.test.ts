import { modifyPromptRoleChange } from "./modifyPromptRoleChange";
import { IChatMessages, IChatMessage } from "@/interfaces";

describe("modifyPromptRoleChange", () => {
  it("should return an empty array if given an empty array of messages", () => {
    const emptyMessages: any[] = [];
    const roleChanges = [{ from: "oldRole", to: "newRole" }];
    const result = modifyPromptRoleChange(emptyMessages, roleChanges);
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it("should return the same array if no roles match any 'from' value in roleChanges", () => {
    const messages: IChatMessages = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
    ];
    const roleChanges = [{ from: "system", to: "bot" }]; // None match
    const result = modifyPromptRoleChange(messages, roleChanges);
    expect(result).toEqual(messages);
  });

  it("should replace the role in all messages that match a single roleChange", () => {
    const messages = [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there" },
      { role: "assistant", content: "How can I help you?" },
    ];
    const roleChanges = [{ from: "assistant", to: "bot" }];
    const result = modifyPromptRoleChange(messages as IChatMessages, roleChanges);
    expect(result).toEqual([
      { role: "user", content: "Hello" },
      { role: "bot", content: "Hi there" },
      { role: "bot", content: "How can I help you?" },
    ]);
  });

  it("should apply multiple role changes for an array of messages", () => {
    const messages = [
      { role: "assistant", content: "I'm an assistant" },
      { role: "user", content: "Hello" },
      { role: "system", content: "System message" },
    ];
    const roleChanges = [
      { from: "assistant", to: "bot" },
      { from: "system", to: "machine" },
    ];
    const result = modifyPromptRoleChange(messages as IChatMessages, roleChanges);
    expect(result).toEqual([
      { role: "bot", content: "I'm an assistant" },
      { role: "user", content: "Hello" },
      { role: "machine", content: "System message" },
    ]);
  });

  it("should leave roles unchanged if no match in multiple roleChanges", () => {
    const messages = [
      { role: "assistant", content: "I'm an assistant" },
      { role: "user", content: "Hello" },
    ];
    const roleChanges = [
      { from: "system", to: "machine" },
      { from: "manager", to: "director" },
    ];
    const result = modifyPromptRoleChange(messages as IChatMessages, roleChanges);
    expect(result).toEqual(messages);
  });

  it("should handle a single message object and change the role if matched", () => {
    const message = { role: "assistant", content: "Hello" };
    const roleChanges = [{ from: "assistant", to: "bot" }];
    const result = modifyPromptRoleChange(message as IChatMessage, roleChanges);
    expect(result).toEqual({ role: "bot", content: "Hello" });
  });

  it("should handle a single message object and not change the role if no match", () => {
    const message = { role: "assistant", content: "Hello" };
    const roleChanges = [{ from: "system", to: "bot" }];
    const result = modifyPromptRoleChange(message as IChatMessage, roleChanges);
    expect(result).toEqual(message);
  });

  it("should handle multiple 'from' entries in roleChanges for a single message (last one that applies is still just one match)", () => {
    const message = { role: "assistant", content: "Hello" };
    const roleChanges = [
      { from: "assistant", to: "bot" },
      { from: "assistant", to: "somethingElse" },
    ];
    // The function is simple: it looks up the 'role' in the Map.
    // The last definition in the array wins if 'assistant' is overwritten.
    // However, because we use 'new Map(...)', the final entry for a key overwrites earlier ones.
    // So "assistant" => "somethingElse" will be in the map, not "assistant" => "bot".
    const result = modifyPromptRoleChange(message as IChatMessage, roleChanges);
    expect(result).toEqual({ role: "somethingElse", content: "Hello" });
  });

  it("should handle multiple 'from' entries in roleChanges for an array of messages", () => {
    const messages = [
      { role: "assistant", content: "I'm an assistant" },
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Another assistant message" },
    ];
    const roleChanges = [
      { from: "assistant", to: "newAssistant" },
      { from: "assistant", to: "latestAssistant" },
      { from: "user", to: "client" },
    ];
    // The last valid mapping for 'assistant' is "latestAssistant"
    const result = modifyPromptRoleChange(messages as IChatMessages, roleChanges);
    expect(result).toEqual([
      { role: "latestAssistant", content: "I'm an assistant" },
      { role: "client", content: "Hello" },
      { role: "latestAssistant", content: "Another assistant message" },
    ]);
  });
});