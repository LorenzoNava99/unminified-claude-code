const Y =
  typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
    ? (mA) => {
        return typeof mA;
      }
    : (mA) => {
        if (
          mA &&
          typeof Symbol === "function" &&
          mA.constructor === Symbol &&
          mA !== Symbol.prototype
        ) {
          return "symbol";
        } else {
          return typeof mA;
        }
      };
function J(mA, ZA) {
  if (!(mA instanceof ZA)) {
    throw TypeError("Cannot call a class as a function");
  }
}
function X() {
  try {
    if (typeof indexedDB !== "undefined") {
      return indexedDB;
    }
    if (typeof webkitIndexedDB !== "undefined") {
      return webkitIndexedDB;
    }
    if (typeof mozIndexedDB !== "undefined") {
      return mozIndexedDB;
    }
    if (typeof OIndexedDB !== "undefined") {
      return OIndexedDB;
    }
    if (typeof msIndexedDB !== "undefined") {
      return msIndexedDB;
    }
  } catch (mA) {
    return;
  }
}
const W = X();
function F() {
  try {
    if (!W || !W.open) {
      return false;
    }
    const mA =
      typeof openDatabase !== "undefined" &&
      /(Safari|iPhone|iPad|iPod)/.test(navigator.userAgent) &&
      !/Chrome/.test(navigator.userAgent) &&
      !/BlackBerry/.test(navigator.platform);
    const ZA =
      typeof fetch === "function" &&
      fetch.toString().indexOf("[native code") !== -1;
    return (
      (!mA || ZA) &&
      typeof indexedDB !== "undefined" &&
      typeof IDBKeyRange !== "undefined"
    );
  } catch (e) {
    return false;
  }
}
function C(mA = [], ZA = {}) {
  try {
    return new Blob(mA, ZA);
  } catch (hA) {
    if (hA.name !== "TypeError") {
      throw hA;
    }
    const e =
      typeof BlobBuilder !== "undefined"
        ? BlobBuilder
        : typeof MSBlobBuilder !== "undefined"
          ? MSBlobBuilder
          : typeof MozBlobBuilder !== "undefined"
            ? MozBlobBuilder
            : WebKitBlobBuilder;
    const MA = new e();
    for (let _A = 0; _A < mA.length; _A += 1) {
      MA.append(mA[_A]);
    }
    return MA.getBlob(ZA.type);
  }
}
if (typeof Promise === "undefined") {
  require(3);
}
function K(mA, ZA) {
  if (ZA) {
    mA.then(
      (e) => {
        ZA(null, e);
      },
      (e) => {
        ZA(e);
      },
    );
  }
}
function D(mA, ZA, e) {
  if (typeof ZA === "function") {
    mA.then(ZA);
  }
  if (typeof e === "function") {
    mA.catch(e);
  }
}
function E(mA) {
  if (typeof mA !== "string") {
    console.warn(`${mA} used as a key, but it is not a string.`);
    mA = String(mA);
  }
  return mA;
}
function H(...args) {
  if (args.length && typeof args[args.length - 1] === "function") {
    return args[args.length - 1];
  }
}
const U = "local-forage-detect-blob-support";
let L = undefined;
const N = {};
const $ = Object.prototype.toString;
const R = "readonly";
const P = "readwrite";
function x(mA) {
  const ZA = mA.length;
  const e = new ArrayBuffer(mA.length);
  const MA = new Uint8Array(e);
  for (let _A = 0; _A < mA.length; _A++) {
    MA[_A] = mA.charCodeAt(_A);
  }
  return e;
}
function f(mA) {
  return new Promise((ZA) => {
    const e = mA.transaction("local-forage-detect-blob-support", "readwrite");
    const MA = C([""]);
    e.objectStore("local-forage-detect-blob-support").put(MA, "key");
    e.onabort = (_A) => {
      _A.preventDefault();
      _A.stopPropagation();
      ZA(false);
    };
    e.oncomplete = () => {
      const _A = navigator.userAgent.match(/Chrome\/(\d+)/);
      const hA = navigator.userAgent.match(/Edge\//);
      ZA(hA || !_A || parseInt(_A[1], 10) >= 43);
    };
  }).catch(() => {
    return false;
  });
}
function _(mA) {
  if (typeof L === "boolean") {
    return Promise.resolve(L);
  }
  return f(mA).then((ZA) => {
    L = ZA;
    return L;
  });
}
function i(mA) {
  const ZA = N[mA.name];
  const e = {};
  e.promise = new Promise((MA, _A) => {
    e.resolve = MA;
    e.reject = _A;
  });
  ZA.deferredOperations.push(e);
  if (!ZA.dbReady) {
    ZA.dbReady = e.promise;
  } else {
    ZA.dbReady = ZA.dbReady.then(() => {
      return e.promise;
    });
  }
}
function g(mA) {
  const ZA = N[mA.name];
  const e = ZA.deferredOperations.pop();
  if (e) {
    e.resolve();
    return e.promise;
  }
}
function r(mA, ZA) {
  const e = N[mA.name];
  const MA = e.deferredOperations.pop();
  if (MA) {
    MA.reject(ZA);
    return MA.promise;
  }
}
function p(mA, ZA) {
  return new Promise((e, MA) => {
    N[mA.name] = N[mA.name] || zA();
    if (mA.db) {
      if (ZA) {
        i(mA);
        mA.db.close();
      } else {
        return e(mA.db);
      }
    }
    const _A = [mA.name];
    if (ZA) {
      _A.push(mA.version);
    }
    const hA = W.open.apply(W, _A);
    if (ZA) {
      hA.onupgradeneeded = (D1) => {
        const T1 = hA.result;
        try {
          hA.result.createObjectStore(mA.storeName);
          if (D1.oldVersion <= 1) {
            hA.result.createObjectStore("local-forage-detect-blob-support");
          }
        } catch (O1) {
          if (O1.name === "ConstraintError") {
            console.warn(
              `The database "${mA.name}" has been upgraded from version ${D1.oldVersion} to version ${D1.newVersion}, but the storage "${mA.storeName}" already exists.`,
            );
          } else {
            throw O1;
          }
        }
      };
    }
    hA.onerror = (D1) => {
      D1.preventDefault();
      MA(hA.error);
    };
    hA.onsuccess = () => {
      const D1 = hA.result;
      D1.onversionchange = (T1) => {
        T1.target.close();
      };
      e(D1);
      g(mA);
    };
  });
}
function y(mA) {
  return p(mA, false);
}
function c(mA) {
  return p(mA, true);
}
function BA(mA, ZA) {
  if (!mA.db) {
    return true;
  }
  const e = !mA.db.objectStoreNames.contains(mA.storeName);
  const MA = mA.version < mA.db.version;
  const _A = mA.version > mA.db.version;
  if (MA) {
    if (mA.version !== ZA) {
      console.warn(
        `${`The database "${mA.name}`}" can't be downgraded from version ${mA.db.version} to version ${mA.version}.`,
      );
    }
    mA.version = mA.db.version;
  }
  if (_A || e) {
    if (e) {
      const hA = mA.db.version + 1;
      if (hA > mA.version) {
        mA.version = hA;
      }
    }
    return true;
  }
  return false;
}
function QA(mA) {
  return new Promise((ZA, e) => {
    const MA = new FileReader();
    MA.onerror = e;
    MA.onloadend = (_A) => {
      const hA = btoa(_A.target.result || "");
      ZA({
        __local_forage_encoded_blob: true,
        data: hA,
        type: mA.type,
      });
    };
    MA.readAsBinaryString(mA);
  });
}
function DA(mA) {
  const ZA = x(atob(mA.data));
  return C([ZA], { type: mA.type });
}
function WA(mA) {
  return mA && mA.__local_forage_encoded_blob;
}
function RA(mA) {
  const ZA = this;
  const e = ZA._initReady().then(() => {
    const MA = N[ZA._dbInfo.name];
    if (MA && MA.dbReady) {
      return MA.dbReady;
    }
  });
  D(e, mA, mA);
  return e;
}
function PA(mA) {
  i(mA);
  const ZA = N[mA.name];
  const e = ZA.forages;
  for (let MA = 0; MA < ZA.forages.length; MA++) {
    const _A = ZA.forages[MA];
    if (ZA.forages[MA]._dbInfo.db) {
      ZA.forages[MA]._dbInfo.db.close();
      ZA.forages[MA]._dbInfo.db = null;
    }
  }
  mA.db = null;
  return y(mA)
    .then((hA) => {
      mA.db = hA;
      if (BA(mA)) {
        return c(mA);
      }
      return hA;
    })
    .then((hA) => {
      mA.db = ZA.db = hA;
      for (let D1 = 0; D1 < ZA.forages.length; D1++) {
        ZA.forages[D1]._dbInfo.db = hA;
      }
    })
    .catch((hA) => {
      r(mA, hA);
      throw hA;
    });
}
function tA(mA, ZA, e, MA = 1) {
  try {
    const _A = mA.db.transaction(mA.storeName, ZA);
    e(null, _A);
  } catch (hA) {
    if (
      MA > 0 &&
      (!mA.db || hA.name === "InvalidStateError" || hA.name === "NotFoundError")
    ) {
      return Promise.resolve()
        .then(() => {
          if (
            !mA.db ||
            (hA.name === "NotFoundError" &&
              !mA.db.objectStoreNames.contains(mA.storeName) &&
              mA.version <= mA.db.version)
          ) {
            if (mA.db) {
              mA.version = mA.db.version + 1;
            }
            return c(mA);
          }
        })
        .then(() => {
          return PA(mA).then(() => {
            tA(mA, ZA, e, MA - 1);
          });
        })
        .catch(e);
    }
    e(hA);
  }
}
function zA() {
  return {
    forages: [],
    db: null,
    dbReady: null,
    deferredOperations: [],
  };
}
function yA(mA) {
  const ZA = this;
  const e = { db: null };
  if (mA) {
    for (const MA in mA) {
      e[MA] = mA[MA];
    }
  }
  let _A = N[e.name];
  if (!_A) {
    _A = zA();
    N[e.name] = _A;
  }
  _A.forages.push(ZA);
  if (!ZA._initReady) {
    ZA._initReady = ZA.ready;
    ZA.ready = RA;
  }
  const hA = [];
  function D1() {
    return Promise.resolve();
  }
  for (let T1 = 0; T1 < _A.forages.length; T1++) {
    const O1 = _A.forages[T1];
    if (_A.forages[T1] !== ZA) {
      hA.push(_A.forages[T1]._initReady().catch(D1));
    }
  }
  const _1 = _A.forages.slice(0);
  return Promise.all(hA)
    .then(() => {
      e.db = _A.db;
      return y(e);
    })
    .then((h1) => {
      e.db = h1;
      if (BA(e, ZA._defaultConfig.version)) {
        return c(e);
      }
      return h1;
    })
    .then((h1) => {
      e.db = _A.db = h1;
      ZA._dbInfo = e;
      for (let Q0 = 0; Q0 < _1.length; Q0++) {
        const d0 = _1[Q0];
        if (_1[Q0] !== ZA) {
          _1[Q0]._dbInfo.db = e.db;
          _1[Q0]._dbInfo.version = e.version;
        }
      }
    });
}
function EA(mA, ZA) {
  const e = this;
  mA = E(mA);
  const MA = new Promise((_A, hA) => {
    e.ready()
      .then(() => {
        tA(e._dbInfo, "readonly", (D1, T1) => {
          if (D1) {
            return hA(D1);
          }
          try {
            const O1 = T1.objectStore(e._dbInfo.storeName);
            const _1 = O1.get(mA);
            _1.onsuccess = () => {
              let h1 = _1.result;
              if (h1 === undefined) {
                h1 = null;
              }
              if (WA(h1)) {
                h1 = DA(h1);
              }
              _A(h1);
            };
            _1.onerror = () => {
              hA(_1.error);
            };
          } catch (h1) {
            hA(h1);
          }
        });
      })
      .catch(hA);
  });
  K(MA, ZA);
  return MA;
}
function kA(mA, ZA) {
  const e = this;
  const MA = new Promise((_A, hA) => {
    e.ready()
      .then(() => {
        tA(e._dbInfo, "readonly", (D1, T1) => {
          if (D1) {
            return hA(D1);
          }
          try {
            const O1 = T1.objectStore(e._dbInfo.storeName);
            const _1 = O1.openCursor();
            let h1 = 1;
            _1.onsuccess = () => {
              const Q0 = _1.result;
              if (_1.result) {
                let d0 = _1.result.value;
                if (WA(d0)) {
                  d0 = DA(d0);
                }
                const _B = mA(d0, _1.result.key, h1++);
                if (_B !== undefined) {
                  _A(_B);
                } else {
                  _1.result.continue();
                }
              } else {
                _A();
              }
            };
            _1.onerror = () => {
              hA(_1.error);
            };
          } catch (Q0) {
            hA(Q0);
          }
        });
      })
      .catch(hA);
  });
  K(MA, ZA);
  return MA;
}
function sA(mA, ZA, e) {
  const MA = this;
  mA = E(mA);
  const _A = new Promise((hA, D1) => {
    let T1;
    MA.ready()
      .then(() => {
        T1 = MA._dbInfo;
        if (Object.prototype.toString.call(ZA) === "[object Blob]") {
          return _(T1.db).then((O1) => {
            if (O1) {
              return ZA;
            }
            return QA(ZA);
          });
        }
        return ZA;
      })
      .then((O1) => {
        tA(MA._dbInfo, "readwrite", (_1, h1) => {
          if (_1) {
            return D1(_1);
          }
          try {
            const Q0 = h1.objectStore(MA._dbInfo.storeName);
            if (O1 === null) {
              O1 = undefined;
            }
            const d0 = Q0.put(O1, mA);
            h1.oncomplete = () => {
              if (O1 === undefined) {
                O1 = null;
              }
              hA(O1);
            };
            h1.onabort = h1.onerror = () => {
              const _B = d0.error ? d0.error : d0.transaction.error;
              D1(_B);
            };
          } catch (_B) {
            D1(_B);
          }
        });
      })
      .catch(D1);
  });
  K(_A, e);
  return _A;
}
function K1(mA, ZA) {
  const e = this;
  mA = E(mA);
  const MA = new Promise((_A, hA) => {
    e.ready()
      .then(() => {
        tA(e._dbInfo, "readwrite", (D1, T1) => {
          if (D1) {
            return hA(D1);
          }
          try {
            const O1 = T1.objectStore(e._dbInfo.storeName);
            const _1 = O1.delete(mA);
            T1.oncomplete = () => {
              _A();
            };
            T1.onerror = () => {
              hA(_1.error);
            };
            T1.onabort = () => {
              const h1 = _1.error ? _1.error : _1.transaction.error;
              hA(h1);
            };
          } catch (h1) {
            hA(h1);
          }
        });
      })
      .catch(hA);
  });
  K(MA, ZA);
  return MA;
}
function JA(mA) {
  const ZA = this;
  const e = new Promise((MA, _A) => {
    ZA.ready()
      .then(() => {
        tA(ZA._dbInfo, "readwrite", (hA, D1) => {
          if (hA) {
            return _A(hA);
          }
          try {
            const T1 = D1.objectStore(ZA._dbInfo.storeName);
            const O1 = T1.clear();
            D1.oncomplete = () => {
              MA();
            };
            D1.onabort = D1.onerror = () => {
              const _1 = O1.error ? O1.error : O1.transaction.error;
              _A(_1);
            };
          } catch (_1) {
            _A(_1);
          }
        });
      })
      .catch(_A);
  });
  K(e, mA);
  return e;
}
function KA(mA) {
  const ZA = this;
  const e = new Promise((MA, _A) => {
    ZA.ready()
      .then(() => {
        tA(ZA._dbInfo, "readonly", (hA, D1) => {
          if (hA) {
            return _A(hA);
          }
          try {
            const T1 = D1.objectStore(ZA._dbInfo.storeName);
            const O1 = T1.count();
            O1.onsuccess = () => {
              MA(O1.result);
            };
            O1.onerror = () => {
              _A(O1.error);
            };
          } catch (_1) {
            _A(_1);
          }
        });
      })
      .catch(_A);
  });
  K(e, mA);
  return e;
}
function $A(mA, ZA) {
  const e = this;
  const MA = new Promise((_A, hA) => {
    if (mA < 0) {
      _A(null);
      return;
    }
    e.ready()
      .then(() => {
        tA(e._dbInfo, "readonly", (D1, T1) => {
          if (D1) {
            return hA(D1);
          }
          try {
            const O1 = T1.objectStore(e._dbInfo.storeName);
            let _1 = false;
            const h1 = O1.openKeyCursor();
            h1.onsuccess = () => {
              const Q0 = h1.result;
              if (!h1.result) {
                _A(null);
                return;
              }
              if (mA === 0) {
                _A(h1.result.key);
              } else if (!_1) {
                _1 = true;
                h1.result.advance(mA);
              } else {
                _A(h1.result.key);
              }
            };
            h1.onerror = () => {
              hA(h1.error);
            };
          } catch (Q0) {
            hA(Q0);
          }
        });
      })
      .catch(hA);
  });
  K(MA, ZA);
  return MA;
}
function wA(mA) {
  const ZA = this;
  const e = new Promise((MA, _A) => {
    ZA.ready()
      .then(() => {
        tA(ZA._dbInfo, "readonly", (hA, D1) => {
          if (hA) {
            return _A(hA);
          }
          try {
            const T1 = D1.objectStore(ZA._dbInfo.storeName);
            const O1 = T1.openKeyCursor();
            const _1 = [];
            O1.onsuccess = () => {
              const h1 = O1.result;
              if (!O1.result) {
                MA(_1);
                return;
              }
              _1.push(O1.result.key);
              O1.result.continue();
            };
            O1.onerror = () => {
              _A(O1.error);
            };
          } catch (h1) {
            _A(h1);
          }
        });
      })
      .catch(_A);
  });
  K(e, mA);
  return e;
}
function LA(mA, ZA) {
  ZA = H();
  const e = this.config();
  mA = (typeof mA !== "function" && mA) || {};
  if (!mA.name) {
    mA.name = mA.name || e.name;
    mA.storeName = mA.storeName || e.storeName;
  }
  const MA = this;
  let _A;
  if (!mA.name) {
    _A = Promise.reject("Invalid arguments");
  } else {
    const hA = mA.name === e.name && MA._dbInfo.db;
    const D1 = hA
      ? Promise.resolve(MA._dbInfo.db)
      : y(mA).then((T1) => {
          const O1 = N[mA.name];
          const _1 = O1.forages;
          O1.db = T1;
          for (let h1 = 0; h1 < O1.forages.length; h1++) {
            O1.forages[h1]._dbInfo.db = T1;
          }
          return T1;
        });
    if (!mA.storeName) {
      _A = D1.then((T1) => {
        i(mA);
        const O1 = N[mA.name];
        const _1 = O1.forages;
        T1.close();
        for (let h1 = 0; h1 < O1.forages.length; h1++) {
          const Q0 = O1.forages[h1];
          O1.forages[h1]._dbInfo.db = null;
        }
        const d0 = new Promise((_B, MQ) => {
          const GQ = W.deleteDatabase(mA.name);
          GQ.onerror = () => {
            const T2 = GQ.result;
            if (GQ.result) {
              GQ.result.close();
            }
            MQ(GQ.error);
          };
          GQ.onblocked = () => {
            console.warn(
              `dropInstance blocked for database "${mA.name}" until all open connections are closed`,
            );
          };
          GQ.onsuccess = () => {
            const T2 = GQ.result;
            if (GQ.result) {
              GQ.result.close();
            }
            _B(GQ.result);
          };
        });
        return d0
          .then((_B) => {
            O1.db = _B;
            for (let MQ = 0; MQ < O1.forages.length; MQ++) {
              const GQ = O1.forages[MQ];
              g(O1.forages[MQ]._dbInfo);
            }
          })
          .catch((_B) => {
            (r(mA, _B) || Promise.resolve()).catch(() => {});
            throw _B;
          });
      });
    } else {
      _A = D1.then((T1) => {
        if (!T1.objectStoreNames.contains(mA.storeName)) {
          return;
        }
        const O1 = T1.version + 1;
        i(mA);
        const _1 = N[mA.name];
        const h1 = _1.forages;
        T1.close();
        for (let Q0 = 0; Q0 < _1.forages.length; Q0++) {
          const d0 = _1.forages[Q0];
          _1.forages[Q0]._dbInfo.db = null;
          _1.forages[Q0]._dbInfo.version = O1;
        }
        const _B = new Promise((MQ, GQ) => {
          const T2 = W.open(mA.name, O1);
          T2.onerror = (e4) => {
            const a6 = T2.result;
            T2.result.close();
            GQ(e4);
          };
          T2.onupgradeneeded = () => {
            const e4 = T2.result;
            T2.result.deleteObjectStore(mA.storeName);
          };
          T2.onsuccess = () => {
            const e4 = T2.result;
            T2.result.close();
            MQ(T2.result);
          };
        });
        return _B
          .then((MQ) => {
            _1.db = MQ;
            for (let GQ = 0; GQ < _1.forages.length; GQ++) {
              const T2 = _1.forages[GQ];
              _1.forages[GQ]._dbInfo.db = MQ;
              g(_1.forages[GQ]._dbInfo);
            }
          })
          .catch((MQ) => {
            (r(mA, MQ) || Promise.resolve()).catch(() => {});
            throw MQ;
          });
      });
    }
  }
  K(_A, ZA);
  return _A;
}
const OA = {
  _driver: "asyncStorage",
  _initStorage: yA,
  _support: F(),
  iterate: kA,
  getItem: EA,
  setItem: sA,
  removeItem: K1,
  clear: JA,
  length: KA,
  key: $A,
  keys: wA,
  dropInstance: LA,
};
function eA() {
  return typeof openDatabase === "function";
}
const iA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const J1 = "~~local_forage_type~";
const $1 = /^~~local_forage_type~([^~]+)~/;
const TA = "__lfsc__:";
const B1 = 9;
const i1 = "arbf";
const G1 = "blob";
const t1 = "si08";
const x0 = "ui08";
const P0 = "uic8";
const n0 = "si16";
const s0 = "si32";
const H0 = "ur16";
const X1 = "ui32";
const w1 = "fl32";
const v1 = "fl64";
const u1 = 13;
const D0 = Object.prototype.toString;
function C0(mA) {
  let ZA = mA.length * 0.75;
  const e = mA.length;
  let MA;
  let _A = 0;
  let hA;
  let D1;
  let T1;
  let O1;
  if (mA[mA.length - 1] === "=") {
    ZA--;
    if (mA[mA.length - 2] === "=") {
      ZA--;
    }
  }
  const _1 = new ArrayBuffer(ZA);
  const h1 = new Uint8Array(_1);
  for (MA = 0; MA < mA.length; MA += 4) {
    hA =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(
        mA[MA],
      );
    D1 =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(
        mA[MA + 1],
      );
    T1 =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(
        mA[MA + 2],
      );
    O1 =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(
        mA[MA + 3],
      );
    h1[_A++] = (hA << 2) | (D1 >> 4);
    h1[_A++] = ((D1 & 15) << 4) | (T1 >> 2);
    h1[_A++] = ((T1 & 3) << 6) | (O1 & 63);
  }
  return _1;
}
function t0(mA) {
  const ZA = new Uint8Array(mA);
  let e = "";
  let MA;
  for (MA = 0; MA < ZA.length; MA += 3) {
    e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[
      ZA[MA] >> 2
    ];
    e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[
      ((ZA[MA] & 3) << 4) | (ZA[MA + 1] >> 4)
    ];
    e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[
      ((ZA[MA + 1] & 15) << 2) | (ZA[MA + 2] >> 6)
    ];
    e += "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"[
      ZA[MA + 2] & 63
    ];
  }
  if (ZA.length % 3 === 2) {
    e = `${e.substring(0, e.length - 1)}=`;
  } else if (ZA.length % 3 === 1) {
    e = `${e.substring(0, e.length - 2)}==`;
  }
  return e;
}
function GB(mA, ZA) {
  let e = "";
  if (mA) {
    e = Object.prototype.toString.call(mA);
  }
  if (
    mA &&
    (e === "[object ArrayBuffer]" ||
      (mA.buffer &&
        Object.prototype.toString.call(mA.buffer) === "[object ArrayBuffer]"))
  ) {
    let MA;
    let _A = "__lfsc__:";
    if (mA instanceof ArrayBuffer) {
      MA = mA;
      _A += "arbf";
    } else {
      MA = mA.buffer;
      if (e === "[object Int8Array]") {
        _A += "si08";
      } else if (e === "[object Uint8Array]") {
        _A += "ui08";
      } else if (e === "[object Uint8ClampedArray]") {
        _A += "uic8";
      } else if (e === "[object Int16Array]") {
        _A += "si16";
      } else if (e === "[object Uint16Array]") {
        _A += "ur16";
      } else if (e === "[object Int32Array]") {
        _A += "si32";
      } else if (e === "[object Uint32Array]") {
        _A += "ui32";
      } else if (e === "[object Float32Array]") {
        _A += "fl32";
      } else if (e === "[object Float64Array]") {
        _A += "fl64";
      } else {
        ZA(Error("Failed to get type for BinaryArray"));
      }
    }
    ZA(_A + t0(MA));
  } else if (e === "[object Blob]") {
    const hA = new FileReader();
    hA.onload = function () {
      const D1 = `~~local_forage_type~${mA.type}~${t0(this.result)}`;
      ZA(`__lfsc__:blob${D1}`);
    };
    hA.readAsArrayBuffer(mA);
  } else {
    try {
      ZA(JSON.stringify(mA));
    } catch (D1) {
      console.error("Couldn't convert value into a JSON string: ", mA);
      ZA(null, D1);
    }
  }
}
function $Q(mA) {
  if (mA.substring(0, 9) !== "__lfsc__:") {
    return JSON.parse(mA);
  }
  let ZA = mA.substring(13);
  const e = mA.substring(9, 13);
  let MA;
  if (e === "blob" && /^~~local_forage_type~([^~]+)~/.test(ZA)) {
    const _A = ZA.match(/^~~local_forage_type~([^~]+)~/);
    MA = _A[1];
    ZA = ZA.substring(_A[0].length);
  }
  const hA = C0(ZA);
  switch (e) {
    case "arbf":
      return hA;
    case "blob":
      return C([hA], { type: MA });
    case "si08":
      return new Int8Array(hA);
    case "ui08":
      return new Uint8Array(hA);
    case "uic8":
      return new Uint8ClampedArray(hA);
    case "si16":
      return new Int16Array(hA);
    case "ur16":
      return new Uint16Array(hA);
    case "si32":
      return new Int32Array(hA);
    case "ui32":
      return new Uint32Array(hA);
    case "fl32":
      return new Float32Array(hA);
    case "fl64":
      return new Float64Array(hA);
    default:
      throw Error(`Unkown type: ${e}`);
  }
}
const cQ = {
  serialize: GB,
  deserialize: $Q,
  stringToBuffer: C0,
  bufferToString: t0,
};
function V2(mA, ZA, e, MA) {
  mA.executeSql(
    `CREATE TABLE IF NOT EXISTS ${ZA.storeName} (id INTEGER PRIMARY KEY, key unique, value)`,
    [],
    e,
    MA,
  );
}
function m0(mA) {
  const ZA = this;
  const e = { db: null };
  if (mA) {
    for (const MA in mA) {
      e[MA] = typeof mA[MA] !== "string" ? mA[MA].toString() : mA[MA];
    }
  }
  const _A = new Promise((hA, D1) => {
    try {
      e.db = openDatabase(e.name, String(e.version), e.description, e.size);
    } catch (T1) {
      return D1(T1);
    }
    e.db.transaction((T1) => {
      V2(
        T1,
        e,
        () => {
          ZA._dbInfo = e;
          hA();
        },
        (O1, _1) => {
          D1(_1);
        },
      );
    }, D1);
  });
  e.serializer = cQ;
  return _A;
}
function p2(mA, ZA, e, MA, _A, hA) {
  mA.executeSql(
    e,
    MA,
    _A,
    (D1, T1) => {
      if (T1.code === T1.SYNTAX_ERR) {
        D1.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name = ?",
          [ZA.storeName],
          (O1, _1) => {
            if (!_1.rows.length) {
              V2(
                O1,
                ZA,
                () => {
                  O1.executeSql(e, MA, _A, hA);
                },
                hA,
              );
            } else {
              hA(O1, T1);
            }
          },
          hA,
        );
      } else {
        hA(D1, T1);
      }
    },
    hA,
  );
}
function Z8(mA, ZA) {
  const e = this;
  mA = E(mA);
  const MA = new Promise((_A, hA) => {
    e.ready()
      .then(() => {
        const D1 = e._dbInfo;
        e._dbInfo.db.transaction((T1) => {
          p2(
            T1,
            e._dbInfo,
            `SELECT * FROM ${e._dbInfo.storeName} WHERE key = ? LIMIT 1`,
            [mA],
            (O1, _1) => {
              let h1 = _1.rows.length ? _1.rows.item(0).value : null;
              if (h1) {
                h1 = e._dbInfo.serializer.deserialize(h1);
              }
              _A(h1);
            },
            (O1, _1) => {
              hA(_1);
            },
          );
        });
      })
      .catch(hA);
  });
  K(MA, ZA);
  return MA;
}
function qI(mA, ZA) {
  const e = this;
  const MA = new Promise((_A, hA) => {
    e.ready()
      .then(() => {
        const D1 = e._dbInfo;
        e._dbInfo.db.transaction((T1) => {
          p2(
            T1,
            e._dbInfo,
            `SELECT * FROM ${e._dbInfo.storeName}`,
            [],
            (O1, _1) => {
              const h1 = _1.rows;
              const Q0 = _1.rows.length;
              for (let d0 = 0; d0 < _1.rows.length; d0++) {
                const _B = _1.rows.item(d0);
                let MQ = _B.value;
                if (MQ) {
                  MQ = e._dbInfo.serializer.deserialize(MQ);
                }
                MQ = mA(MQ, _B.key, d0 + 1);
                if (MQ !== undefined) {
                  _A(MQ);
                  return;
                }
              }
              _A();
            },
            (O1, _1) => {
              hA(_1);
            },
          );
        });
      })
      .catch(hA);
  });
  K(MA, ZA);
  return MA;
}
function p7(mA, ZA, e, MA) {
  const _A = this;
  mA = E(mA);
  const hA = new Promise((D1, T1) => {
    _A.ready()
      .then(() => {
        if (ZA === undefined) {
          ZA = null;
        }
        const _1 = _A._dbInfo;
        _A._dbInfo.serializer.serialize(ZA, (h1, Q0) => {
          if (Q0) {
            T1(Q0);
          } else {
            _A._dbInfo.db.transaction(
              (d0) => {
                p2(
                  d0,
                  _A._dbInfo,
                  `INSERT OR REPLACE INTO ${_A._dbInfo.storeName} (key, value) VALUES (?, ?)`,
                  [mA, h1],
                  () => {
                    D1(ZA);
                  },
                  (_B, MQ) => {
                    T1(MQ);
                  },
                );
              },
              (d0) => {
                if (d0.code === d0.QUOTA_ERR) {
                  if (MA > 0) {
                    D1(p7.apply(_A, [mA, ZA, e, MA - 1]));
                    return;
                  }
                  T1(d0);
                }
              },
            );
          }
        });
      })
      .catch(T1);
  });
  K(hA, e);
  return hA;
}
function $3(mA, ZA, e) {
  return p7(mA, ZA, e, 1);
}
function cI(mA, ZA) {
  const e = this;
  mA = E(mA);
  const MA = new Promise((_A, hA) => {
    e.ready()
      .then(() => {
        const D1 = e._dbInfo;
        e._dbInfo.db.transaction((T1) => {
          p2(
            T1,
            e._dbInfo,
            `DELETE FROM ${e._dbInfo.storeName} WHERE key = ?`,
            [mA],
            () => {
              _A();
            },
            (O1, _1) => {
              hA(_1);
            },
          );
        });
      })
      .catch(hA);
  });
  K(MA, ZA);
  return MA;
}
function Y5(mA) {
  const ZA = this;
  const e = new Promise((MA, _A) => {
    ZA.ready()
      .then(() => {
        const hA = ZA._dbInfo;
        ZA._dbInfo.db.transaction((D1) => {
          p2(
            D1,
            ZA._dbInfo,
            `DELETE FROM ${ZA._dbInfo.storeName}`,
            [],
            () => {
              MA();
            },
            (T1, O1) => {
              _A(O1);
            },
          );
        });
      })
      .catch(_A);
  });
  K(e, mA);
  return e;
}
function l7(mA) {
  const ZA = this;
  const e = new Promise((MA, _A) => {
    ZA.ready()
      .then(() => {
        const hA = ZA._dbInfo;
        ZA._dbInfo.db.transaction((D1) => {
          p2(
            D1,
            ZA._dbInfo,
            `SELECT COUNT(key) as c FROM ${ZA._dbInfo.storeName}`,
            [],
            (T1, O1) => {
              const _1 = O1.rows.item(0).c;
              MA(O1.rows.item(0).c);
            },
            (T1, O1) => {
              _A(O1);
            },
          );
        });
      })
      .catch(_A);
  });
  K(e, mA);
  return e;
}
function l9(mA, ZA) {
  const e = this;
  const MA = new Promise((_A, hA) => {
    e.ready()
      .then(() => {
        const D1 = e._dbInfo;
        e._dbInfo.db.transaction((T1) => {
          p2(
            T1,
            e._dbInfo,
            `SELECT key FROM ${e._dbInfo.storeName} WHERE id = ? LIMIT 1`,
            [mA + 1],
            (O1, _1) => {
              const h1 = _1.rows.length ? _1.rows.item(0).key : null;
              _A(h1);
            },
            (O1, _1) => {
              hA(_1);
            },
          );
        });
      })
      .catch(hA);
  });
  K(MA, ZA);
  return MA;
}
function R6(mA) {
  const ZA = this;
  const e = new Promise((MA, _A) => {
    ZA.ready()
      .then(() => {
        const hA = ZA._dbInfo;
        ZA._dbInfo.db.transaction((D1) => {
          p2(
            D1,
            ZA._dbInfo,
            `SELECT key FROM ${ZA._dbInfo.storeName}`,
            [],
            (T1, O1) => {
              const _1 = [];
              for (let h1 = 0; h1 < O1.rows.length; h1++) {
                _1.push(O1.rows.item(h1).key);
              }
              MA(_1);
            },
            (T1, O1) => {
              _A(O1);
            },
          );
        });
      })
      .catch(_A);
  });
  K(e, mA);
  return e;
}
function qB(mA) {
  return new Promise((ZA, e) => {
    mA.transaction(
      (MA) => {
        MA.executeSql(
          "SELECT name FROM sqlite_master WHERE type='table' AND name <> '__WebKitDatabaseInfoTable__'",
          [],
          (_A, hA) => {
            const D1 = [];
            for (let T1 = 0; T1 < hA.rows.length; T1++) {
              D1.push(hA.rows.item(T1).name);
            }
            ZA({
              db: mA,
              storeNames: D1,
            });
          },
          (_A, hA) => {
            e(hA);
          },
        );
      },
      (MA) => {
        e(MA);
      },
    );
  });
}
function LQ(mA, ZA) {
  ZA = H();
  const e = this.config();
  mA = (typeof mA !== "function" && mA) || {};
  if (!mA.name) {
    mA.name = mA.name || e.name;
    mA.storeName = mA.storeName || e.storeName;
  }
  const MA = this;
  let _A;
  if (!mA.name) {
    _A = Promise.reject("Invalid arguments");
  } else {
    _A = new Promise((hA) => {
      let D1;
      if (mA.name === e.name) {
        D1 = MA._dbInfo.db;
      } else {
        D1 = openDatabase(mA.name, "", "", 0);
      }
      if (!mA.storeName) {
        hA(qB(D1));
      } else {
        hA({
          db: D1,
          storeNames: [mA.storeName],
        });
      }
    }).then((hA) => {
      return new Promise((D1, T1) => {
        hA.db.transaction(
          (O1) => {
            function _1(_B) {
              return new Promise((MQ, GQ) => {
                O1.executeSql(
                  `DROP TABLE IF EXISTS ${_B}`,
                  [],
                  () => {
                    MQ();
                  },
                  (T2, e4) => {
                    GQ(e4);
                  },
                );
              });
            }
            const h1 = [];
            for (let Q0 = 0, d0 = hA.storeNames.length; Q0 < d0; Q0++) {
              h1.push(_1(hA.storeNames[Q0]));
            }
            Promise.all(h1)
              .then(() => {
                D1();
              })
              .catch((_B) => {
                T1(_B);
              });
          },
          (O1) => {
            T1(O1);
          },
        );
      });
    });
  }
  K(_A, ZA);
  return _A;
}
const Y1 = {
  _driver: "webSQLStorage",
  _initStorage: m0,
  _support: eA(),
  iterate: qI,
  getItem: Z8,
  setItem: $3,
  removeItem: cI,
  clear: Y5,
  length: l7,
  key: l9,
  keys: R6,
  dropInstance: LQ,
};
function uA() {
  try {
    return (
      typeof localStorage !== "undefined" &&
      "setItem" in localStorage &&
      !!localStorage.setItem
    );
  } catch (mA) {
    return false;
  }
}
function F1(mA, ZA) {
  let e = `${mA.name}/`;
  if (mA.storeName !== ZA.storeName) {
    e += `${mA.storeName}/`;
  }
  return e;
}
function o1() {
  const mA = "_localforage_support_test";
  try {
    localStorage.setItem("_localforage_support_test", true);
    localStorage.removeItem("_localforage_support_test");
    return false;
  } catch (ZA) {
    return true;
  }
}
function e1() {
  return !o1() || localStorage.length > 0;
}
function WB(mA) {
  const ZA = this;
  const e = {};
  if (mA) {
    for (const MA in mA) {
      e[MA] = mA[MA];
    }
  }
  e.keyPrefix = F1(mA, ZA._defaultConfig);
  if (!e1()) {
    return Promise.reject();
  }
  ZA._dbInfo = e;
  e.serializer = cQ;
  return Promise.resolve();
}
function pQ(mA) {
  const ZA = this;
  const e = ZA.ready().then(() => {
    const MA = ZA._dbInfo.keyPrefix;
    for (let _A = localStorage.length - 1; _A >= 0; _A--) {
      const hA = localStorage.key(_A);
      if (hA.indexOf(ZA._dbInfo.keyPrefix) === 0) {
        localStorage.removeItem(hA);
      }
    }
  });
  K(e, mA);
  return e;
}
function q9(mA, ZA) {
  const e = this;
  mA = E(mA);
  const MA = e.ready().then(() => {
    const _A = e._dbInfo;
    let hA = localStorage.getItem(e._dbInfo.keyPrefix + mA);
    if (hA) {
      hA = e._dbInfo.serializer.deserialize(hA);
    }
    return hA;
  });
  K(MA, ZA);
  return MA;
}
function Z4(mA, ZA) {
  const e = this;
  const MA = e.ready().then(() => {
    const _A = e._dbInfo;
    const hA = e._dbInfo.keyPrefix;
    const D1 = e._dbInfo.keyPrefix.length;
    const T1 = localStorage.length;
    let O1 = 1;
    for (let _1 = 0; _1 < localStorage.length; _1++) {
      const h1 = localStorage.key(_1);
      if (h1.indexOf(e._dbInfo.keyPrefix) !== 0) {
        continue;
      }
      let Q0 = localStorage.getItem(h1);
      if (Q0) {
        Q0 = e._dbInfo.serializer.deserialize(Q0);
      }
      Q0 = mA(Q0, h1.substring(e._dbInfo.keyPrefix.length), O1++);
      if (Q0 !== undefined) {
        return Q0;
      }
    }
  });
  K(MA, ZA);
  return MA;
}
function A6(mA, ZA) {
  const e = this;
  const MA = e.ready().then(() => {
    const _A = e._dbInfo;
    let hA;
    try {
      hA = localStorage.key(mA);
    } catch (D1) {
      hA = null;
    }
    if (hA) {
      hA = hA.substring(e._dbInfo.keyPrefix.length);
    }
    return hA;
  });
  K(MA, ZA);
  return MA;
}
function N9(mA) {
  const ZA = this;
  const e = ZA.ready().then(() => {
    const MA = ZA._dbInfo;
    const _A = localStorage.length;
    const hA = [];
    for (let D1 = 0; D1 < localStorage.length; D1++) {
      const T1 = localStorage.key(D1);
      if (T1.indexOf(ZA._dbInfo.keyPrefix) === 0) {
        hA.push(T1.substring(ZA._dbInfo.keyPrefix.length));
      }
    }
    return hA;
  });
  K(e, mA);
  return e;
}
function j8(mA) {
  const ZA = this;
  const e = ZA.keys().then((MA) => {
    return MA.length;
  });
  K(e, mA);
  return e;
}
function B6(mA, ZA) {
  const e = this;
  mA = E(mA);
  const MA = e.ready().then(() => {
    const _A = e._dbInfo;
    localStorage.removeItem(e._dbInfo.keyPrefix + mA);
  });
  K(MA, ZA);
  return MA;
}
function x4(mA, ZA, e) {
  const MA = this;
  mA = E(mA);
  const _A = MA.ready().then(() => {
    if (ZA === undefined) {
      ZA = null;
    }
    return new Promise((D1, T1) => {
      const O1 = MA._dbInfo;
      MA._dbInfo.serializer.serialize(ZA, (_1, h1) => {
        if (h1) {
          T1(h1);
        } else {
          try {
            localStorage.setItem(MA._dbInfo.keyPrefix + mA, _1);
            D1(ZA);
          } catch (Q0) {
            if (
              Q0.name === "QuotaExceededError" ||
              Q0.name === "NS_ERROR_DOM_QUOTA_REACHED"
            ) {
              T1(Q0);
            }
            T1(Q0);
          }
        }
      });
    });
  });
  K(_A, e);
  return _A;
}
function L9(mA, ZA) {
  ZA = H();
  mA = (typeof mA !== "function" && mA) || {};
  if (!mA.name) {
    const e = this.config();
    mA.name = mA.name || e.name;
    mA.storeName = mA.storeName || e.storeName;
  }
  const MA = this;
  let _A;
  if (!mA.name) {
    _A = Promise.reject("Invalid arguments");
  } else {
    _A = new Promise((hA) => {
      if (!mA.storeName) {
        hA(`${mA.name}/`);
      } else {
        hA(F1(mA, MA._defaultConfig));
      }
    }).then((hA) => {
      for (let D1 = localStorage.length - 1; D1 >= 0; D1--) {
        const T1 = localStorage.key(D1);
        if (T1.indexOf(hA) === 0) {
          localStorage.removeItem(T1);
        }
      }
    });
  }
  K(_A, ZA);
  return _A;
}
const Y8 = {
  _driver: "localStorageWrapper",
  _initStorage: WB,
  _support: uA(),
  iterate: Z4,
  getItem: q9,
  setItem: x4,
  removeItem: B6,
  clear: pQ,
  length: j8,
  key: A6,
  keys: N9,
  dropInstance: L9,
};
function Q4(ZA, e) {
  return (
    ZA === e ||
    (typeof ZA === "number" && typeof e === "number" && isNaN(ZA) && isNaN(e))
  );
}
function pI(ZA, e) {
  const MA = ZA.length;
  let _A = 0;
  while (_A < ZA.length) {
    if (Q4(ZA[_A], e)) {
      return true;
    }
    _A++;
  }
  return false;
}
const S8 =
  Array.isArray ||
  ((mA) => {
    return Object.prototype.toString.call(mA) === "[object Array]";
  });
