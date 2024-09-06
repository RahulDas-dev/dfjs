import { test, describe, assert } from 'vitest'
import { isRecordOfArray, perseRecoredsOfArray } from '../src/utility';

describe('Testing isRecordOfArray', () => {
    test('should return true for an object with all values as arrays of the same length', () => {
        const input = {
            a: [1, 2, 3],
            b: ['a', 'b', 'c'],
            c: [true, false, true]
        };
        assert.equal(isRecordOfArray(input), true);
    });

    test('should return false for an object with some values not as arrays', () => {
        const input = {
            a: [1, 2, 3],
            b: 'not an array',
            c: [true, false, true]
        };
        assert.equal(isRecordOfArray(input), false);
    });

    test('should throw an error for an object with arrays of different lengths', () => {
        const input = {
            a: [1, 2, 3],
            b: ['a', 'b'],
            c: [true, false, true]
        };
        assert.throws(() => isRecordOfArray(input), /Length Error: Length of Rows must be the same!/);
    });

    test('should return true for an empty object', () => {
        const input = {};
        assert.equal(isRecordOfArray(input), false);
    });

    test('should return false for a non-object input', () => {
        const input = 'not an object';
        assert.equal(isRecordOfArray(input), false);
    });

    test('should return true for an object with mixed types of arrays of the same length', () => {
        const input = {
            a: [1, 2, 3],
            b: ['a', 'b', 'c'],
            c: [true, false, true],
            d: [new Date(), new Date(), new Date()]
        };
        assert.equal(isRecordOfArray(input), true);
    });

    test('should return true for an object with nested arrays of the same length', () => {
        const input = {
            a: [[1, 2], [3, 4], [5, 6]],
            b: [['a', 'b'], ['c', 'd'], ['e', 'f']],
            c: [[true, false], [false, true], [true, true]]
        };
        assert.equal(isRecordOfArray(input), false);
    });

    test('should throw an error for an object with some empty arrays', () => {
        const input = {
            a: [1, 2, 3],
            b: [],
            c: [true, false, true]
        };
        assert.throws(() => isRecordOfArray(input), /Length Error: Length of Rows must be the same!/);
    });

    test('should return false for an object with some null values', () => {
        const input = {
            a: [1, 2, 3],
            b: null,
            c: [true, false, true]
        };
        assert.equal(isRecordOfArray(input), false);
    });

    test('should return false for an object with some undefined values', () => {
        const input = {
            a: [1, 2, 3],
            b: undefined,
            c: [true, false, true]
        };
        assert.equal(isRecordOfArray(input), false);
    });
});

describe('perseRecoredsOfArray', () => {
    test('should retrieve row array and column names from an object', () => {
        const input = { a: [1, 2, 3, 4], b: [30, 20, 30, 20] };
        const [rowsArr, colNames] = perseRecoredsOfArray(input);
        assert.deepEqual(colNames, ['a', 'b']);
        assert.deepEqual(rowsArr, [
            [1, 30],
            [2, 20],
            [3, 30],
            [4, 20]
        ]);
    });

    test('should handle an object with one key', () => {
        const input = { a: [1, 2, 3, 4] };
        const [rowsArr, colNames] = perseRecoredsOfArray(input);
        assert.deepEqual(colNames, ['a']);
        assert.deepEqual(rowsArr, [
            [1],
            [2],
            [3],
            [4]
        ]);
    });

    test('should handle an object with empty arrays', () => {
        const input = { a: [], b: [] };
        const [rowsArr, colNames] = perseRecoredsOfArray(input);
        assert.deepEqual(colNames, ['a', 'b']);
        assert.deepEqual(rowsArr, [[], []]);
    });
});