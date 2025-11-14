/**
 * PlatformNormalizerExports
 *
 * Extracted from Claude Code CLI bundle.
 * Category: platformUtils
 *
 * Original location: Lines 405894-405923
 * Size: 29 lines
 * Occurrences: 6
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var Mn1 = createCommonJSModule(PlatformNormalizerExports => {
  Object.defineProperty(PlatformNormalizerExports, "__esModule", {
    value: true
  });
  PlatformNormalizerExports.normalizeType = PlatformNormalizerExports.normalizeArch = undefined;
  var JM5 = A => {
    switch (A) {
      case "arm":
        return "arm32";
      case "ppc":
        return "ppc32";
      case "base64Utils":
        return "amd64";
      default:
        return A;
    }
  };
  PlatformNormalizerExports.normalizeArch = JM5;
  var XM5 = A => {
    switch (A) {
      case "sunos":
        return "solaris";
      case "win32":
        return "windows";
      default:
        return A;
    }
  };
  PlatformNormalizerExports.normalizeType = XM5;
});

// Export the module
export default Mn1;
export const PlatformNormalizerExports = Mn1;
