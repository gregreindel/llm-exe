import { extractPromptPlaceholderToken } from "@/utils";

describe("extractPromptPlaceholderToken", () => {
  it("returns empty string if input not provided", async () => {
    let none: any;
    const value = extractPromptPlaceholderToken(none)
    expect(value).toEqual({"token": ""});
  });
  it("returns empty string if token does not match", async () => {
    const invalid = `{{IDontKnow}}`
    const value = extractPromptPlaceholderToken(invalid)
    expect(value).toEqual({"token": ""});
  });
  it("returns empty string if no key", async () => {
    const invalidMissingKeyUsesName = `{{> DialogueHistory name='thisIsTheKey'}}`
    const value = extractPromptPlaceholderToken(invalidMissingKeyUsesName)
    expect(value).toEqual({"token": ""});
  });
  it("extracts DialogueHistory correctly", async () => {
    const valid = `{{> DialogueHistory key='thisIsTheKey'}}`
    const value = extractPromptPlaceholderToken(valid)
    expect(value.token).toEqual(">DialogueHistory");
    expect(value.key).toEqual("thisIsTheKey");
  });
  it("extracts DialogueHistory correctly with unusual spacing", async () => {
    const valid = `{{>DialogueHistory key='thisIsTheKey' }}`
    const value = extractPromptPlaceholderToken(valid)
    expect(value.token).toEqual(">DialogueHistory");
    expect(value.key).toEqual("thisIsTheKey");
  });

  it("extracts SingleChatMessage correctly", async () => {
    const valid = `{{> SingleChatMessage role='assistant' content='This is the content'}}`
    const value = extractPromptPlaceholderToken(valid)
    expect(value.token).toEqual(">SingleChatMessage");
    expect(value.role).toEqual("assistant");
    expect(value.content).toEqual("This is the content");
  });
  it("extracts SingleChatMessage with double quotes correctly", async () => {
    const valid = `{{> SingleChatMessage role='assistant' content='This is the content. it has "double quotes" in it.'}}`
    const value = extractPromptPlaceholderToken(valid)
    expect(value.token).toEqual(">SingleChatMessage");
    expect(value.role).toEqual("assistant");
    expect(value.content).toEqual(`This is the content. it has "double quotes" in it.`);
  });

  it("extracts SingleChatMessage for user with name correctly", async () => {
    const valid = `{{> SingleChatMessage role='user' content='This is the content' name='Greg'}}`
    const value = extractPromptPlaceholderToken(valid)
    expect(value.token).toEqual(">SingleChatMessage");
    expect(value.role).toEqual("user");
    expect(value.content).toEqual("This is the content");
    expect(value.name).toEqual("Greg");
  });
  it("extracts SingleChatMessage for user with name correctly", async () => {
    const valid = `{{> SingleChatMessage role='user' content='This is the content'}}`
    const value = extractPromptPlaceholderToken(valid)
    expect(value.token).toEqual(">SingleChatMessage");
    expect(value.role).toEqual("user");
    expect(value.content).toEqual("This is the content");
    expect(typeof value.name).toEqual("undefined");
  });
});
