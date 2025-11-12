/**
 * Unit tests for Module System
 * Tests module loading, interop, and lazy evaluation
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  interopRequireWildcard,
  createCommonJSModule,
  defineGetters,
  createLazyModule,
  nodeRequire
} from '../../src/modules/index.js';

describe('Module System', () => {
  describe('interopRequireWildcard', () => {
    it('should handle ES6 modules with __esModule flag', () => {
      const module = {
        __esModule: true,
        default: 'default export',
        named: 'named export'
      };

      const result = interopRequireWildcard(module);

      expect(result.default).toBe('default export');
      expect(result.named).toBe('named export');
    });

    it('should add default export for non-ES6 modules', () => {
      const module = {
        named: 'named export'
      };

      const result = interopRequireWildcard(module, true);

      expect(result.default).toBe(module);
      expect(result.named).toBe('named export');
    });

    it('should handle null modules', () => {
      const result = interopRequireWildcard(null);

      expect(result).toEqual({});
    });

    it('should create enumerable properties', () => {
      const module = {
        __esModule: true,
        foo: 'bar'
      };

      const result = interopRequireWildcard(module);
      const keys = Object.keys(result);

      expect(keys).toContain('foo');
    });
  });

  describe('createCommonJSModule', () => {
    it('should create a lazy CommonJS module', () => {
      let initialized = false;

      const getModule = createCommonJSModule((exports) => {
        initialized = true;
        exports.value = 42;
      });

      expect(initialized).toBe(false);

      const module = getModule();
      expect(initialized).toBe(true);
      expect(module.value).toBe(42);
    });

    it('should cache module after first call', () => {
      let callCount = 0;

      const getModule = createCommonJSModule((exports) => {
        callCount++;
        exports.value = 42;
      });

      const module1 = getModule();
      const module2 = getModule();

      expect(callCount).toBe(1);
      expect(module1).toBe(module2);
    });

    it('should support module.exports pattern', () => {
      const getModule = createCommonJSModule((exports, module) => {
        module.exports = { custom: true };
      });

      const module = getModule();
      expect(module.custom).toBe(true);
    });
  });

  describe('defineGetters', () => {
    it('should define getter properties', () => {
      const target = {};
      const getters = {
        foo: () => 'bar',
        baz: () => 42
      };

      defineGetters(target, getters);

      expect(target.foo).toBe('bar');
      expect(target.baz).toBe(42);
    });

    it('should make properties enumerable', () => {
      const target = {};
      defineGetters(target, { foo: () => 'bar' });

      const keys = Object.keys(target);
      expect(keys).toContain('foo');
    });

    it('should allow property override via setter', () => {
      const target = {};
      defineGetters(target, { foo: () => 'initial' });

      target.foo = 'updated';
      expect(target.foo).toBe('updated');
    });
  });

  describe('createLazyModule', () => {
    it('should initialize module on first access', () => {
      let initialized = false;

      const getLazy = createLazyModule(() => {
        initialized = true;
        return { value: 42 };
      });

      expect(initialized).toBe(false);

      const module = getLazy();
      expect(initialized).toBe(true);
      expect(module.value).toBe(42);
    });

    it('should cache result after first call', () => {
      let callCount = 0;

      const getLazy = createLazyModule(() => {
        callCount++;
        return { value: 42 };
      });

      const module1 = getLazy();
      const module2 = getLazy();

      expect(callCount).toBe(1);
      expect(module1).toBe(module2);
    });

    it('should handle undefined return values', () => {
      const getLazy = createLazyModule(() => undefined);

      expect(getLazy()).toBeUndefined();
    });
  });

  describe('nodeRequire', () => {
    it('should be a function', () => {
      expect(typeof nodeRequire).toBe('function');
    });

    it('should be able to require built-in modules', () => {
      const path = nodeRequire('path');
      expect(path).toBeDefined();
      expect(typeof path.join).toBe('function');
    });
  });
});
