import { test, describe, assert } from 'vitest'
import { DataFrame } from '../../src/index'

describe('DataFrame Testing', function () {
  test('interface testing with Empty list', function () {
    const data = [];
    const df1 = new DataFrame(data);
    assert.deepEqual(df1.columns, []);
    assert.deepEqual(df1.dtypes, []);
    assert.equal(df1.isEmpty, true);
    assert.deepEqual(df1.shape, [0, 0]);
    assert.equal(df1.ndim, 2);
  })
})