import { objectToList } from "@/utils/modules/handlebars/helpers";

describe('objectToList', () => {
  it("should return an empty string when the argument is an empty object", () => {
    const result = objectToList.call({}, {});
    expect(result).toBe("");
  });

  it("should convert a single-property object to a list format", () => {
    const result = objectToList.call({}, { key: "value" });
    expect(result).toBe("- key: value");
  });

  it("should convert a multi-property object to a list format", () => {
    const result = objectToList.call({}, { key1: "value1", key2: "value2" });
    expect(result).toBe("- key1: value1\n- key2: value2");
  });

  it("should handle object with special characters in keys and values", () => {
    const result = objectToList.call({}, { "key!": "value@", "$key#": "value%" });
    expect(result).toBe("- key!: value@\n- $key#: value%");
  });

  it("should return an empty string when called without arguments", () => {
    const result = objectToList.call({}, );
    expect(result).toBe("");
  });



  it("should prioritize argument object over context object", () => {
    const context = { key1: "contextValue1", key2: "contextValue2" };
    const boundFunction = objectToList.bind(context);
    const result = boundFunction({ key1: "argValue1", key3: "argValue3" });
    expect(result).toBe("- key1: argValue1\n- key3: argValue3");
  });
  });