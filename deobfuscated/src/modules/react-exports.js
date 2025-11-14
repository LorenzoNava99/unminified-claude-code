/**
 * React Exports Module
 *
 * Extracted from Claude Code CLI bundle.
 * React 18.3.1 - Terminal rendering infrastructure
 *
 * Original location: Lines 25218-25667
 * Size: 450 lines
 */

import {
  createCommonJSModule,
  SymbolPrimitive as Symbol
} from '../runtime/module-system.js';

var VA = createCommonJSModule(ReactExports => {
  var KZA = Symbol.for("react.element");
  var CX9 = Symbol.for("react.portal");
  var VX9 = Symbol.for("react.fragment");
  var KX9 = Symbol.for("react.strict_mode");
  var DX9 = Symbol.for("react.profiler");
  var EX9 = Symbol.for("react.provider");
  var HX9 = Symbol.for("react.context");
  var zX9 = Symbol.for("react.forward_ref");
  var UX9 = Symbol.for("react.suspense");
  var wX9 = Symbol.for("react.memo");
  var $X9 = Symbol.for("react.lazy");
  var LF0 = Symbol.iterator;
  function qX9(A) {
    if (A === null || typeof A !== "object") {
      return null;
    }
    A = LF0 && A[LF0] || A["@@iterator"];
    if (typeof A === "function") {
      return A;
    } else {
      return null;
    }
  }
  var RF0 = {
    isMounted: function () {
      return false;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {}
  };
  var TF0 = Object.assign;
  var PF0 = {};
  function HAA(A, B, Q) {
    this.props = A;
    this.context = B;
    this.refs = PF0;
    this.updater = Q || RF0;
  }
  HAA.prototype.isReactComponent = {};
  HAA.prototype.setState = function (A, B) {
    if (typeof A !== "object" && typeof A !== "function" && A != null) {
      throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    }
    this.updater.enqueueSetState(this, A, B, "setState");
  };
  HAA.prototype.forceUpdate = function (A) {
    this.updater.enqueueForceUpdate(this, A, "forceUpdate");
  };
  function jF0() {}
  jF0.prototype = HAA.prototype;
  function w61(A, B, Q) {
    this.props = A;
    this.context = B;
    this.refs = PF0;
    this.updater = Q || RF0;
  }
  var $61 = w61.prototype = new jF0();
  $61.constructor = w61;
  TF0($61, HAA.prototype);
  $61.isPureReactComponent = true;
  var MF0 = Array.isArray;
  var SF0 = Object.prototype.hasOwnProperty;
  var q61 = {
    current: null
  };
  var yF0 = {
    key: true,
    ref: true,
    __self: true,
    __source: true
  };
  function kF0(A, B, Q) {
    var I;
    var G = {};
    var Z = null;
    var Y = null;
    if (B != null) {
      if (B.ref !== undefined) {
        Y = B.ref;
      }
      if (B.key !== undefined) {
        Z = "" + B.key;
      }
      for (I in B) {
        if (SF0.call(B, I) && !yF0.hasOwnProperty(I)) {
          G[I] = B[I];
        }
      }
    }
    var J = arguments.length - 2;
    if (J === 1) {
      G.children = Q;
    } else if (J > 1) {
      var X = Array(J);
      for (var W = 0; W < J; W++) {
        X[W] = arguments[W + 2];
      }
      G.children = X;
    }
    if (A && A.defaultProps) {
      J = A.defaultProps;
      for (I in J) {
        if (G[I] === undefined) {
          G[I] = J[I];
        }
      }
    }
    return {
      $$typeof: KZA,
      type: A,
      key: Z,
      ref: Y,
      props: G,
      _owner: q61.current
    };
  }
  function NX9(A, B) {
    return {
      $$typeof: KZA,
      type: A.type,
      key: B,
      ref: A.ref,
      props: A.props,
      _owner: A._owner
    };
  }
  function N61(A) {
    return typeof A === "object" && A !== null && A.$$typeof === KZA;
  }
  function LX9(A) {
    var B = {
      "=": "=0",
      ":": "=2"
    };
    return "$" + A.replace(/[=:]/g, function (Q) {
      return B[Q];
    });
  }
  var OF0 = /\/+/g;
  function U61(A, B) {
    if (typeof A === "object" && A !== null && A.key != null) {
      return LX9("" + A.key);
    } else {
      return B.toString(36);
    }
  }
  function oMA(A, B, Q, I, G) {
    var Z = typeof A;
    if (Z === "undefined" || Z === "boolean") {
      A = null;
    }
    var Y = false;
    if (A === null) {
      Y = true;
    } else {
      switch (Z) {
        case "string":
        case "number":
          Y = true;
          break;
        case "object":
          switch (A.$$typeof) {
            case KZA:
            case CX9:
              Y = true;
          }
      }
    }
    if (Y) {
      Y = A;
      G = G(Y);
      A = I === "" ? "." + U61(Y, 0) : I;
      if (MF0(G)) {
        Q = "";
        if (A != null) {
          Q = A.replace(OF0, "$&/") + "/";
        }
        oMA(G, B, Q, "", function (W) {
          return W;
        });
      } else if (G != null) {
        if (N61(G)) {
          G = NX9(G, Q + (!G.key || Y && Y.key === G.key ? "" : ("" + G.key).replace(OF0, "$&/") + "/") + A);
        }
        B.push(G);
      }
      return 1;
    }
    Y = 0;
    I = I === "" ? "." : I + ":";
    if (MF0(A)) {
      for (var J = 0; J < A.length; J++) {
        Z = A[J];
        var X = I + U61(Z, J);
        Y += oMA(Z, B, Q, X, G);
      }
    } else {
      X = qX9(A);
      if (typeof X === "function") {
        A = X.call(A);
        J = 0;
        while (!(Z = A.next()).done) {
          Z = Z.value;
          X = I + U61(Z, J++);
          Y += oMA(Z, B, Q, X, G);
        }
      } else if (Z === "object") {
        B = String(A);
        throw Error("Objects are not valid as a React child (found: " + (B === "[object Object]" ? "object with keys {" + Object.keys(A).join(", ") + "}" : B) + "). If you meant to render a collection of children, use an array instead.");
      }
    }
    return Y;
  }
  function rMA(A, B, Q) {
    if (A == null) {
      return A;
    }
    var I = [];
    var G = 0;
    oMA(A, I, "", "", function (Z) {
      return B.call(Q, Z, G++);
    });
    return I;
  }
  function MX9(A) {
    if (A._status === -1) {
      var B = A._result;
      B = B();
      B.then(function (Q) {
        if (A._status === 0 || A._status === -1) {
          A._status = 1;
          A._result = Q;
        }
      }, function (Q) {
        if (A._status === 0 || A._status === -1) {
          A._status = 2;
          A._result = Q;
        }
      });
      if (A._status === -1) {
        A._status = 0;
        A._result = B;
      }
    }
    if (A._status === 1) {
      return A._result.default;
    }
    throw A._result;
  }
  var WD = {
    current: null
  };
  var tMA = {
    transition: null
  };
  var OX9 = {
    ReactCurrentDispatcher: WD,
    ReactCurrentBatchConfig: tMA,
    ReactCurrentOwner: q61
  };
  function _F0() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  ReactExports.Children = {
    map: rMA,
    forEach: function (A, B, Q) {
      rMA(A, function () {
        B.apply(this, arguments);
      }, Q);
    },
    count: function (A) {
      var B = 0;
      rMA(A, function () {
        B++;
      });
      return B;
    },
    toArray: function (A) {
      return rMA(A, function (B) {
        return B;
      }) || [];
    },
    only: function (A) {
      if (!N61(A)) {
        throw Error("React.Children.only expected to receive a single React element child.");
      }
      return A;
    }
  };
  ReactExports.Component = HAA;
  ReactExports.Fragment = VX9;
  ReactExports.Profiler = DX9;
  ReactExports.PureComponent = w61;
  ReactExports.StrictMode = KX9;
  ReactExports.Suspense = UX9;
  ReactExports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = OX9;
  ReactExports.act = _F0;
  ReactExports.cloneElement = function (A, B, Q) {
    if (A === null || A === undefined) {
      throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + A + ".");
    }
    var I = TF0({}, A.props);
    var G = A.key;
    var Z = A.ref;
    var Y = A._owner;
    if (B != null) {
      if (B.ref !== undefined) {
        Z = B.ref;
        Y = q61.current;
      }
      if (B.key !== undefined) {
        G = "" + B.key;
      }
      if (A.type && A.type.defaultProps) {
        var J = A.type.defaultProps;
      }
      for (X in B) {
        if (SF0.call(B, X) && !yF0.hasOwnProperty(X)) {
          I[X] = B[X] === undefined && J !== undefined ? J[X] : B[X];
        }
      }
    }
    var X = arguments.length - 2;
    if (X === 1) {
      I.children = Q;
    } else if (X > 1) {
      J = Array(X);
      for (var W = 0; W < X; W++) {
        J[W] = arguments[W + 2];
      }
      I.children = J;
    }
    return {
      $$typeof: KZA,
      type: A.type,
      key: G,
      ref: Z,
      props: I,
      _owner: Y
    };
  };
  ReactExports.createContext = function (A) {
    A = {
      $$typeof: HX9,
      _currentValue: A,
      _currentValue2: A,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null
    };
    A.Provider = {
      $$typeof: EX9,
      _context: A
    };
    return A.Consumer = A;
  };
  ReactExports.createElement = kF0;
  ReactExports.createFactory = function (A) {
    var B = kF0.bind(null, A);
    B.type = A;
    return B;
  };
  ReactExports.createRef = function () {
    return {
      current: null
    };
  };
  ReactExports.forwardRef = function (A) {
    return {
      $$typeof: zX9,
      render: A
    };
  };
  ReactExports.isValidElement = N61;
  ReactExports.lazy = function (A) {
    return {
      $$typeof: $X9,
      _payload: {
        _status: -1,
        _result: A
      },
      _init: MX9
    };
  };
  ReactExports.memo = function (A, B) {
    return {
      $$typeof: wX9,
      type: A,
      compare: B === undefined ? null : B
    };
  };
  ReactExports.startTransition = function (A) {
    var B = tMA.transition;
    tMA.transition = {};
    try {
      A();
    } finally {
      tMA.transition = B;
    }
  };
  ReactExports.unstable_act = _F0;
  ReactExports.useCallback = function (A, B) {
    return WD.current.useCallback(A, B);
  };
  ReactExports.useContext = function (A) {
    return WD.current.useContext(A);
  };
  ReactExports.useDebugValue = function () {};
  ReactExports.useDeferredValue = function (A) {
    return WD.current.useDeferredValue(A);
  };
  ReactExports.useEffect = function (A, B) {
    return WD.current.useEffect(A, B);
  };
  ReactExports.useId = function () {
    return WD.current.useId();
  };
  ReactExports.useImperativeHandle = function (A, B, Q) {
    return WD.current.useImperativeHandle(A, B, Q);
  };
  ReactExports.useInsertionEffect = function (A, B) {
    return WD.current.useInsertionEffect(A, B);
  };
  ReactExports.useLayoutEffect = function (A, B) {
    return WD.current.useLayoutEffect(A, B);
  };
  ReactExports.useMemo = function (A, B) {
    return WD.current.useMemo(A, B);
  };
  ReactExports.useReducer = function (A, B, Q) {
    return WD.current.useReducer(A, B, Q);
  };
  ReactExports.useRef = function (A) {
    return WD.current.useRef(A);
  };
  ReactExports.useState = function (A) {
    return WD.current.useState(A);
  };
  ReactExports.useSyncExternalStore = function (A, B, Q) {
    return WD.current.useSyncExternalStore(A, B, Q);
  };
  ReactExports.useTransition = function () {
    return WD.current.useTransition();
  };
  ReactExports.version = "18.3.1";
});

// VA contains the React exports
export default VA;

// Named export for convenience
export const ReactExports = VA;
