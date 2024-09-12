import { test, describe, assert } from 'vitest'
import { DataFrame, Series } from '../../src/index'

describe('DataFrame Functionality Tests', function () {

    test('Access DataFrame column and verify Series properties', function () {
        const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        const df = new DataFrame(data);
        const col = df.column_1 as Series;
        assert.instanceOf(col, Series);
        assert.deepEqual(col.name, 'column_1');
        assert.deepEqual(col.dtype, 'int');
        assert.equal(col.isEmpty, false);
        assert.deepEqual(col.shape, [3, NaN]);
        assert.equal(col.ndim, 1);
    })

    test("Describe DataFrame and verify summary statistics", function () {
        const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        const df1 = new DataFrame(data);
        const desc = df1.describe()
        assert.deepEqual(desc.columns, ['column_1', 'column_2', 'column_3']);
        assert.deepEqual(desc.dtypes, Array(3).fill('float'));
        assert.deepEqual(desc.index, ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']);
        assert.deepEqual(desc.shape, [8, 3]);
        assert.deepEqual(desc.ndim, 2);
        assert.deepEqual((desc.column_1 as Series).values, [3, 4, 2.4494898319244385, 1, 1, 4, 4, 7]);
    })

})



describe('DataFrame isEmpty Method Tests', function () {

    test('isEmpty should return true for an empty DataFrame', function () {
        const data = [];
        const df = new DataFrame(data);
        assert.equal(df.isEmpty, true);
    });

    test('isEmpty should return false for a non-empty DataFrame', function () {
        const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
        const df = new DataFrame(data);
        assert.equal(df.isEmpty, false);
    });

    test('isEmpty should return true for a DataFrame with columns but no rows', function () {
        const data = [[]];
        const columns = ['column_1', 'column_2', 'column_3'];
        const df = new DataFrame(data, { columns });
        assert.equal(df.isEmpty, true);
    });

    test('isEmpty should return true for a DataFrame with columns but no rows', function () {
        const data = [[], [], []];
        const columns = ['column_1', 'column_2', 'column_3'];
        const df = new DataFrame(data, { columns });
        assert.equal(df.isEmpty, true);
    });

});

describe('DataFrame Head and Tail Functionality Tests', function () {
    test("Head of DataFrame and verify data", function () {
        const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12], [13, 14, 15]];
        const df = new DataFrame(data);
        const head = df.head(3);
        assert.deepEqual(head.values, [[1, 2, 3], [4, 5, 6], [7, 8, 9]]);
        assert.deepEqual(head.shape, [3, 3]);
    })

    test("Tail of DataFrame and verify data", function () {
        const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12], [13, 14, 15]];
        const df = new DataFrame(data);
        const tail = df.tail(3);
        assert.deepEqual(tail.values, [[7, 8, 9], [10, 11, 12], [13, 14, 15]]);
        assert.deepEqual(tail.shape, [3, 3]);
    })

    test("Head of empty DataFrame and verify data", function () {
        const data = [];
        const df = new DataFrame(data);
        const head = df.head(3);
        assert.deepEqual(head.values, [[]]);
        assert.deepEqual(head.shape, [1, 0]);
    });

    test("Head of empty DataFrame and verify data", function () {
        const data = [[]];
        const df = new DataFrame(data);
        const head = df.head(3);
        assert.deepEqual(head.values, [[]]);
        assert.deepEqual(head.shape, [1, 0]);
    });

    test("Tail of empty DataFrame and verify data", function () {
        const data = [];
        const df = new DataFrame(data);
        const tail = df.tail(3);
        assert.deepEqual(tail.values, [[]]);
        assert.deepEqual(tail.shape, [1, 0]);
    });

    test("Head of DataFrame and verify data", function () {
        const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12], [13, 14, 15], [16, 17, 18]];
        const df = new DataFrame(data);
        const head = df.head();
        assert.deepEqual(head.values, data.slice(0, 5));
        assert.deepEqual(head.shape, [5, 3]);
    })

    test("Tail of DataFrame and verify data", function () {
        const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12], [13, 14, 15], [16, 17, 18]];
        const df = new DataFrame(data);
        const tail = df.tail();
        assert.deepEqual(tail.values, data.slice(1, 6));
        assert.deepEqual(tail.shape, [5, 3]);
    })
})