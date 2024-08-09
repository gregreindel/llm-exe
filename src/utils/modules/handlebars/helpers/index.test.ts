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
