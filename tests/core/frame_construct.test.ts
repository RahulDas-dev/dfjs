import { test, describe, assert } from 'vitest'
import { DataFrame } from '../../src/index'

describe('DataFrame Init with Empty Objects', function () {
  test('Constructing DataFrame with an empty list', function () {
    const data = [];
    const df1 = new DataFrame(data);
    assert.deepEqual(df1.columns, []);
    assert.deepEqual(df1.dtypes, []);
    assert.equal(df1.isEmpty, true);
    assert.deepEqual(df1.shape, [1, 0]);
    assert.equal(df1.ndim, 2);
  })

  test('Constructing DataFrame with undefined data', function () {
    const df1 = new DataFrame();
    assert.deepEqual(df1.columns, []);
    assert.deepEqual(df1.dtypes, []);
    assert.equal(df1.isEmpty, true);
    assert.deepEqual(df1.shape, [1, 0]);
    assert.equal(df1.ndim, 2);
  })

  test('Constructing DataFrame with an empty list and specified columns', function () {
    const data = [];
    const df1 = new DataFrame(data, { columns: ["beta", "gama"] });
    assert.deepEqual(df1.columns, ["beta", "gama"]);
    assert.deepEqual(df1.dtypes, []);
    assert.equal(df1.isEmpty, true);
    assert.deepEqual(df1.shape, [1, 0]);
    assert.equal(df1.ndim, 2);
  })

  test('Constructing DataFrame with undefined data and specified columns', function () {
    const df = new DataFrame(undefined, { columns: ["beta", "gama"] });
    assert.deepEqual(df.columns, ["beta", "gama"]);
    assert.deepEqual(df.dtypes, []);
    assert.equal(df.isEmpty, true);
    assert.deepEqual(df.shape, [1, 0]);
    assert.equal(df.ndim, 2);
  })

  test('Constructing DataFrame with a list of empty objects and specified columns', function () {
    const df = new DataFrame([{}, {}], { columns: ["beta", "gama"] });
    assert.deepEqual(df.columns, ["beta", "gama"]);
    assert.deepEqual(df.dtypes, []);
    assert.equal(df.isEmpty, true);
    assert.deepEqual(df.shape, [2, 0]);
    assert.equal(df.ndim, 2);
  })
})

describe('DataFrame Init with With 2D Data', function () {
  test('Constructing DataFrame with records of arrays', function () {
    const data = { alpha: ["A", "B", "C", "D"], count: [1, 2, 3, 4] };
    const df1 = new DataFrame(data);
    assert.deepEqual(df1.columns, ["alpha", "count"]);
    assert.deepEqual(df1.dtypes, ['string', 'int']);
    assert.deepEqual(df1.index, [0, 1, 2, 3]);
    assert.equal(df1.isEmpty, false);
    assert.deepEqual(df1.shape, [4, 2]);
    assert.equal(df1.ndim, 2);
  });

  test('Constructing DataFrame with records of arrays and specified columns and dtypes', function () {
    const data = { alpha: ["A", "B", "C", "D"], count: [1, 2, 3, 4] };
    const df2 = new DataFrame(data, { columns: ["beta", "gama"], dtypes: ['int', 'int'] });
    assert.deepEqual(df2.columns, ["beta", "gama"]);
    assert.deepEqual(df2.dtypes, ['int', 'int']);
    assert.equal(df2.isEmpty, false);
    assert.deepEqual(df2.shape, [4, 2]);
    assert.equal(df2.ndim, 2);
  });

  test('Constructing DataFrame with a list of object-type data', function () {
    const data = [{ alpha: 'A', count: 1 }, { alpha: 'B', count: 2 }, { alpha: 'C', count: 3 }, { alpha: 'D', count: 4 }];
    const df1 = new DataFrame(data);
    assert.deepEqual(df1.columns, ["alpha", "count"]);
    assert.deepEqual(df1.dtypes, ['string', 'int']);
    assert.equal(df1.isEmpty, false);
    assert.deepEqual(df1.shape, [4, 2]);
    assert.equal(df1.ndim, 2);
  });

  test('Constructing DataFrame with a list of object-type data and specified columns and dtypes', function () {
    const data = [{ alpha: 'A', count: 1 }, { alpha: 'B', count: 2 }, { alpha: 'C', count: 3 }, { alpha: 'D', count: 4 }];
    const df2 = new DataFrame(data, { columns: ["beta", "gama"], dtypes: ['string', 'string'] });
    assert.deepEqual(df2.columns, ["beta", "gama"]);
    assert.deepEqual(df2.dtypes, ['string', 'string']);
    assert.equal(df2.isEmpty, false);
    assert.deepEqual(df2.shape, [4, 2]);
    assert.equal(df2.ndim, 2);
  });

  test('Constructing DataFrame with a 2D array', function () {
    const data = [["A", 2], ["B", 2], ["C", 3], ["D", 3]];
    const df1 = new DataFrame(data);
    assert.deepEqual(df1.columns, ["column_1", "column_2"]);
    assert.deepEqual(df1.dtypes, ['string', 'int']);
    assert.equal(df1.isEmpty, false);
    assert.deepEqual(df1.shape, [4, 2]);
    assert.equal(df1.ndim, 2);
  });

  test('Constructing DataFrame with a 2D array and specified columns and dtypes', function () {
    const data = [["A", 2], ["B", 2], ["C", 3], ["D", 3]];
    const df2 = new DataFrame(data, { columns: ["beta", "gama"], dtypes: ['string', 'string'] });
    assert.deepEqual(df2.columns, ["beta", "gama"]);
    assert.deepEqual(df2.dtypes, ['string', 'string']);
    assert.equal(df2.isEmpty, false);
    assert.deepEqual(df2.shape, [4, 2]);
    assert.equal(df2.ndim, 2);
  });
})

describe('DataFrame Init with 1D Data', function () {
  test('Constructing DataFrame with an object-type 1D array', function () {
    const data = ["A", "B", "C", "D"];
    const df2 = new DataFrame(data, { columns: ["beta"], dtypes: ['int'] });
    assert.deepEqual(df2.columns, ["beta"]);
    assert.deepEqual(df2.dtypes, ['int']);
    assert.equal(df2.isEmpty, false);
    assert.deepEqual(df2.shape, [4, 1]);
    assert.equal(df2.ndim, 2);
  })

  test('Constructing DataFrame with a list of object-type data', function () {
    const data = [{ count: 1 }, { count: 2 }, { count: 3 }, { count: 4 }];
    const df2 = new DataFrame(data, { columns: ["count"], dtypes: ['int'] });
    assert.deepEqual(df2.columns, ["count"]);
    assert.deepEqual(df2.dtypes, ['int']);
    assert.equal(df2.isEmpty, false);
    assert.deepEqual(df2.shape, [4, 1]);
    assert.equal(df2.ndim, 2);
  })

  test('Constructing DataFrame with a 2D array', function () {
    const data = [["A"], ["B"], ["C"], ["D"]];
    const df2 = new DataFrame(data, { columns: ["beta"], dtypes: ['string'] });
    assert.deepEqual(df2.columns, ["beta"]);
    assert.deepEqual(df2.dtypes, ['string']);
    assert.equal(df2.isEmpty, false);
    assert.deepEqual(df2.shape, [4, 1]);
    assert.equal(df2.ndim, 2);
  })
})