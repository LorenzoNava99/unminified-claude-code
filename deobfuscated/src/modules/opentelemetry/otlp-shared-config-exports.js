/**
 * OtlpSharedConfigExports
 *
 * Extracted from Claude Code CLI bundle.
 * Category: opentelemetryExtended
 *
 * Original location: Lines 407697-407732
 * Size: 35 lines
 * Occurrences: 10
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var rzA = createCommonJSModule(OtlpSharedConfigExports => {
  Object.defineProperty(OtlpSharedConfigExports, "__esModule", {
    value: true
  });
  OtlpSharedConfigExports.getSharedConfigurationDefaults = OtlpSharedConfigExports.mergeOtlpSharedConfigurationWithDefaults = OtlpSharedConfigExports.wrapStaticHeadersInFunction = OtlpSharedConfigExports.validateTimeoutMillis = undefined;
  function GC2(A) {
    if (Number.isFinite(A) && A > 0) {
      return A;
    }
    throw Error(`Configuration: timeoutMillis is invalid, expected number greater than 0 (actual: '${A}')`);
  }
  OtlpSharedConfigExports.validateTimeoutMillis = GC2;
  function WR5(A) {
    if (A == null) {
      return;
    }
    return () => A;
  }
  OtlpSharedConfigExports.wrapStaticHeadersInFunction = WR5;
  function FR5(A, B, Q) {
    return {
      timeoutMillis: GC2(A.timeoutMillis ?? B.timeoutMillis ?? Q.timeoutMillis),
      concurrencyLimit: A.concurrencyLimit ?? B.concurrencyLimit ?? Q.concurrencyLimit,
      compression: A.compression ?? B.compression ?? Q.compression
    };
  }
  OtlpSharedConfigExports.mergeOtlpSharedConfigurationWithDefaults = FR5;
  function CR5() {
    return {
      timeoutMillis: 10000,
      concurrencyLimit: 30,
      compression: "none"
    };
  }
  OtlpSharedConfigExports.getSharedConfigurationDefaults = CR5;
});

// Export the module
export default rzA;
export const OtlpSharedConfigExports = rzA;
