import { test, describe, assert } from 'vitest'
import { DataFrame, Series } from '../../src/index'

describe('DataFrame Testing', function () {
  test('interface testing with Empty list', function () {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const df1 = new DataFrame(data);
    assert.deepEqual(df1.columns, ['column_1', 'column_2', 'column_3']);
    assert.deepEqual(df1.dtypes, ['int', 'int', 'int']);
    assert.equal(df1.isEmpty, false);
    assert.deepEqual(df1.shape, [3, 3]);
    assert.equal(df1.ndim, 2);

  })

  test('interface testing with column ', function () {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const df = new DataFrame(data);
    const col = df.column_1
    assert.instanceOf(col, Series);
    assert.deepEqual(col.columns, ['column_1']);
    assert.deepEqual(col.dtypes, ['int']);
    assert.equal(col.isEmpty, false);
    assert.deepEqual(col.shape, [3, 1]);
    assert.equal(col.ndim, 1);
  })

  test("Testing Describe method", function () {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const df1 = new DataFrame(data);
    const desc = df1.describe()
    assert.deepEqual(desc.columns, ['column_1', 'column_2', 'column_3']);
    assert.deepEqual(desc.dtypes, Array(3).fill('float'));
    assert.deepEqual(desc.index, ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']);
    assert.deepEqual(desc.shape, [8, 3]);
    assert.deepEqual(desc.ndim, 2);
    assert.deepEqual(desc['column_1'].values, [3, 4, 2.4494898319244385, 1, 1, 4, 4, 7]);
  })

  test("Teating head method", function () {
    const data = [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12], [13, 14, 15], [16, 17, 18]];
    const df = new DataFrame(data);
    const dfhead = df.head(4)
    assert.deepEqual(dfhead.shape, [4, 3]);
  })


})