const T6 = {};
const v9 = {};
const E4 = {
  INDEXEDDB: OA,
  WEBSQL: Y1,
  LOCALSTORAGE: Y8,
};
const t5 = ["asyncStorage", "webSQLStorage", "localStorageWrapper"];
const v4 = ["dropInstance"];
const n6 = [
  "clear",
  "getItem",
  "iterate",
  "key",
  "keys",
  "length",
  "removeItem",
  "setItem",
].concat(v4);
const P9 = {
  description: "",
  driver: t5.slice(),
  name: "localforage",
  size: 4980736,
  storeName: "keyvaluepairs",
  version: 1,
};
function Y4(mA, ZA) {
  mA[ZA] = () => {
    return mA.ready().then(function (...args) {
      return mA[ZA].apply(mA, args);
    });
  };
}
function P5(...args) {
  for (let mA = 1; mA < args.length; mA++) {
    const ZA = args[mA];
    if (args[mA]) {
      for (const e in args[mA]) {
        if (args[mA].hasOwnProperty(e)) {
          if (S8(args[mA][e])) {
            args[0][e] = args[mA][e].slice();
          } else {
            args[0][e] = args[mA][e];
          }
        }
      }
    }
  }
  return args[0];
}
const j9 = (() => {
  function mA(ZA) {
    J(this, mA);
    for (const e in E4) {
      if (E4.hasOwnProperty(e)) {
        const MA = E4[e];
        const _A = E4[e]._driver;
        this[e] = E4[e]._driver;
        if (!T6[E4[e]._driver]) {
          this.defineDriver(E4[e]);
        }
      }
    }
    this._defaultConfig = P5({}, P9);
    this._config = P5({}, this._defaultConfig, ZA);
    this._driverSet = null;
    this._initDriver = null;
    this._ready = false;
    this._dbInfo = null;
    this._wrapLibraryMethodsWithReady();
    this.setDriver(this._config.driver).catch(() => {});
  }
  mA.prototype.config = function (e) {
    if ((typeof e === "undefined" ? "undefined" : Y(e)) === "object") {
      if (this._ready) {
        return Error("Can't call config() after localforage has been used.");
      }
      for (const MA in e) {
        if (MA === "storeName") {
          e[MA] = e[MA].replace(/\W/g, "_");
        }
        if (MA === "version" && typeof e[MA] !== "number") {
          return Error("Database version must be a number.");
        }
        this._config[MA] = e[MA];
      }
      if ("driver" in e && e.driver) {
        return this.setDriver(this._config.driver);
      }
      return true;
    } else if (typeof e === "string") {
      return this._config[e];
    } else {
      return this._config;
    }
  };
  mA.prototype.defineDriver = (e, MA, _A) => {
    const hA = new Promise((D1, T1) => {
      try {
        const O1 = e._driver;
        const _1 = Error(
          "Custom driver not compliant; see https://mozilla.github.io/localForage/#definedriver",
        );
        if (!e._driver) {
          T1(_1);
          return;
        }
        const h1 = n6.concat("_initStorage");
        for (let Q0 = 0, d0 = h1.length; Q0 < d0; Q0++) {
          const _B = h1[Q0];
          const MQ = !pI(v4, h1[Q0]);
          if ((MQ || e[h1[Q0]]) && typeof e[h1[Q0]] !== "function") {
            T1(_1);
            return;
          }
        }
        function GQ() {
          function a6(hZ) {
            return function (...args) {
              const i9 = Error(
                `Method ${hZ} is not implemented by the current driver`,
              );
              const I3 = Promise.reject(i9);
              K(I3, args[args.length - 1]);
              return I3;
            };
          }
          for (let P6 = 0, kX = v4.length; P6 < kX; P6++) {
            const NI = v4[P6];
            if (!e[NI]) {
              e[NI] = a6(NI);
            }
          }
        }
        GQ();
        function T2(a6) {
          if (T6[O1]) {
            console.info(`Redefining LocalForage driver: ${O1}`);
          }
          T6[O1] = e;
          v9[O1] = a6;
          D1();
        }
        if ("_support" in e) {
          if (e._support && typeof e._support === "function") {
            e._support().then(T2, T1);
          } else {
            T2(!!e._support);
          }
        } else {
          T2(true);
        }
      } catch (e4) {
        T1(e4);
      }
    });
    D(hA, MA, _A);
    return hA;
  };
  mA.prototype.driver = function () {
    return this._driver || null;
  };
  mA.prototype.getDriver = (e, MA, _A) => {
    const hA = T6[e]
      ? Promise.resolve(T6[e])
      : Promise.reject(Error("Driver not found."));
    D(hA, MA, _A);
    return hA;
  };
  mA.prototype.getSerializer = (e) => {
    const MA = Promise.resolve(cQ);
    D(MA, e);
    return MA;
  };
  mA.prototype.ready = function (e) {
    const MA = this;
    const _A = MA._driverSet.then(() => {
      if (MA._ready === null) {
        MA._ready = MA._initDriver();
      }
      return MA._ready;
    });
    D(_A, e, e);
    return _A;
  };
  mA.prototype.setDriver = function (e, MA, _A) {
    const hA = this;
    if (!S8(e)) {
      e = [e];
    }
    const D1 = this._getSupportedDrivers(e);
    function T1() {
      hA._config.driver = hA.driver();
    }
    function O1(Q0) {
      hA._extend(Q0);
      T1();
      hA._ready = hA._initStorage(hA._config);
      return hA._ready;
    }
    function _1(Q0) {
      return () => {
        let d0 = 0;
        function _B() {
          while (d0 < Q0.length) {
            const MQ = Q0[d0];
            d0++;
            hA._dbInfo = null;
            hA._ready = null;
            return hA.getDriver(Q0[d0]).then(O1).catch(_B);
          }
          T1();
          const GQ = Error("No available storage method found.");
          hA._driverSet = Promise.reject(GQ);
          return hA._driverSet;
        }
        return _B();
      };
    }
    const h1 =
      this._driverSet !== null
        ? this._driverSet.catch(() => {
            return Promise.resolve();
          })
        : Promise.resolve();
    this._driverSet = h1
      .then(() => {
        const Q0 = D1[0];
        hA._dbInfo = null;
        hA._ready = null;
        return hA.getDriver(D1[0]).then((d0) => {
          hA._driver = d0._driver;
          T1();
          hA._wrapLibraryMethodsWithReady();
          hA._initDriver = _1(D1);
        });
      })
      .catch(() => {
        T1();
        const Q0 = Error("No available storage method found.");
        hA._driverSet = Promise.reject(Q0);
        return hA._driverSet;
      });
    D(this._driverSet, MA, _A);
    return this._driverSet;
  };
  mA.prototype.supports = (e) => {
    return !!v9[e];
  };
  mA.prototype._extend = function (e) {
    P5(this, e);
  };
  mA.prototype._getSupportedDrivers = function (e) {
    const MA = [];
    for (let _A = 0, hA = e.length; _A < hA; _A++) {
      const D1 = e[_A];
      if (this.supports(e[_A])) {
        MA.push(e[_A]);
      }
    }
    return MA;
  };
  mA.prototype._wrapLibraryMethodsWithReady = function () {
    for (let e = 0, MA = n6.length; e < MA; e++) {
      Y4(this, n6[e]);
    }
  };
  mA.prototype.createInstance = (e) => {
    return new mA(e);
  };
  return mA;
})();
const M9 = new j9();
export default M9;
