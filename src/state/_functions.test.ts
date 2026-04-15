import { BaseState, DefaultState, createState, createStateItem } from "@/state";
import { createStateFrom, createDialogue } from "@/state/_functions";
import { Dialogue, DefaultStateItem } from "@/state";

/**
 * Tests the state factory functions
 */
describe("llm-exe:state/createState", () => {
  it("creates a DefaultState instance", () => {
    const state = createState();
    expect(state).toBeInstanceOf(DefaultState);
    expect(state).toBeInstanceOf(BaseState);
  });

  it("returns independent instances on each call", () => {
    const a = createState();
    const b = createState();
    a.setAttribute("foo", "a-value");
    expect(b.attributes).not.toHaveProperty("foo");
  });

  // Regression: documents behavior for gregreindel/llm-exe#393.
  // The function signature takes no params; any argument is silently ignored.
  // If this ever changes (e.g., accepts a name), this test will fail loudly.
  it("silently ignores any arguments passed at runtime (issue #393)", () => {
    const state = (createState as any)("myState", { some: "config" });
    expect(state).toBeInstanceOf(DefaultState);
    // Arg is not stored anywhere — nothing attaches "myState" to the state.
    expect(state.attributes).toEqual({});
    expect(state.dialogues).toEqual({});
    expect(state.context).toEqual({});
  });
});

describe("llm-exe:state/createDialogue", () => {
  it("creates a Dialogue with the given name", () => {
    const dialogue = createDialogue("conversation");
    expect(dialogue).toBeInstanceOf(Dialogue);
    expect(dialogue.name).toEqual("conversation");
    expect(dialogue.getHistory()).toEqual([]);
  });
});

describe("llm-exe:state/createStateItem", () => {
  it("creates a DefaultStateItem with key and default value", () => {
    const item = createStateItem("user", { name: "Greg" });
    expect(item).toBeInstanceOf(DefaultStateItem);
    expect(item.getKey()).toEqual("user");
    expect(item.getValue()).toEqual({ name: "Greg" });
  });

  // Regression: documents behavior for gregreindel/llm-exe#394.
  // When no default is provided, the first setValue fails because the
  // internal `typeof value === typeof this.value` check compares against
  // `typeof undefined`. This test pins the current (confusing) error so
  // that if the behavior is fixed, we remember to update docs/this test.
  it("produces 'Expected undefined' error when setValue is called without default (issue #394)", () => {
    const item = (createStateItem as any)("orphan");
    expect(item.getValue()).toBeUndefined();
    expect(() => item.setValue("hello")).toThrowError(
      "Invalid value type. Expected undefined, received string"
    );
  });

  it("allows setValue to undefined when default is undefined", () => {
    const item = (createStateItem as any)("orphan");
    // typeof undefined === typeof undefined, so this branch is permitted.
    expect(() => item.setValue(undefined)).not.toThrow();
    expect(item.getValue()).toBeUndefined();
  });
});

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

  it("creates empty state if empty object provided", async () => {
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
});
