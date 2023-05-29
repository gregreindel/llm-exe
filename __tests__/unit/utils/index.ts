import { generateUniqueNameId, removeEmptyFromObject } from "@/utils";

describe('generateUniqueNameId', () => {
    it('should generate a unique ID with no prefix and no suffix', () => {
      const id1 = generateUniqueNameId();
      const id2 = generateUniqueNameId();
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toEqual(id2);
    });
  
    it('should generate a unique ID with a prefix only', () => {
      const prefix = 'prefix-';
      const id1 = generateUniqueNameId(prefix);
      const id2 = generateUniqueNameId(prefix);
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toEqual(id2);
      expect(id1.startsWith(prefix)).toBe(true);
      expect(id2.startsWith(prefix)).toBe(true);
    });
  
    it('should generate a unique ID with a suffix only', () => {
      const suffix = '-suffix';
      const id1 = generateUniqueNameId('', suffix);
      const id2 = generateUniqueNameId('', suffix);
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toEqual(id2);
      expect(id1.endsWith(suffix)).toBe(true);
      expect(id2.endsWith(suffix)).toBe(true);
    });
  
    it('should generate a unique ID with both prefix and suffix', () => {
      const prefix = 'prefix-';
      const suffix = '-suffix';
      const id1 = generateUniqueNameId(prefix, suffix);
      const id2 = generateUniqueNameId(prefix, suffix);
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toEqual(id2);
      expect(id1.startsWith(prefix)).toBe(true);
      expect(id2.startsWith(prefix)).toBe(true);
      expect(id1.endsWith(suffix)).toBe(true);
      expect(id2.endsWith(suffix)).toBe(true);
    });
  
    it('should generate unique IDs for multiple calls', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateUniqueNameId());
      }
      expect(ids.size).toEqual(100);
    });
  });

  describe("removeEmptyFromObject", () => {
    test("should return the same object if no empty values are found", () => {
      const obj = { name: "John", age: 30, city: "New York" };
      expect(removeEmptyFromObject(obj)).toEqual(obj);
    });
  
    test("should remove empty values from the object", () => {
      const obj = { name: "John", age: null, city: "", address: "" };
      expect(removeEmptyFromObject(obj)).toEqual({ name: "John", city: "", address: "" });
    });
  
    test("should remove empty values from nested objects", () => {
      const obj = { name: "John", age: null, city: "", address: { street: "", zip: "12345" } };
      expect(removeEmptyFromObject(obj)).toEqual({ name: "John", city: "", address: { street: "",zip: "12345" } });
    });
  
    test("should remove empty values from mixed data types", () => {
      const obj = { name: "John", age: null, city: "", address: { street: "", zip: "12345" }, hobbies: [], job: undefined };
      expect(removeEmptyFromObject(obj)).toEqual({ name: "John", city: "", address: { street: "", zip: "12345" }, hobbies: []});
    });
  
    test("should throw an error for invalid input", () => {
      expect(() => {
        removeEmptyFromObject("invalidInput" as any);
      }).toThrow("invalid object");
    });
  });




