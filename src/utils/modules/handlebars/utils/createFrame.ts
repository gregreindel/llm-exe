import { extend } from "@/utils/modules/extend";

export function createFrame(object: Record<string, any>) {
  const frame = extend({}, object);
  frame._parent = object;
  return frame;
}
