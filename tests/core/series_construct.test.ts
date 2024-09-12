import { test, describe, assert } from 'vitest'
import Series from '../../src/core/series'


describe('Series Init with Empty Objects', function () {
    test('Constructing Series with an empty list', function () {
        const data = [];
        const series = new Series(data);
        assert.deepEqual(series.values, []);
        assert.equal(series.isEmpty, true);
        assert.deepEqual(series.shape, [0, NaN]);
        assert.equal(series.ndim, 1);
    });

    test('Constructing Series with undefined data', function () {
        const series = new Series();
        assert.deepEqual(series.values, []);
        assert.equal(series.isEmpty, true);
        assert.deepEqual(series.shape, [0, NaN]);
        assert.equal(series.ndim, 1);
    });

    test('Constructing Series with an empty list and specified name', function () {
        const data = [];
        const series = new Series(data, { name: "alpha" });
        assert.deepEqual(series.values, []);
        assert.deepEqual(series.name, "alpha");
        assert.equal(series.isEmpty, true);
        assert.deepEqual(series.shape, [0, NaN]);
        assert.equal(series.ndim, 1);
    });

    test('Constructing Series with undefined data and specified name', function () {
        const series = new Series(undefined, { name: "alpha" });
        assert.deepEqual(series.values, []);
        assert.deepEqual(series.name, "alpha");
        assert.equal(series.isEmpty, true);
        assert.deepEqual(series.shape, [0, NaN]);
        assert.equal(series.ndim, 1);
    });

    test('Constructing Series with a list of empty objects and specified name', function () {
        const series = new Series([{}, {}], { name: "alpha" });
        assert.deepEqual(series.values, ['', '']);
        assert.deepEqual(series.name, "alpha");
        assert.equal(series.isEmpty, false);
        assert.deepEqual(series.shape, [2, NaN]);
        assert.equal(series.ndim, 1);
    });
});

describe('Series Construct With 1D Data', function () {
    test('Constructing Series with a 1D array of strings', function () {
        const data = ["A", "B", "C", "D"];
        const df1 = new Series(data);
        assert.deepEqual(df1.name, "column_1");
        assert.deepEqual(df1.dtype, 'string');
        assert.equal(df1.isEmpty, false);
        assert.deepEqual(df1.shape, [4, NaN]);
        assert.equal(df1.ndim, 1);
    });

    test('Constructing Series with a list of objects containing numeric data', function () {
        const data = [{ count: 1 }, { count: 2 }, { count: 3 }, { count: 4 }];
        const df1 = new Series(data);
        assert.deepEqual(df1.name, "count");
        assert.deepEqual(df1.dtype, 'int');
        assert.equal(df1.isEmpty, false);
        assert.deepEqual(df1.shape, [4, NaN]);
        assert.equal(df1.ndim, 1);
    });

    test('Constructing Series with a 2D array of strings', function () {
        const data = [["A"], ["B"], ["C"], ["D"]];
        const df1 = new Series(data);
        assert.deepEqual(df1.name, "column_1");
        assert.deepEqual(df1.dtype, 'string');
        assert.equal(df1.isEmpty, false);
        assert.deepEqual(df1.shape, [4, NaN]);
        assert.equal(df1.ndim, 1);
    });

});