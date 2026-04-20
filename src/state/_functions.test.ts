import { BaseState, DefaultState, createState } from "@/state";
import { createStateFrom, createDialogue, createStateItem } from "@/state/_functions";
import { Dialogue } from "@/state/dialogue";
import { DefaultStateItem } from "@/state/item";

/**
 * Tests the state factory functions
 */
describe("llm-exe:state/_functions", () => {
  describe("createState", () => {
    it("returns a DefaultState instance", () => {
      const state = createState();
      expect(state).toBeInstanceOf(DefaultState);
      expect(state).toBeInstanceOf(BaseState);
    });
  });

  describe("createDialogue", () => {
    it("returns a Dialogue instance with the given name", () => {
      const dialogue = createDialogue("chat");
      expect(dialogue).toBeInstanceOf(Dialogue);
      expect(dialogue.getKey()).toEqual("chat");
    });

    it("returns an empty dialogue", () => {
      const dialogue = createDialogue("test-convo");
      expect(dialogue.getHistory()).toEqual([]);
    });
  });

  describe("createStateItem", () => {
    it("returns a DefaultStateItem with correct key and value", () => {
      const item = createStateItem("count", 0);
      expect(item).toBeInstanceOf(DefaultStateItem);
      expect(item.getKey()).toEqual("count");
      expect(item.getValue()).toEqual(0);
    });

    it("works with string default value", () => {
      const item = createStateItem("status", "idle");
      expect(item.getKey()).toEqual("status");
      expect(item.getValue()).toEqual("idle");
    });

    it("works with boolean default value", () => {
      const item = createStateItem("active", false);
      expect(item.getValue()).toEqual(false);
    });

    it("works with object default value", () => {
      const item = createStateItem("config", { retries: 3 });
      expect(item.getValue()).toEqual({ retries: 3 });
    });
  });

  describe("createStateFrom", () => {
    it("creates empty state if nothing provided", () => {
      const state = createStateFrom();
      expect(state).toBeInstanceOf(DefaultState);
      expect(state).toBeInstanceOf(BaseState);
    });

    it("creates empty state if empty object provided", () => {
      const state = createStateFrom({});
      expect(state).toBeInstanceOf(DefaultState);
      expect(state).toBeInstanceOf(BaseState);
    });

    it("restores full serialized state (dialogues + attributes)", () => {
      const state = createState();
      state.setAttribute("something", "someValue");

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

    it("restores state with only dialogues (no attributes)", () => {
      const state = createState();
      const chat = state.createDialogue("support");
      chat.setUserMessage("Help me");

      const saved = state.serialize();
      delete saved.attributes;

      const newState = createStateFrom(saved);
      expect(newState.dialogues).toHaveProperty("support");
    });

    it("restores state with only attributes (no dialogues)", () => {
      const state = createState();
      state.setAttribute("lang", "en");

      const saved = state.serialize();
      delete saved.dialogues;

      const newState = createStateFrom(saved);
      expect(newState.attributes).toHaveProperty("lang");
      expect(newState.attributes.lang).toEqual("en");
    });

    it("restores multiple dialogues", () => {
      const state = createState();
      const chat1 = state.createDialogue("chat1");
      chat1.setUserMessage("Hi from chat1");
      const chat2 = state.createDialogue("chat2");
      chat2.setUserMessage("Hi from chat2");

      const saved = state.serialize();
      const newState = createStateFrom(saved);
      expect(newState.dialogues).toHaveProperty("chat1");
      expect(newState.dialogues).toHaveProperty("chat2");
    });

    it("restores multiple attributes", () => {
      const state = createState();
      state.setAttribute("a", 1);
      state.setAttribute("b", "two");
      state.setAttribute("c", true);

      const saved = state.serialize();
      const newState = createStateFrom(saved);
      expect(newState.attributes.a).toEqual(1);
      expect(newState.attributes.b).toEqual("two");
      expect(newState.attributes.c).toEqual(true);
    });
  });
});
