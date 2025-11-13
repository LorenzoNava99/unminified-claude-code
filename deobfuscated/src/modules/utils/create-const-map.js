/**
 * createConstMap Utility (ti1)
 *
 * Extracted from Claude Code CLI bundle.
 * Category: utilities
 *
 * Original location: Lines 402461-402479
 * Original name: ti1
 * Size: 18 lines
 * Occurrences: Used by OtelSemanticAttributes
 *
 * Utility for creating constant maps from arrays of strings.
 * Converts strings to uppercase with underscores (e.g., "http.method" → "HTTP_METHOD")
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var ti1 = createCommonJSModule(R42 => {
  Object.defineProperty(R42, "__esModule", {
    value: true
  });
  R42.createConstMap = undefined;
  function uW5(A) {
    let B = {};
    let Q = A.length;
    for (let I = 0; I < Q; I++) {
      let G = A[I];
      if (G) {
        B[String(G).toUpperCase().replace(/[-.]/g, "_")] = G;
      }
    }
    return B;
  }
  R42.createConstMap = uW5;
});

// Export the module
export default ti1;
export const createConstMapModule = ti1;
