import { BaseState, DefaultState, createState } from "@/state";
import { createStateFrom } from "@/state/_functions";

describe("llm-exe:state/createState", () => {
  it("creates a DefaultState with no arguments", () => {
    const state = createState();
    expect(state).toBeInstanceOf(DefaultState);
    expect(state).toBeInstanceOf(BaseState);
  });

  it("throws if arguments are passed", () => {
    expect(() => (createState as any)("myState")).toThrowError(
      "createState() does not accept arguments."
    );
  });

  it("throws if multiple arguments are passed", () => {
    expect(() => (createState as any)("a", "b")).toThrowError(
      "createState() does not accept arguments."
    );
  });
});

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
