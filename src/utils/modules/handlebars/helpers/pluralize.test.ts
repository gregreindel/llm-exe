import {  pluralize } from "@/utils/modules/handlebars/helpers";

describe('pluralize helper function', () => {
    test('should return singular word when count is 1', () => {
      const singularAndPlural = 'apple|apples';
      const count = 1;
      const expectedOutput = 'apple';
  
      const result = pluralize.call(null, singularAndPlural, count);
      expect(result).toBe(expectedOutput);
    });
  
    test('should return plural word when count is greater than 1', () => {
      const singularAndPlural = 'book|books';
      const count = 5;
      const expectedOutput = 'books';
  
      const result = pluralize.call(null, singularAndPlural, count);
      expect(result).toBe(expectedOutput);
    });
  
    test('should return plural word when count is 0', () => {
      const singularAndPlural = 'car|cars';
      const count = 0;
      const expectedOutput = 'car';
  
      const result = pluralize.call(null, singularAndPlural, count);
      expect(result).toBe(expectedOutput);
    });
});