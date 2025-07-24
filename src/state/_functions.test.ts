import { BaseState, DefaultState, createState } from "@/state";
import { createStateFrom, createDialogue, createStateItem } from "@/state/_functions";

/**
 * Tests the TextPrompt class
 */
describe("llm-exe:state/createStateFrom", () => {
  it("creates empty state if nothing provided", () => {
    const state = createStateFrom();
    expect(state).toBeInstanceOf(DefaultState);
    expect(state).toBeInstanceOf(BaseState);
  });

  it("creates empty state if empty object provided", async () => {
    const state = createStateFrom({});
    expect(state).toBeInstanceOf(DefaultState);
    expect(state).toBeInstanceOf(BaseState);
  });

  it("creates state from serialized data", async () => {
    const state = createState();

    state.setAttribute("something", "someValue")

    const chat = state.createDialogue("chat");
    chat.setUserMessage("Hello");
    chat.setAssistantMessage("Hello There!!");

    const saved = state.serialize();
    const newState = createStateFrom(saved);
    expect(newState).toHaveProperty("dialogues");
    expect(newState.dialogues).toHaveProperty("chat");

    expect(newState).toHaveProperty("attributes");
    expect(newState.attributes).toHaveProperty("something");
    expect(newState.attributes.something).toEqual("someValue");
  });

  it("creates state from direct dialogue values (without .value wrapper)", () => {
    const savedState = {
      dialogues: {
        chat: [
          { role: "user", content: "Hello" },
          { role: "assistant", content: "Hi there!" }
        ]
      },
      attributes: {
        key1: "value1"
      }
    };

    const newState = createStateFrom(savedState);
    expect(newState.dialogues).toHaveProperty("chat");
    const history = newState.dialogues.chat.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toMatchObject({ role: "user", content: "Hello" });
    expect(history[1]).toMatchObject({ role: "assistant", content: "Hi there!" });
    expect(newState.attributes.key1).toBe("value1");
  });

  it("skips dialogues with falsy values", () => {
    const savedState = {
      dialogues: {
        empty1: null,
        empty2: undefined,
        empty3: [],
        valid: [{ role: "user", content: "Test" }]
      }
    };

    const newState = createStateFrom(savedState);
    // Valid and empty3 (empty array is truthy) should be created
    expect(Object.keys(newState.dialogues)).toHaveLength(2);
    expect(newState.dialogues).toHaveProperty("valid");
    expect(newState.dialogues).toHaveProperty("empty3");
    expect(newState.dialogues).not.toHaveProperty("empty1");
    expect(newState.dialogues).not.toHaveProperty("empty2");
    
    // empty3 should have an empty history
    expect(newState.dialogues.empty3.getHistory()).toEqual([]);
  });
});

describe("llm-exe:state/createDialogue", () => {
  it("creates a dialogue instance", () => {
    const dialogue = createDialogue("test");
    expect(dialogue.name).toBe("test");
    expect(dialogue.getHistory()).toEqual([]);
  });
});

describe("llm-exe:state/createStateItem", () => {
  it("creates a state item with default value", () => {
    const item = createStateItem("testItem", "defaultValue");
    expect(item.getValue()).toBe("defaultValue");
  });

  it("creates a state item with complex default value", () => {
    const defaultObj = { key: "value", num: 42 };
    const item = createStateItem("complexItem", defaultObj);
    expect(item.getValue()).toEqual(defaultObj);
  });
});
