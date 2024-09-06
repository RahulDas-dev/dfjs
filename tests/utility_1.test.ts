import { test, describe, assert } from 'vitest'
import { isOneDArray, isTwoDArray, transposeArray } from '../src/utility';


describe('Testing isArrayOfRecord', function () {
    test('Testing isOneDArray With Array of Numbers', function () {
        const input = [1, 2, 3];
        assert.equal(isOneDArray(input), true);
    });
    test('Testing isOneDArray With Array of Strings', function () {
        const input = ['a', 'b', 'c'];
        assert.equal(isOneDArray(input), true);
    });
    test('Testing isOneDArray With Array of Booleans', function () {
        const input = [true, false, true];
        assert.equal(isOneDArray(input), true);
    });
    test('Testing isOneDArray With Array of Dates', function () {
        const input = [new Date(), new Date(), new Date()];
        assert.equal(isOneDArray(input), true);
    });
    test('Testing isOneDArray With Mixed Types', function () {
        const input = [1, 'a', true];
        assert.equal(isOneDArray(input), true);
    });
    test('Testing isOneDArray With Empty Array', function () {
        const input: unknown[] = [];
        assert.equal(isOneDArray(input), true);
    });
    test('Testing isOneDArray With Non-Array Input', function () {
        const input = 'not an array';
        assert.equal(isOneDArray(input), false);
    });
    test('Testing isOneDArray With Array of Objects', function () {
        const input = [{}, {}, {}];
        assert.equal(isOneDArray(input), false);
    });
    test('Testing isOneDArray With Array of Arrays', function () {
        const input = [[1, 2], [3, 4], [5, 6]];
        assert.equal(isOneDArray(input), false);
    });
});

describe('Testing isTwoDArray', () => {
    test('should return true for a two-dimensional array of numbers with same length rows', () => {
        const input = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        assert.equal(isTwoDArray(input), true);
    });

    test('should return true for a two-dimensional array of strings with same length rows', () => {
        const input = [['a', 'b', 'c'], ['d', 'e', 'f']];
        assert.equal(isTwoDArray(input), true);
    });

    test('should return true for a two-dimensional array of booleans with same length rows', () => {
        const input = [[true, false], [false, true]];
        assert.equal(isTwoDArray(input), true);
    });

    test('should return true for a two-dimensional array of dates with same length rows', () => {
        const input = [[new Date(), new Date()], [new Date(), new Date()]];
        assert.equal(isTwoDArray(input), true);
    });

    test('should return false for a two-dimensional array with mixed types', () => {
        const input = [[1, 'a'], [true, new Date()]];
        assert.equal(isTwoDArray(input), true);
    });

    test('should return false for a one-dimensional array', () => {
        const input = [1, 2, 3];
        assert.equal(isTwoDArray(input), false);
    });

    test('should return false for an empty array', () => {
        const input: unknown[] = [];
        assert.equal(isTwoDArray(input), false);
    });

    test('should return false for a non-array input', () => {
        const input = 'not an array';
        assert.equal(isTwoDArray(input), false);
    });

    test('should return false for an array of objects', () => {
        const input = [{}, {}, {}];
        assert.equal(isTwoDArray(input), false);
    });

    test('should return false for a three-dimensional array', () => {
        const input = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
        assert.equal(isTwoDArray(input), false);
    });

    test('should throw an error for a two-dimensional array with different length rows', () => {
        const input = [[1, 2], [3, 4, 5], [6]];
        assert.throws(() => isTwoDArray(input), /Length Error: Length of columns must be the same!/);
    });

    test('should return true for a two-dimensional array with empty rows', () => {
        const input = [[], [], []];
        assert.equal(isTwoDArray(input), true);
    });

    test('should throw an error for a two-dimensional array with some empty rows and some non-empty rows', () => {
        const input = [[], [1, 2], []];
        assert.throws(() => isTwoDArray(input), /Length Error: Length of columns must be the same!/);
    });
});

describe('transposeArray', () => {
    test('should transpose a 2x3 array', () => {
        const input = [
            [1, 2, 3],
            [4, 5, 6]
        ];
        const expectedOutput = [
            [1, 4],
            [2, 5],
            [3, 6]
        ];
        assert.deepEqual(transposeArray(input), expectedOutput);
    });

    test('should transpose a 3x2 array', () => {
        const input = [
            [1, 2],
            [3, 4],
            [5, 6]
        ];
        const expectedOutput = [
            [1, 3, 5],
            [2, 4, 6]
        ];
        assert.deepEqual(transposeArray(input), expectedOutput);
    });

    test('should transpose a 1x3 array', () => {
        const input = [
            [1, 2, 3]
        ];
        const expectedOutput = [
            [1],
            [2],
            [3]
        ];
        assert.deepEqual(transposeArray(input), expectedOutput);
    });

    test('should transpose a 3x1 array', () => {
        const input = [
            [1],
            [2],
            [3]
        ];
        const expectedOutput = [
            [1, 2, 3]
        ];
        assert.deepEqual(transposeArray(input), expectedOutput);
    });

    test('should handle an array with empty subarrays', () => {
        const input = [
            [],
            [],
            []
        ];
        const expectedOutput = [
            [],
            [],
            []
        ];
        assert.deepEqual(transposeArray(input), expectedOutput);
    });
});