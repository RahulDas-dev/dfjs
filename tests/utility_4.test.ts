import { test, describe, assert } from 'vitest'
import { isRecordOfSeries, isSeries, perseRecoredsOfSeries } from '../src/utility';
import { Series } from '../src/index';

describe('Testing isRecordOfSeries', () => {
    test('should return true for an object with all values as Series of the same length', () => {
        const input = {
            a: new Series([1, 2, 3]),
            b: new Series(['a', 'b', 'c']),
            c: new Series([true, false, true])
        };
        assert.equal(isRecordOfSeries(input), true);
    });

    test('should return false for an object with some values not as Series', () => {
        const input = {
            a: new Series([1, 2, 3]),
            b: 'not a series',
            c: new Series([true, false, true])
        };
        assert.equal(isRecordOfSeries(input), false);
    });

    test('should throw an error for an object with Series of different lengths', () => {
        const input = {
            a: new Series([1, 2, 3]),
            b: new Series(['a', 'b']),
            c: new Series([true, false, true])
        };
        assert.throws(() => isRecordOfSeries(input), /Length Error: Length of Rows must be the same!/);
    });

    test('should return false for an empty object', () => {
        const input = {};
        assert.equal(isRecordOfSeries(input), false);
    });

    test('should return false for a non-object input', () => {
        const input = 'not an object';
        assert.equal(isRecordOfSeries(input), false);
    });

    test('should return true for an object with mixed types of Series of the same length', () => {
        const input = {
            a: new Series([1, 2, 3]),
            b: new Series(['a', 'b', 'c']),
            c: new Series([true, false, true]),
            d: new Series([new Date(), new Date(), new Date()])
        };
        assert.equal(isRecordOfSeries(input), true);
    });

    test('should return true for an object with nested Series of the same length', () => {
        const input = {
            a: new Series([[1, 2], [3, 4], [5, 6]]),
            b: new Series([['a', 'b'], ['c', 'd'], ['e', 'f']]),
            c: new Series([[true, false], [false, true], [true, true]])
        };
        assert.equal(isRecordOfSeries(input), true);
    });

    test('should throw an error for an object with some empty Series', () => {
        const input = {
            a: new Series([1, 2, 3]),
            b: new Series([]),
            c: new Series([true, false, true])
        };
        assert.throws(() => isRecordOfSeries(input), /Length Error: Length of Rows must be the same!/);
    });

    test('should return false for an object with some null values', () => {
        const input = {
            a: new Series([1, 2, 3]),
            b: null,
            c: new Series([true, false, true])
        };
        assert.equal(isRecordOfSeries(input), false);
    });

    test('should return false for an object with some undefined values', () => {
        const input = {
            a: new Series([1, 2, 3]),
            b: undefined,
            c: new Series([true, false, true])
        };
        assert.equal(isRecordOfSeries(input), false);
    });

    test('should return false for an object with some non-Series values', () => {
        const input = {
            a: new Series([1, 2, 3]),
            b: 123,
            c: new Series([true, false, true])
        };
        assert.equal(isRecordOfSeries(input), false);
    });
});


describe('Testing isSeries', function () {

    test('Testing isSeries With List of object and number', function () {
        const ss = new Series([1, 2, 3]);
        assert.equal(isSeries(ss), true);
    });
});

describe('perseRecoredsOfSeries', () => {
    test('should retrieve row array and column names from an object', () => {
        const input = { a: new Series([1, 2, 3, 4]), b: new Series([30, 20, 30, 20]) };
        const [rowsArr, colNames] = perseRecoredsOfSeries(input);
        assert.deepEqual(colNames, ['a', 'b']);
        assert.deepEqual(rowsArr, [
            [1, 30],
            [2, 20],
            [3, 30],
            [4, 20]
        ]);
    });

    test('should handle an object with different lengths of Series', () => {
        const input = { a: new Series([1, 2, 3]), b: new Series(['30', '20', '30']) };
        const [rowsArr, colNames] = perseRecoredsOfSeries(input);
        assert.deepEqual(colNames, ['a', 'b']);
        assert.deepEqual(rowsArr, [
            [1, "30"],
            [2, "20"],
            [3, "30"]
        ]);
    });


    test('should handle an object with one key', () => {
        const input = { a: new Series([1, 2, 3, 4]) };
        const [rowsArr, colNames] = perseRecoredsOfSeries(input);
        assert.deepEqual(colNames, ['a']);
        assert.deepEqual(rowsArr, [
            [1],
            [2],
            [3],
            [4]
        ]);
    });

    test('should handle an object with empty Series', () => {
        const input = { a: new Series([]), b: new Series([]) };
        const [rowsArr, colNames] = perseRecoredsOfSeries(input);
        assert.deepEqual(colNames, ['a', 'b']);
        assert.deepEqual(rowsArr, [[], []]);
    });
});
