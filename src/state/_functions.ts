import { DefaultState } from ".";
import { Dialogue } from "./dialogue";
import { DefaultStateItem } from "./item";

export function createState() {
  return new DefaultState();
}
export function createDialogue(name: string) {
  return new Dialogue(name);
}

export function createStateItem<T>(name: string, defaultValue: T) {
  return new DefaultStateItem(name, defaultValue);
}
