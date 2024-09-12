import { test, describe, assert } from 'vitest'
import { Series } from '../../src/index'

describe('Series Testing', function () {
    test('interface testing with Empty list', function () {
        const data = [1, 2, 3];
        const se = new Series(data);
        assert.deepEqual(se.name, 'column_1');
        assert.deepEqual(se.dtype, 'int');
        assert.equal(se.isEmpty, false);
        assert.deepEqual(se.shape, [3, NaN]);
        assert.equal(se.ndim, 1);
    })

    test('Testing Describe method', function () {
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const se = new Series(data);
        const desc = se.describe()
        assert.deepEqual(desc.name, 'column_1');
        assert.deepEqual(desc.dtype, 'float');
        assert.deepEqual(desc.index, ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']);
        assert.deepEqual(desc.shape, [8, NaN]);
        assert.deepEqual(desc.ndim, 1);
        assert.equal(desc.values[0], 9);
        assert.equal(desc.values[1], 5);
        assert.equal(desc.values[2], 2.58198881149292);
        assert.equal(desc.values[3], 1);
        assert.equal(desc.values[4], 3);
        assert.equal(desc.values[5], 5);
        assert.equal(desc.values[6], 7);
        assert.equal(desc.values[7], 9);
    })
})

describe('Series Head and Tail Functionality Tests', function () {
    test("Head of Series and verify data", function () {
        const data = [1, 2, 3, 4, 5];
        const series = new Series(data);
        const head = series.head(3);
        assert.deepEqual(head.values, [1, 2, 3]);
        assert.deepEqual(head.shape, [3, NaN]);
    });

    test("Tail of Series and verify data", function () {
        const data = [1, 2, 3, 4, 5];
        const series = new Series(data);
        const tail = series.tail(3);
        assert.deepEqual(tail.values, [3, 4, 5]);
        assert.deepEqual(tail.shape, [3, NaN]);
    });

    test("Head of empty Series and verify data", function () {
        const data = [];
        const series = new Series(data);
        const head = series.head(3);
        assert.deepEqual(head.values, []);
        assert.deepEqual(head.shape, [0, NaN]);
    });

    test("Tail of empty Series and verify data", function () {
        const data = [];
        const series = new Series(data);
        const tail = series.tail(3);
        assert.deepEqual(tail.values, []);
        assert.deepEqual(tail.shape, [0, NaN]);
    });

    test("Head of Series and verify data", function () {
        const data = [1, 2, 3, 4, 5, 6];
        const series = new Series(data);
        const head = series.head();
        assert.deepEqual(head.values, data.slice(0, 5));
        assert.deepEqual(head.shape, [5, NaN]);
    });

    test("Tail of Series and verify data", function () {
        const data = [1, 2, 3, 4, 5, 6];
        const series = new Series(data);
        const tail = series.tail();
        assert.deepEqual(tail.values, data.slice(1, 6));
        assert.deepEqual(tail.shape, [5, NaN]);
    });
});