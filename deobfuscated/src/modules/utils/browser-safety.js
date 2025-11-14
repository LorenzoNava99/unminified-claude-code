/**
 * Browser Safety Utilities (xl)
 *
 * Extracted from Claude Code CLI bundle.
 * Category: utilities
 *
 * Original location: Lines 40771-40825
 * Original name: xl
 * Size: 54 lines
 * Occurrences: Used by ValidationErrorExports
 *
 * Provides safe accessors for browser globals (window, document) and event listeners.
 * Returns null/undefined instead of throwing when run in server environments.
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var xl = createCommonJSModule(eD0 => {
  Object.defineProperty(eD0, "__esModule", {
    value: true
  });
  eD0._getCurrentPageUrlSafe = eD0._addDocumentEventListenerSafe = eD0._addWindowEventListenerSafe = eD0._isServerEnv = eD0._getDocumentSafe = eD0._getWindowSafe = undefined;
  var ZD9 = () => {
    if (typeof window !== "undefined") {
      return window;
    } else {
      return null;
    }
  };
  eD0._getWindowSafe = ZD9;
  var YD9 = () => {
    let B = eD0._getWindowSafe();
    return B?.document ?? null;
  };
  eD0._getDocumentSafe = YD9;
  var JD9 = () => {
    if (eD0._getDocumentSafe() !== null) {
      return false;
    }
    let A = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
    return typeof EdgeRuntime === "string" || A;
  };
  eD0._isServerEnv = JD9;
  var XD9 = (A, B) => {
    let Q = eD0._getWindowSafe();
    if (typeof Q?.addEventListener === "function") {
      Q.addEventListener(A, B);
    }
  };
  eD0._addWindowEventListenerSafe = XD9;
  var WD9 = (A, B) => {
    let Q = eD0._getDocumentSafe();
    if (typeof Q?.addEventListener === "function") {
      Q.addEventListener(A, B);
    }
  };
  eD0._addDocumentEventListenerSafe = WD9;
  var FD9 = () => {
    var A;
    try {
      if ((A = eD0._getWindowSafe()) === null || A === undefined) {
        return undefined;
      } else {
        return A.location.href.split(/[?#]/)[0];
      }
    } catch (B) {
      return;
    }
  };
  eD0._getCurrentPageUrlSafe = FD9;
});

// Export the module
export default xl;
export const browserSafetyUtils = xl;
