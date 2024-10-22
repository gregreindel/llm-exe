import { removeEmptyFromObject } from "./removeEmptyFromObject";

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