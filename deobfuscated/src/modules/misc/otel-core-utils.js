/**
 * otelCoreUtils
 *
 * Extracted from Claude Code CLI bundle.
 * Category: numberedFunctions
 *
 * Original location: Lines 401099-401204
 * Size: 105 lines
 * Occurrences: 24
 */

import {
  createCommonJSModule,
  defineProperty
} from '../../runtime/module-system.js';

var tO = createCommonJSModule(otelCoreUtils => {
  Object.defineProperty(otelCoreUtils, "__esModule", {
    value: true
  });
  otelCoreUtils.equalsCaseInsensitive = otelCoreUtils.binarySearchUB = otelCoreUtils.setEquals = otelCoreUtils.FlatMap = otelCoreUtils.isPromiseAllSettledRejectionResult = otelCoreUtils.PromiseAllSettled = otelCoreUtils.callWithTimeout = otelCoreUtils.TimeoutError = otelCoreUtils.instrumentationScopeId = otelCoreUtils.hashAttributes = otelCoreUtils.isNotNullish = undefined;
  function ZX5(A) {
    return A !== undefined && A !== null;
  }
  otelCoreUtils.isNotNullish = ZX5;
  function YX5(A) {
    let B = Object.keys(A);
    if (B.length === 0) {
      return "";
    }
    B = B.sort();
    return JSON.stringify(B.map(Q => [Q, A[Q]]));
  }
  otelCoreUtils.hashAttributes = YX5;
  function JX5(A) {
    return `${A.name}:${A.version ?? ""}:${A.schemaUrl ?? ""}`;
  }
  otelCoreUtils.instrumentationScopeId = JX5;
  class _tA extends Error {
    constructor(A) {
      super(A);
      Object.setPrototypeOf(this, _tA.prototype);
    }
  }
  otelCoreUtils.TimeoutError = _tA;
  function XX5(A, B) {
    let Q;
    let I = new Promise(function (Z, Y) {
      Q = setTimeout(function () {
        Y(new _tA("Operation timed out."));
      }, B);
    });
    return Promise.race([A, I]).then(G => {
      clearTimeout(Q);
      return G;
    }, G => {
      clearTimeout(Q);
      throw G;
    });
  }
  otelCoreUtils.callWithTimeout = XX5;
  async function WX5(A) {
    return Promise.all(A.map(async B => {
      try {
        return {
          status: "fulfilled",
          value: await B
        };
      } catch (Q) {
        return {
          status: "rejected",
          reason: Q
        };
      }
    }));
  }
  otelCoreUtils.PromiseAllSettled = WX5;
  function FX5(A) {
    return A.status === "rejected";
  }
  otelCoreUtils.isPromiseAllSettledRejectionResult = FX5;
  function CX5(A, B) {
    let Q = [];
    A.forEach(I => {
      Q.push(...B(I));
    });
    return Q;
  }
  otelCoreUtils.FlatMap = CX5;
  function VX5(A, B) {
    if (A.size !== B.size) {
      return false;
    }
    for (let Q of A) {
      if (!B.has(Q)) {
        return false;
      }
    }
    return true;
  }
  otelCoreUtils.setEquals = VX5;
  function KX5(A, B) {
    let Q = 0;
    let I = A.length - 1;
    let G = A.length;
    while (I >= Q) {
      let Z = Q + Math.trunc((I - Q) / 2);
      if (A[Z] < B) {
        Q = Z + 1;
      } else {
        G = Z;
        I = Z - 1;
      }
    }
    return G;
  }
  otelCoreUtils.binarySearchUB = KX5;
  function DX5(A, B) {
    return A.toLowerCase() === B.toLowerCase();
  }
  otelCoreUtils.equalsCaseInsensitive = DX5;
});

// Export the module
export default tO;
export const otelCoreUtils = tO;
