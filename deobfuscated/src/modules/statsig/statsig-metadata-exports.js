/**
 * StatsigMetadataExports
 *
 * Extracted from Claude Code CLI bundle.
 * Category: statsig
 *
 * Original location: Lines 41401-41417
 * Size: 16 lines
 * Occurrences: 7
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var dZA = createCommonJSModule(StatsigMetadataExports => {
  Object.defineProperty(StatsigMetadataExports, "__esModule", {
    value: true
  });
  StatsigMetadataExports.StatsigMetadataProvider = StatsigMetadataExports.SDK_VERSION = undefined;
  StatsigMetadataExports.SDK_VERSION = "3.12.1";
  var BI1 = {
    sdkVersion: StatsigMetadataExports.SDK_VERSION,
    sdkType: "js-mono"
  };
  StatsigMetadataExports.StatsigMetadataProvider = {
    get: () => BI1,
    add: A => {
      BI1 = Object.assign(Object.assign({}, BI1), A);
    }
  };
});

// Export the module
export default dZA;
export const StatsigMetadataExports = dZA;
