/**
 * PredicateExports
 *
 * Extracted from Claude Code CLI bundle.
 * Category: predicates
 *
 * Original location: Lines 407336-407387
 * Size: 51 lines
 * Occurrences: 6
 *
 * Pattern matching predicates for string matching with wildcard support.
 * - PatternPredicate: Supports wildcard patterns (e.g., "*.js")
 * - ExactPredicate: Exact string matching
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var GeA = createCommonJSModule(PredicateExports => {
  Object.defineProperty(PredicateExports, "__esModule", {
    value: true
  });
  PredicateExports.ExactPredicate = PredicateExports.PatternPredicate = undefined;
  var dO5 = /[\^$\\.+?()[\]{}|]/g;
  class xn1 {
    _matchAll;
    _regexp;
    constructor(A) {
      if (A === "*") {
        this._matchAll = true;
        this._regexp = /.*/;
      } else {
        this._matchAll = false;
        this._regexp = new RegExp(xn1.escapePattern(A));
      }
    }
    match(A) {
      if (this._matchAll) {
        return true;
      }
      return this._regexp.test(A);
    }
    static escapePattern(A) {
      return `^${A.replace(dO5, "\\$&").replace("*", ".*")}$`;
    }
    static hasWildcard(A) {
      return A.includes("*");
    }
  }
  PredicateExports.PatternPredicate = xn1;
  class RF2 {
    _matchAll;
    _pattern;
    constructor(A) {
      this._matchAll = A === undefined;
      this._pattern = A;
    }
    match(A) {
      if (this._matchAll) {
        return true;
      }
      if (A === this._pattern) {
        return true;
      }
      return false;
    }
  }
  PredicateExports.ExactPredicate = RF2;
});

// Export the module
export default GeA;
export const PredicateExports = GeA;
