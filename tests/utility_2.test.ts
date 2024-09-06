import { test, describe, assert } from 'vitest'
import { isArrayOfRecord, perseArrayOfRecord } from '../src/utility';
import { TArrayOfRecord } from '../src/types/base';

describe('Testing isArrayOfRecord', () => {
    test('should return false for an empty array', () => {
        const input = [];
        assert.equal(isArrayOfRecord(input), false);
    });

    test('should return false for a non-array input', () => {
        const input = 'not an array';
        assert.equal(isArrayOfRecord(input), false);
    });

    test('should return false for an array of strings', () => {
        const input = ['a', 'b', 'c'];
        assert.equal(isArrayOfRecord(input), false);
    });

    test('should return false for an array of dates', () => {
        const input = [new Date(), new Date(), new Date()];
        assert.equal(isArrayOfRecord(input), false);
    });

    test('should return true for an array of objects', () => {
        const input = [{}, {}, {}];
        assert.equal(isArrayOfRecord(input), true);
    });

    test('should return true for an array of objects with properties', () => {
        const input = [{ a: 1 }, { b: 2 }, { c: 3 }];
        assert.equal(isArrayOfRecord(input), true);
    });

    test('should return false for an array with mixed types', () => {
        const input = [{}, 1, 'a'];
        assert.equal(isArrayOfRecord(input), false);
    });

    test('should return false for an array of arrays', () => {
        const input = [[1, 2], [3, 4], [5, 6]];
        assert.equal(isArrayOfRecord(input), false);
    });

    test('should return false for an array of null values', () => {
        const input = [null, null, null];
        assert.equal(isArrayOfRecord(input), false);
    });

    test('should return false for an array of undefined values', () => {
        const input = [undefined, undefined, undefined];
        assert.equal(isArrayOfRecord(input), false);
    });

    test('should return false for an array of mixed objects and non-objects', () => {
        const input = [{}, 1, {}];
        assert.equal(isArrayOfRecord(input), false);
    });

    test('should return true for an array of objects with nested objects', () => {
        const input = [{ a: {} }, { b: {} }, { c: {} }];
        assert.equal(isArrayOfRecord(input), false);
    });

    test('should return false for an array of objects with some non-object properties', () => {
        const input = [{ a: 1 }, { b: 'string' }, { c: true }];
        assert.equal(isArrayOfRecord(input), true);
    });

    test('should return true for a list of empty objects', () => {
        const input = [{}, {}, {}];
        assert.equal(isArrayOfRecord(input), true);
    });
});

describe('Testing perseArrayOfRecord', () => {
    test('should flatten an array of objects into a list of lists, filling missing values with an empty string', () => {
        const input = [{ a: 1, b: 2 }, { a: 30, b: 20 }, { a: 8 }, { b: 5 }, {}];
        const [flattenedArray, keys] = perseArrayOfRecord(input as TArrayOfRecord);
        assert.deepEqual(keys, ['a', 'b']);
        assert.deepEqual(flattenedArray, [
            [1, 2],
            [30, 20],
            [8, ''],
            ['', 5],
            ['', '']
        ]);
    });

    test('should handle an empty array', () => {
        const input = [];
        const [flattenedArray, keys] = perseArrayOfRecord(input as TArrayOfRecord);
        assert.deepEqual(keys, []);
        assert.deepEqual(flattenedArray, []);
    });

    test('should handle an array with objects having different keys', () => {
        const input = [{ a: 1, c: 3 }, { b: 2, d: 4 }];
        const [flattenedArray, keys] = perseArrayOfRecord(input as TArrayOfRecord);
        assert.deepEqual(keys, ['a', 'c', 'b', 'd']);
        assert.deepEqual(flattenedArray, [
            [1, 3, '', ''],
            ['', '', 2, 4]
        ]);
    });

    test('should handle an array with nested objects', () => {
        const input = [{ a: 1 }, { a: 1 }, { a: 1 }, { a: 1 }, { a: 1 }, { a: 2 },];
        const [flattenedArray, keys] = perseArrayOfRecord(input);
        assert.deepEqual(keys, ['a']);
        assert.deepEqual(flattenedArray, [
            [1],
            [1],
            [1],
            [1],
            [1],
            [2],
        ]);
    });

    test('should handle an array with empty objects', () => {
        const input = [{}, {}, {}];
        const [flattenedArray, keys] = perseArrayOfRecord(input);
        assert.deepEqual(keys, []);
        assert.deepEqual(flattenedArray, [
            [],
            [],
            []
        ]);
    });
});