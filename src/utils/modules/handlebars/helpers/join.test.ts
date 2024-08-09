import {  join } from "@/utils/modules/handlebars/helpers";



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
