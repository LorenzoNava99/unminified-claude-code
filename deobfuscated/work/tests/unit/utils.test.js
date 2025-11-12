/**
 * Unit tests for Utilities Module
 * Tests type checking, array operations, object utilities, and string processing
 */

import { describe, it, expect } from '@jest/globals';
import {
  // Type checking
  isObjectLike,
  isObject,
  isSymbol,
  isFunction,
  isNaN,
  isIndex,
  getTypeTag,

  // String utilities
  toString,

  // Array utilities
  arrayMap,
  copyArray,
  arrayEach,
  baseFindIndex,
  strictIndexOf,
  baseIndexOf,
  baseIncludes,

  // Object utilities
  getValue,
  baseAssignValue,
  assignValue,
  baseCreate,
  eq,

  // Function utilities
  identity,
  apply,
  constant,
  noop
} from '../../src/utils/index.js';

describe('Utilities Module', () => {
  describe('Type Checking', () => {
    describe('isObjectLike', () => {
      it('should return true for objects', () => {
        expect(isObjectLike({})).toBe(true);
        expect(isObjectLike([])).toBe(true);
        expect(isObjectLike(new Date())).toBe(true);
      });

      it('should return false for null and primitives', () => {
        expect(isObjectLike(null)).toBe(false);
        expect(isObjectLike(undefined)).toBe(false);
        expect(isObjectLike(42)).toBe(false);
        expect(isObjectLike('string')).toBe(false);
      });
    });

    describe('isObject', () => {
      it('should return true for objects and functions', () => {
        expect(isObject({})).toBe(true);
        expect(isObject([])).toBe(true);
        expect(isObject(() => {})).toBe(true);
      });

      it('should return false for null and primitives', () => {
        expect(isObject(null)).toBe(false);
        expect(isObject(42)).toBe(false);
      });
    });

    describe('isSymbol', () => {
      it('should return true for symbols', () => {
        expect(isSymbol(Symbol('test'))).toBe(true);
      });

      it('should return false for non-symbols', () => {
        expect(isSymbol('string')).toBe(false);
        expect(isSymbol(42)).toBe(false);
        expect(isSymbol({})).toBe(false);
      });
    });

    describe('isFunction', () => {
      it('should return true for functions', () => {
        expect(isFunction(() => {})).toBe(true);
        expect(isFunction(function() {})).toBe(true);
        expect(isFunction(async () => {})).toBe(true);
        expect(isFunction(function*() {})).toBe(true);
      });

      it('should return false for non-functions', () => {
        expect(isFunction({})).toBe(false);
        expect(isFunction(42)).toBe(false);
      });
    });

    describe('isNaN', () => {
      it('should return true for NaN', () => {
        expect(isNaN(NaN)).toBe(true);
        expect(isNaN(0 / 0)).toBe(true);
      });

      it('should return false for non-NaN values', () => {
        expect(isNaN(42)).toBe(false);
        expect(isNaN('string')).toBe(false);
        expect(isNaN(undefined)).toBe(false);
      });
    });

    describe('isIndex', () => {
      it('should return true for valid array indices', () => {
        expect(isIndex(0)).toBe(true);
        expect(isIndex(5)).toBe(true);
        expect(isIndex('0')).toBe(true);
      });

      it('should return false for invalid indices', () => {
        expect(isIndex(-1)).toBe(false);
        expect(isIndex(1.5)).toBe(false);
        expect(isIndex('foo')).toBe(false);
      });

      it('should respect length parameter', () => {
        expect(isIndex(5, 10)).toBe(true);
        expect(isIndex(15, 10)).toBe(false);
      });
    });

    describe('getTypeTag', () => {
      it('should return correct tags for primitives', () => {
        expect(getTypeTag(null)).toBe('[object Null]');
        expect(getTypeTag(undefined)).toBe('[object Undefined]');
      });

      it('should return correct tags for objects', () => {
        expect(getTypeTag({})).toBe('[object Object]');
        expect(getTypeTag([])).toBe('[object Array]');
        expect(getTypeTag(new Date())).toBe('[object Date]');
      });
    });
  });

  describe('String Utilities', () => {
    describe('toString', () => {
      it('should convert primitives to strings', () => {
        expect(toString('hello')).toBe('hello');
        expect(toString(42)).toBe('42');
        expect(toString(true)).toBe('true');
      });

      it('should handle arrays', () => {
        expect(toString([1, 2, 3])).toBe('1,2,3');
      });

      it('should handle -0', () => {
        expect(toString(-0)).toBe('-0');
      });

      it('should handle symbols', () => {
        const sym = Symbol('test');
        const result = toString(sym);
        expect(result).toContain('Symbol');
      });
    });
  });

  describe('Array Utilities', () => {
    describe('arrayMap', () => {
      it('should map array values', () => {
        const result = arrayMap([1, 2, 3], x => x * 2);
        expect(result).toEqual([2, 4, 6]);
      });

      it('should pass index and array to callback', () => {
        const indices = [];
        arrayMap([1, 2, 3], (value, index, arr) => {
          indices.push(index);
          expect(arr.length).toBe(3);
        });
        expect(indices).toEqual([0, 1, 2]);
      });

      it('should handle empty arrays', () => {
        expect(arrayMap([], x => x)).toEqual([]);
      });
    });

    describe('copyArray', () => {
      it('should copy array values', () => {
        const source = [1, 2, 3];
        const result = copyArray(source);
        expect(result).toEqual([1, 2, 3]);
        expect(result).not.toBe(source);
      });

      it('should use provided array', () => {
        const dest = [0, 0, 0];
        const result = copyArray([1, 2, 3], dest);
        expect(result).toBe(dest);
        expect(result).toEqual([1, 2, 3]);
      });
    });

    describe('arrayEach', () => {
      it('should iterate over array', () => {
        const values = [];
        arrayEach([1, 2, 3], value => values.push(value));
        expect(values).toEqual([1, 2, 3]);
      });

      it('should stop iteration if callback returns false', () => {
        const values = [];
        arrayEach([1, 2, 3, 4], value => {
          values.push(value);
          return value < 2;
        });
        expect(values).toEqual([1, 2]);
      });
    });

    describe('baseFindIndex', () => {
      it('should find index from left', () => {
        const index = baseFindIndex([1, 2, 3, 4], x => x > 2, 0, false);
        expect(index).toBe(2);
      });

      it('should find index from right', () => {
        const index = baseFindIndex([1, 2, 3, 4], x => x < 3, 3, true);
        expect(index).toBe(1);
      });

      it('should return -1 if not found', () => {
        const index = baseFindIndex([1, 2, 3], x => x > 10, 0, false);
        expect(index).toBe(-1);
      });
    });

    describe('strictIndexOf', () => {
      it('should find value using strict equality', () => {
        expect(strictIndexOf([1, 2, 3], 2, 0)).toBe(1);
      });

      it('should return -1 if not found', () => {
        expect(strictIndexOf([1, 2, 3], 4, 0)).toBe(-1);
      });
    });

    describe('baseIndexOf', () => {
      it('should find regular values', () => {
        expect(baseIndexOf([1, 2, 3], 2, 0)).toBe(1);
      });

      it('should find NaN', () => {
        expect(baseIndexOf([1, NaN, 3], NaN, 0)).toBe(1);
      });
    });

    describe('baseIncludes', () => {
      it('should return true if value exists', () => {
        expect(baseIncludes([1, 2, 3], 2)).toBe(true);
      });

      it('should return false if value does not exist', () => {
        expect(baseIncludes([1, 2, 3], 4)).toBe(false);
      });

      it('should handle NaN', () => {
        expect(baseIncludes([1, NaN, 3], NaN)).toBe(true);
      });
    });
  });

  describe('Object Utilities', () => {
    describe('getValue', () => {
      it('should get object property', () => {
        expect(getValue({ a: 1 }, 'a')).toBe(1);
      });

      it('should return undefined for missing property', () => {
        expect(getValue({}, 'a')).toBeUndefined();
      });

      it('should return undefined for null object', () => {
        expect(getValue(null, 'a')).toBeUndefined();
      });
    });

    describe('baseAssignValue', () => {
      it('should assign property value', () => {
        const obj = {};
        baseAssignValue(obj, 'foo', 'bar');
        expect(obj.foo).toBe('bar');
      });

      it('should handle __proto__ safely', () => {
        const obj = {};
        baseAssignValue(obj, '__proto__', { polluted: true });
        expect({}.polluted).toBeUndefined();
      });
    });

    describe('assignValue', () => {
      it('should assign new property', () => {
        const obj = {};
        assignValue(obj, 'foo', 'bar');
        expect(obj.foo).toBe('bar');
      });

      it('should not assign if value is same', () => {
        const obj = { foo: 'bar' };
        assignValue(obj, 'foo', 'bar');
        expect(obj.foo).toBe('bar');
      });

      it('should update if value differs', () => {
        const obj = { foo: 'bar' };
        assignValue(obj, 'foo', 'baz');
        expect(obj.foo).toBe('baz');
      });
    });

    describe('baseCreate', () => {
      it('should create object with prototype', () => {
        const proto = { foo: 'bar' };
        const obj = baseCreate(proto);
        expect(obj.foo).toBe('bar');
      });

      it('should return empty object for non-object prototype', () => {
        expect(baseCreate(null)).toEqual({});
        expect(baseCreate(42)).toEqual({});
      });
    });

    describe('eq', () => {
      it('should return true for equal values', () => {
        expect(eq(1, 1)).toBe(true);
        expect(eq('a', 'a')).toBe(true);
      });

      it('should return false for different values', () => {
        expect(eq(1, 2)).toBe(false);
      });

      it('should handle NaN correctly', () => {
        expect(eq(NaN, NaN)).toBe(true);
      });
    });
  });

  describe('Function Utilities', () => {
    describe('identity', () => {
      it('should return input unchanged', () => {
        expect(identity(42)).toBe(42);
        expect(identity('foo')).toBe('foo');
        const obj = {};
        expect(identity(obj)).toBe(obj);
      });
    });

    describe('apply', () => {
      it('should apply function with arguments', () => {
        const fn = function() { return Array.from(arguments); };
        expect(apply(fn, null, [1, 2, 3])).toEqual([1, 2, 3]);
      });

      it('should handle this binding', () => {
        const fn = function() { return this.value; };
        const context = { value: 42 };
        expect(apply(fn, context, [])).toBe(42);
      });
    });

    describe('constant', () => {
      it('should return function that returns constant', () => {
        const fn = constant(42);
        expect(fn()).toBe(42);
        expect(fn()).toBe(42);
      });
    });

    describe('noop', () => {
      it('should do nothing and return undefined', () => {
        expect(noop()).toBeUndefined();
      });
    });
  });
});
