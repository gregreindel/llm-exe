import { objectToList, join } from "@/utils/modules/handlebars/helpers";


describe('objectToList', () => {
  it('objectToList', () => {
    expect(objectToList.call({}, {first: "First Item", second: "Second Item"})).toEqual(`- first: First Item\n- second: Second Item`)
  });
});

describe('join', () => {
  it('join', () => {
    expect(join.call({}, ["first", "second"])).toEqual(`first, second`)
  });
  it('join on a number', () => {
    expect(join.call({}, 99 as any)).toEqual(``)
  });
  it('join already a string', () => {
    expect(join.call({}, "first" as any)).toEqual(`first`)
  });
});

// export function objectToList(
//   this: Record<string, string>,
//   arg: Record<string, string> = {}
// ) {
//   return Object.keys(arg)
//     .map((key) => `- ${key}: ${arg[key]}`)
//     .join("\n");
// }

// export function join(array: string[]) {
//   if (typeof array === "string") return array;
//   if (!Array.isArray(array)) return "";
//   return array.join(", ");
// }