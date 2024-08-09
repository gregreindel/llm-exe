import { chunkArray } from "@/utils";

describe('chunkArray', () => {
  it('should return chunked array with the given size', () => {
    const inputArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const chunkSize = 3;
    const expectedArray = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

    expect(chunkArray(inputArray, chunkSize)).toEqual(expectedArray);
  });

  it('should return chunked array with remaining elements in the last chunk if array length is not a multiple of chunk size', () => {
    const inputArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const chunkSize = 4;
    const expectedArray = [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]];

    expect(chunkArray(inputArray, chunkSize)).toEqual(expectedArray);
  });

  it('should return an emptyarray if the input array is empty', () => {
    const inputArray: any[] = [];
    const chunkSize = 3;
    const expectedArray: any[] = [];

    expect(chunkArray(inputArray, chunkSize)).toEqual(expectedArray);
  });
});