import { helpJsonMarkup } from "@/utils/modules/json";

describe('helpJsonMarkup', () => {
  test('should parse json in md format', () => {
    const obj = {hello: 'world'}
    const json = "```json\n"+JSON.stringify(obj)+"\n```";
    const result = helpJsonMarkup(json);
    expect(result).toEqual(JSON.stringify(obj));
  });
  test('should leave string alone if not md format', () => {
    const obj = {hello: 'world'}
    const json = "json\n"+JSON.stringify(obj)+"\n";
    const result = helpJsonMarkup(json);
    expect(result).toEqual(json);
  });

  test('should leave string alone if not string', () => {
    const notStrings: any[] = [{hello: 'world'}, undefined, null, [], 5]
    for (const option of notStrings) {
      const result = helpJsonMarkup(option as any);
      expect(result).toEqual(option);
    }
  });
});
