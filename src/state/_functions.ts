import { DefaultState } from "./index";
import { Dialogue } from "./dialogue";
import { DefaultStateItem } from "./item";
import { get } from "@/utils/modules/get";

export function createState() {
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
    const dialogueData = get(dialogues, dialogue);
    // Handle both serialized format (with .value) and direct value
    const value = dialogueData?.value || dialogueData;
    if (value) {
      state.createDialogue(dialogue).setHistory(value);
    }
  }

  for (const attribute of Object.keys(attributes)) {
    state.setAttribute(attribute, attributes[attribute]);
  }
  return state;
}
