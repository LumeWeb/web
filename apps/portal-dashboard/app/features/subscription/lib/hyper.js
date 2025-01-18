function p(r, n, e) {
  for (var t = new Array(e), i = 0, u = n; i < e; )
    (t[i] = r[u]), (i = (i + 1) | 0), (u = (u + 1) | 0);
  return t;
}

function m(r, n) {
  for (;;) {
    var e = n,
      t = r,
      i = t.length,
      u = i === 0 ? 1 : i,
      o = e.length,
      f = (u - o) | 0;
    if (f === 0) return t.apply(null, e);
    if (f >= 0)
      return (function (l, c) {
        return function (_) {
          return m(l, c.concat([_]));
        };
      })(t, e);
    (n = p(e, u, -f | 0)), (r = t.apply(null, p(e, 0, u)));
  }
}

function d(r, n, e, t) {
  var i = r.length;
  if (i === 3) return r(n, e, t);
  switch (i) {
    case 1:
      return m(r(n), [e, t]);
    case 2:
      return m(r(n, e), [t]);
    case 3:
      return r(n, e, t);
    case 4:
      return function (u) {
        return r(n, e, t, u);
      };
    case 5:
      return function (u, o) {
        return r(n, e, t, u, o);
      };
    case 6:
      return function (u, o, f) {
        return r(n, e, t, u, o, f);
      };
    case 7:
      return function (u, o, f, l) {
        return r(n, e, t, u, o, f, l);
      };
    default:
      return m(r, [n, e, t]);
  }
}

function a(r) {
  return r === void 0
    ? { BS_PRIVATE_NESTED_SOME_NONE: 0 }
    : r !== null && r.BS_PRIVATE_NESTED_SOME_NONE !== void 0
      ? { BS_PRIVATE_NESTED_SOME_NONE: (r.BS_PRIVATE_NESTED_SOME_NONE + 1) | 0 }
      : r;
}

function s(r) {
  if (!(r !== null && r.BS_PRIVATE_NESTED_SOME_NONE !== void 0)) return r;
  var n = r.BS_PRIVATE_NESTED_SOME_NONE;
  if (n !== 0) return { BS_PRIVATE_NESTED_SOME_NONE: (n - 1) | 0 };
}

function A(r, n) {
  if (n in r) return a(r[n]);
}

function I(r) {
  for (var n = {}, e = r.length, t = 0; t < e; ++t) {
    var i = r[t];
    n[i[0]] = i[1];
  }
  return n;
}

function N(r) {
  if (typeof r == "string") return r;
}

function S(r) {
  if (typeof r == "object" && !Array.isArray(r) && r !== null) return a(r);
}

var y = 2147483647,
  g = -2147483648;

function M(r) {
  return r > y ? y : r < g ? g : Math.floor(r);
}

function E(r, n) {
  return (M(Math.random() * ((n - r) | 0)) + r) | 0;
}

function P(r, n) {
  if (r <= 0) return [];
  for (var e = new Array(r), t = 0; t < r; ++t) e[t] = n;
  return e;
}

function b(r, n) {
  return r !== void 0 ? s(r) : n;
}

function T(r) {
  var n = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return P(32, 0).reduce(function (e, t) {
    var i = E(0, n.length),
      u = n.charAt(i);
    return e + u;
  }, "");
}

function R(r) {
  var n = r !== void 0 ? b(S(s(r)), {}) : {},
    e = A(n, "env");
  if (e === void 0) return "";
  var t = N(s(e));
  return t !== void 0 ? t : "";
}

function V(r, n) {
  return new Promise(function (e, t) {
    var i = T(void 0),
      u = Date.now(),
      o = R(n),
      f;
    switch (o) {
      case "PROD":
        f = "https://checkout.hyperswitch.io/v0/HyperLoader.js";
        break;
      case "SANDBOX":
        f = "https://beta.hyperswitch.io/v1/HyperLoader.js";
        break;
      default:
        f = r.startsWith("pk_prd_")
          ? "https://checkout.hyperswitch.io/v0/HyperLoader.js"
          : "https://beta.hyperswitch.io/v1/HyperLoader.js";
    }
    var l = I([
      ["sessionID", i],
      ["timeStamp", String(u)],
    ]);
    if (document.querySelectorAll('script[src="' + f + '"]').length === 0) {
      var c = document.createElement("script");
      (c.src = f),
        (c.onload = function (w) {
          var C = window.Hyper;
          if (C != null) return e(d(C, r, n, l));
        }),
        (c.onerror = function (w) {
          t(w);
        }),
        document.body.appendChild(c);
      return;
    }
    console.warn(
      "INTEGRATION WARNING: There is already an existing script tag for " +
        f +
        ". Multiple additions of HyperLoader.js is not permitted, please add it on the top level only once.",
    );
    var _ = window.Hyper;
    if (_ != null) return e(d(_, r, n, l));
  });
}

function K(r, n) {
  return (
    console.warn("loadStripe is deprecated. Please use loadHyper instead."),
    V(r, n)
  );
}

export { V as loadHyper, K as loadStripe };
