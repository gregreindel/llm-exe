import { OutputResultContent } from "@/interfaces";
import { getResultText } from "@/llm/output/_utils/getResultText";
import { mockOutputResultObject } from "../../../../utils/mock.helpers";

describe("getResultText", () => {
  it("should return text when there is only one item and its type is 'text'", () => {
    const content: OutputResultContent[] = [
      { type: "text", text: "hello world" },
    ];

    expect(getResultText(mockOutputResultObject(content))).toBe("hello world");
  });

  it("should return first string when there is more than one item", () => {
    const content: OutputResultContent[] = [
      { type: "text", text: "hello" },
      { type: "text", text: "world" },
    ];

    expect(getResultText(mockOutputResultObject(content))).toBe("hello");
  });

  it("should return an empty string when the item type is not 'text'", () => {
    const content: OutputResultContent[] = [
      { type: "image" as any, text: "hello world" },
    ];

    expect(getResultText(mockOutputResultObject(content))).toBe("");
  });

  it("should return an empty string when content is empty", () => {
    const content: OutputResultContent[] = [];

    expect(getResultText(mockOutputResultObject(content))).toBe("");
  });

  it("should return an empty string when the single item has no text", () => {
    const content: OutputResultContent[] = [{ type: "text", text: "" }];

    expect(getResultText(mockOutputResultObject(content))).toBe("");
  });
});
