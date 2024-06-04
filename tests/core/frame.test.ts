import { test, describe, assert } from 'vitest'
import { DataFrame } from '../../src/index'
import Series from '../../src/core/series';

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
    const df1 = new DataFrame(data);
    const col1 = df1.column_1
    assert.deepEqual(col1.columns, ['column_1']);
    assert.deepEqual(col1.dtypes, ['int']);
    assert.equal(col1.isEmpty, false);
    assert.deepEqual(col1.shape, [3, 1]);
    assert.equal(col1.ndim, 1);
  })
})