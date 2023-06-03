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
  it("extracts DialogueHistory correctly with unuaual spacing", async () => {
    const valid = `{{>DialogueHistory key='thisIsTheKey' }}`
    const value = extractPromptPlaceholderToken(valid)
    expect(value.token).toEqual(">DialogueHistory");
    expect(value.key).toEqual("thisIsTheKey");
  });
});
