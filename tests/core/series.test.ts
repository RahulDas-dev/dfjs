import { test, describe, assert } from 'vitest'
import { Series } from '../../src/index'

describe('Series Testing', function () {
    test('interface testing with Empty list', function () {
        const data = [1, 2, 3];
        const se = new Series(data);
        assert.deepEqual(se.columns, ['column_1']);
        assert.deepEqual(se.dtypes, ['int']);
        assert.equal(se.isEmpty, false);
        assert.deepEqual(se.shape, [3, 1]);
        assert.equal(se.ndim, 1);
    })

    test('Testing Describe method', function () {
        const data = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        const se = new Series(data);
        const desc = se.describe()
        assert.deepEqual(desc.columns, ['column_1']);
        assert.deepEqual(desc.dtypes, ['float']);
        assert.deepEqual(desc.index, ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']);
        assert.deepEqual(desc.shape, [8, 1]);
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