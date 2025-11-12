const Y = require(1);
function J() {}
const X = {};
const W = ["REJECTED"];
const F = ["FULFILLED"];
const C = ["PENDING"];
export default V;
function V(P) {
  if (typeof P !== "function") {
    throw TypeError("resolver must be a function");
  }
  this.state = C;
  this.queue = [];
  this.outcome = undefined;
  if (P !== J) {
    H(this, P);
  }
}
V.prototype.catch = function (P) {
  return this.then(null, P);
};
V.prototype.then = function (P, x) {
  if (
    (typeof P !== "function" && this.state === F) ||
    (typeof x !== "function" && this.state === W)
  ) {
    return this;
  }
  const f = new this.constructor(J);
  if (this.state !== C) {
    const _ = this.state === F ? P : x;
    D(f, _, this.outcome);
  } else {
    this.queue.push(new K(f, P, x));
  }
  return f;
};
function K(P, x, f) {
  this.promise = P;
  if (typeof x === "function") {
    this.onFulfilled = x;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof f === "function") {
    this.onRejected = f;
    this.callRejected = this.otherCallRejected;
  }
}
K.prototype.callFulfilled = function (P) {
  X.resolve(this.promise, P);
};
K.prototype.otherCallFulfilled = function (P) {
  D(this.promise, this.onFulfilled, P);
};
K.prototype.callRejected = function (P) {
  X.reject(this.promise, P);
};
K.prototype.otherCallRejected = function (P) {
  D(this.promise, this.onRejected, P);
};
function D(P, x, f) {
  Y(() => {
    let _;
    try {
      _ = x(f);
    } catch (i) {
      return X.reject(P, i);
    }
    if (_ === P) {
      X.reject(P, TypeError("Cannot resolve promise with itself"));
    } else {
      X.resolve(P, _);
    }
  });
}
X.resolve = (P, x) => {
  const f = U(E, x);
  if (f.status === "error") {
    return X.reject(P, f.value);
  }
  const _ = f.value;
  if (f.value) {
    H(P, f.value);
  } else {
    P.state = F;
    P.outcome = x;
    let i = -1;
    const g = P.queue.length;
    while (++i < P.queue.length) {
      P.queue[i].callFulfilled(x);
    }
  }
  return P;
};
X.reject = (P, x) => {
  P.state = W;
  P.outcome = x;
  let f = -1;
  const _ = P.queue.length;
  while (++f < P.queue.length) {
    P.queue[f].callRejected(x);
  }
  return P;
};
function E(P) {
  const x = P && P.then;
  if (
    P &&
    (typeof P === "object" || typeof P === "function") &&
    typeof x === "function"
  ) {
    return function (...args) {
      x.apply(P, args);
    };
  }
}
function H(P, x) {
  let f = false;
  function _(p) {
    if (f) {
      return;
    }
    f = true;
    X.reject(P, p);
  }
  function i(p) {
    if (f) {
      return;
    }
    f = true;
    X.resolve(P, p);
  }
  function g() {
    x(i, _);
  }
  const r = U(g);
  if (r.status === "error") {
    _(r.value);
  }
}
function U(P, x) {
  const f = {};
  try {
    f.value = P(x);
    f.status = "success";
  } catch (_) {
    f.status = "error";
    f.value = _;
  }
  return f;
}
V.resolve = L;
function L(P) {
  if (P instanceof this) {
    return P;
  }
  return X.resolve(new this(J), P);
}
V.reject = N;
function N(P) {
  const x = new this(J);
  return X.reject(x, P);
}
V.all = $;
function $(P) {
  const x = this;
  if (Object.prototype.toString.call(P) !== "[object Array]") {
    return this.reject(TypeError("must be an array"));
  }
  const f = P.length;
  let _ = false;
  if (!P.length) {
    return this.resolve([]);
  }
  const i = Array(P.length);
  let g = 0;
  let r = -1;
  const p = new this(J);
  while (++r < P.length) {
    y(P[r], r);
  }
  return p;
  function y(c, BA) {
    x.resolve(c).then(QA, (DA) => {
      if (!_) {
        _ = true;
        X.reject(p, DA);
      }
    });
    function QA(DA) {
      i[BA] = DA;
      if (++g === P.length && !_) {
        _ = true;
        X.resolve(p, i);
      }
    }
  }
}
V.race = R;
function R(P) {
  const x = this;
  if (Object.prototype.toString.call(P) !== "[object Array]") {
    return this.reject(TypeError("must be an array"));
  }
  const f = P.length;
  let _ = false;
  if (!P.length) {
    return this.resolve([]);
  }
  let i = -1;
  const g = new this(J);
  while (++i < P.length) {
    r(P[i]);
  }
  return g;
  function r(p) {
    x.resolve(p).then(
      (y) => {
        if (!_) {
          _ = true;
          X.resolve(g, y);
        }
      },
      (y) => {
        if (!_) {
          _ = true;
          X.reject(g, y);
        }
      },
    );
  }
}
