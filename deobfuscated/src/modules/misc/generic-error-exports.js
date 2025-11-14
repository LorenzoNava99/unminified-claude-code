/**
 * GenericErrorExports
 *
 * Extracted from Claude Code CLI bundle.
 * Category: numberedClasses
 *
 * Original location: Lines 40825-40920
 * Size: 95 lines
 * Occurrences: 12
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var i51 = createCommonJSModule(GenericErrorExports => {
  Object.defineProperty(GenericErrorExports, "__esModule", {
    value: true
  });
  GenericErrorExports._createLayerParameterExposure = GenericErrorExports._createConfigExposure = GenericErrorExports._mapExposures = GenericErrorExports._createGateExposure = GenericErrorExports._isExposureEvent = undefined;
  var BE0 = "statsig::config_exposure";
  var QE0 = "statsig::gate_exposure";
  var IE0 = "statsig::layer_exposure";
  var l51 = (A, B, Q, I, G) => {
    if (Q.bootstrapMetadata) {
      I.bootstrapMetadata = Q.bootstrapMetadata;
    }
    return {
      eventName: A,
      user: B,
      value: null,
      metadata: UD9(Q, I),
      secondaryExposures: G,
      time: Date.now()
    };
  };
  var DD9 = ({
    eventName: A
  }) => {
    return A === QE0 || A === BE0 || A === IE0;
  };
  GenericErrorExports._isExposureEvent = DD9;
  var ED9 = (A, B, Q) => {
    let Y = {
      gate: B.name,
      gateValue: String(B.value),
      ruleID: B.ruleID
    };
    if (B.__evaluation?.version != null) {
      Y.configVersion = B.__evaluation.version;
    }
    return l51(QE0, A, B.details, Y, cOA(B.__evaluation?.secondary_exposures ?? [], Q));
  };
  GenericErrorExports._createGateExposure = ED9;
  function cOA(A, B) {
    return A.map(Q => {
      if (typeof Q === "string") {
        return (B ?? {})[Q];
      }
      return Q;
    }).filter(Q => Q != null);
  }
  GenericErrorExports._mapExposures = cOA;
  var HD9 = (A, B, Q) => {
    let J = {
      config: B.name,
      ruleID: B.ruleID
    };
    if (B.__evaluation?.version != null) {
      J.configVersion = B.__evaluation.version;
    }
    if (B.__evaluation?.passed != null) {
      J.rulePassed = String(B.__evaluation.passed);
    }
    return l51(BE0, A, B.details, J, cOA(B.__evaluation?.secondary_exposures ?? [], Q));
  };
  GenericErrorExports._createConfigExposure = HD9;
  var zD9 = (A, B, Q, I) => {
    var G;
    let X = B.__evaluation;
    let W = ((G = X?.explicit_parameters) === null || G === undefined ? undefined : G.includes(Q)) === true;
    let F = "";
    let C = X?.undelegated_secondary_exposures ?? [];
    if (W) {
      F = X.allocated_experiment_name ?? "";
      C = X.secondary_exposures;
    }
    let V = {
      config: B.name,
      parameterName: Q,
      ruleID: B.ruleID,
      allocatedExperiment: F,
      isExplicitParameter: String(W)
    };
    if (B.__evaluation?.version != null) {
      V.configVersion = B.__evaluation.version;
    }
    return l51(IE0, A, B.details, V, cOA(C, I));
  };
  GenericErrorExports._createLayerParameterExposure = zD9;
  var UD9 = (A, B) => {
    B.reason = A.reason;
    if (A.lcut) {
      B.lcut = String(A.lcut);
    }
    if (A.receivedAt) {
      B.receivedAt = String(A.receivedAt);
    }
    return B;
  };
});

// Export the module
export default i51;
export const GenericErrorExports = i51;
