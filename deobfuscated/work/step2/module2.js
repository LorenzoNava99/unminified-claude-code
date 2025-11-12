var Y = require(1);
function J() {
}
var X = {};
var W = ['REJECTED'];
var F = ['FULFILLED'];
var C = ['PENDING'];
module.exports = V;
function V(P) {
  if (typeof P !== 'function') {
    throw TypeError('resolver must be a function');
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
  if (typeof P !== 'function' && this.state === F || typeof x !== 'function' && this.state === W) {
    return this;
  }
  var f = new this.constructor(J);
  if (this.state !== C) {
    var _ = this.state === F ? P : x;
    D(f, _, this.outcome);
  } else {
    this.queue.push(new K(f, P, x));
  }
  return f;
};
function K(P, x, f) {
  this.promise = P;
  if (typeof x === 'function') {
    this.onFulfilled = x;
    this.callFulfilled = this.otherCallFulfilled;
  }
  if (typeof f === 'function') {
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
  Y(function () {
    var _;
    try {
      _ = x(f);
    } catch (i) {
      return X.reject(P, i);
    }
    if (_ === P) {
      X.reject(P, TypeError('Cannot resolve promise with itself'));
    } else {
      X.resolve(P, _);
    }
  });
}
X.resolve = function (P, x) {
  var f = U(E, x);
  if (f.status === 'error') {
    return X.reject(P, f.value);
  }
  var _ = f.value;
  if (f.value) {
    H(P, f.value);
  } else {
    P.state = F;
    P.outcome = x;
    var i = -1;
    var g = P.queue.length;
    while (++i < P.queue.length) {
      P.queue[i].callFulfilled(x);
    }
  }
  return P;
};
X.reject = function (P, x) {
  P.state = W;
  P.outcome = x;
  var f = -1;
  var _ = P.queue.length;
  while (++f < P.queue.length) {
    P.queue[f].callRejected(x);
  }
  return P;
};
function E(P) {
  var x = P && P.then;
  if (P && (typeof P === 'object' || typeof P === 'function') && typeof x === 'function') {
    return function () {
      x.apply(P, arguments);
    };
  }
}
function H(P, x) {
  var f = false;
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
  var r = U(g);
  if (r.status === 'error') {
    _(r.value);
  }
}
function U(P, x) {
  var f = {};
  try {
    f.value = P(x);
    f.status = 'success';
  } catch (_) {
    f.status = 'error';
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
  var x = new this(J);
  return X.reject(x, P);
}
V.all = $;
function $(P) {
  var x = this;
  if (Object.prototype.toString.call(P) !== '[object Array]') {
    return this.reject(TypeError('must be an array'));
  }
  var f = P.length;
  var _ = false;
  if (!P.length) {
    return this.resolve([]);
  }
  var i = Array(P.length);
  var g = 0;
  var r = -1;
  var p = new this(J);
  while (++r < P.length) {
    y(P[r], r);
  }
  return p;
  function y(c, BA) {
    x.resolve(c).then(QA, function (DA) {
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
  var x = this;
  if (Object.prototype.toString.call(P) !== '[object Array]') {
    return this.reject(TypeError('must be an array'));
  }
  var f = P.length;
  var _ = false;
  if (!P.length) {
    return this.resolve([]);
  }
  var i = -1;
  var g = new this(J);
  while (++i < P.length) {
    r(P[i]);
  }
  return g;
  function r(p) {
    x.resolve(p).then(function (y) {
      if (!_) {
        _ = true;
        X.resolve(g, y);
      }
    }, function (y) {
      if (!_) {
        _ = true;
        X.reject(g, y);
      }
    });
  }
}