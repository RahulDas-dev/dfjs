import { test, describe, assert } from 'vitest'
import { isObjectArray } from '../src/utility';

describe('Utility Testing', function () {
    test('Testing isObjectArray With Empty List', function () {
        const r = isObjectArray([]);
        assert.equal(r, false);
    })
    test('Testing isObjectArray With object', function () {
        const r = isObjectArray({});
        assert.equal(r, false);
    })
    test('Testing isObjectArray With list of number', function () {
        const r = isObjectArray([1, 2, 3]);
        assert.equal(r, false);
    })
    test('Testing isObjectArray With List of object', function () {
        const r = isObjectArray([{}, {}]);
        assert.equal(r, true);
    })
})

