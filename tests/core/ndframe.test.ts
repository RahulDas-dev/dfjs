import { test, describe, assert } from 'vitest'
import { DataFrame } from '../../src/index'


describe('NDFrame Testing', function () {

  test('NDFrame Basic interface testing with object type data', function () {
    const data = { alpha: ["A", "B", "C", "D"], count: [1, 2, 3, 4] };
    const df1 = new DataFrame(data);
    assert.deepEqual(df1.columns, ["alpha", "count"]);
    assert.deepEqual(df1.dtypes, ['string', 'int32']);
    assert.equal(df1.isEmpty, false);
    assert.deepEqual(df1.shape, [4, 2]);
    assert.equal(df1.ndim, 2);

    const df2 = new DataFrame(data, { columns: ["beta", "gama"], dtypes: ['string', 'string'] });
    assert.deepEqual(df2.columns, ["beta", "gama"]);
    assert.deepEqual(df2.dtypes, ['string', 'string']);
    assert.equal(df2.isEmpty, false);
    assert.deepEqual(df2.shape, [4, 2]);
    assert.equal(df2.ndim, 2);
  })

  test('NDFrame Basic interface testing with List of object type data', function () {
    const data = [{ alpha: 'A', count: 1 }, { alpha: 'B', count: 2 }, { alpha: 'C', count: 3 }, { alpha: 'D', count: 4 }];
    const df1 = new DataFrame(data);
    assert.deepEqual(df1.columns, ["alpha", "count"]);
    assert.deepEqual(df1.dtypes, ['string', 'int32']);
    assert.equal(df1.isEmpty, false);
    assert.deepEqual(df1.shape, [4, 2]);
    assert.equal(df1.ndim, 2);

    const df2 = new DataFrame(data, { columns: ["beta", "gama"], dtypes: ['string', 'string'] });
    assert.deepEqual(df2.columns, ["beta", "gama"]);
    assert.deepEqual(df2.dtypes, ['string', 'string']);
    assert.equal(df2.isEmpty, false);
    assert.deepEqual(df2.shape, [4, 2]);
    assert.equal(df2.ndim, 2);
  })

  test('NDFrame Basic interface testing with 2D array', function () {
    const data = [["A", 2], ["B", 2], ["C", 3], ["D", 3]];
    const df1 = new DataFrame(data);
    assert.deepEqual(df1.columns, ["column_1", "column_2"]);
    assert.deepEqual(df1.dtypes, ['string', 'int32']);
    assert.equal(df1.isEmpty, false);
    assert.deepEqual(df1.shape, [4, 2]);
    assert.equal(df1.ndim, 2);

    const df2 = new DataFrame(data, { columns: ["beta", "gama"], dtypes: ['string', 'string'] });
    assert.deepEqual(df2.columns, ["beta", "gama"]);
    assert.deepEqual(df2.dtypes, ['string', 'string']);
    assert.equal(df2.isEmpty, false);
    assert.deepEqual(df2.shape, [4, 2]);
    assert.equal(df2.ndim, 2);
  })

  /* test('NDFrame Basic interface testing with 1D array', function () {
    const data = [1, 2, 3, 4];
    const df1 = new DataFrame(data);
    assert.deepEqual(df1.columns, ["column_1"]);
    assert.deepEqual(df1.dtypes, ['string']);
    assert.equal(df1.isEmpty, false);
    assert.deepEqual(df1.shape, [4, 1]);
    assert.equal(df1.ndim, 2);

    const df2 = new DataFrame(data, { columns: ["beta"], dtypes: ['string'] });
    assert.deepEqual(df2.columns, ["beta"]);
    assert.deepEqual(df2.dtypes, ['string']);
    assert.equal(df2.isEmpty, false);
    assert.deepEqual(df2.shape, [4, 1]);
    assert.equal(df2.ndim, 2);
  }) */
})
