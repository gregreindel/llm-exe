import { BaseState, DefaultState, createState } from "@/state";
import { createStateFrom } from "@/state/_functions";

describe("llm-exe:state/createState", () => {
  it("creates state with no name when called with no args", () => {
    const state = createState();
    expect(state).toBeInstanceOf(DefaultState);
    expect(state).toBeInstanceOf(BaseState);
    expect(state.name).toBeUndefined();
  });

  it("accepts an optional name argument and assigns it to the state", () => {
    const state = createState("myState");
    expect(state).toBeInstanceOf(DefaultState);
    expect(state.name).toEqual("myState");
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
