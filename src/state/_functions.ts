import { assert } from "@/utils/modules/assert";
import { DefaultState } from "./index";
import { Dialogue } from "./dialogue";
import { DefaultStateItem } from "./item";

export function createState() {
  assert(arguments.length === 0, "createState() does not accept arguments.");
  return new DefaultState();
}
export function createDialogue(name: string) {
  return new Dialogue(name);
}

export function createStateItem<T>(name: string, defaultValue: T) {
  return new DefaultStateItem(name, defaultValue);
}

export function createStateFrom(savedState?: any) {
  const state = createState();
  const dialogues = savedState?.dialogues || {};
  // const context = savedState?.context;
  const attributes = savedState?.attributes || {};

  for (const dialogue of Object.keys(dialogues)) {
    const value = dialogues[dialogue].value;
    state.createDialogue(dialogue).setHistory(value);
  }

  for (const attribute of Object.keys(attributes)) {
    state.setAttribute(attribute, attributes[attribute]);
  }
  return state;
}
