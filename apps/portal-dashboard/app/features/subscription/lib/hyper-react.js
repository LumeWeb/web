import *as $ from "react";
import *as E from "react";
import *as T from "react";
import *as W from "react";
import *as A from "react";
import *as D from "react";
import *as h from "react";
import *as xe from "react/jsx-runtime";
import *as he from "react/jsx-runtime";
import *as te from "react/jsx-runtime";
import *as Pe from "react/jsx-runtime";
import *as Re from "react/jsx-runtime";
import *as ke from "react/jsx-runtime";
import *as ue from "react/jsx-runtime";
import *as Se from "react/jsx-runtime";
import *as we from "react/jsx-runtime";
import *as Ne from "react/jsx-runtime";
import *as Je from "react/jsx-runtime";
import *as Te from "react/jsx-runtime";
import *as me from "react/jsx-runtime";
import *as We from "react/jsx-runtime";

function De (e, n) {}

function $e () {}

function Ue () {}

function je (e) {}

function Ie () {}

function qe () {}

function He (e) {}

function Ge () {}

function Ke () {}

var le = { on: De, collapse: $e, blur: Ue, update: je, destroy: Ie, unmount: qe, mount: He, focus: Ge, clear: Ke };

function Le (e) {if (typeof e == "boolean") return e;}

function ze (e) {if (e === null) return null;}

function Qe (e) {if (typeof e == "string") return e;}

function Ye (e) {if (typeof e == "number") return e;}

function Ze (e) {if (typeof e == "object" && !Array.isArray(e) && e !== null) return e;}

function en (e) {if (Array.isArray(e)) return e;}

var v = { bool: Le, $$null: ze, string: Qe, $$float: Ye, object: Ze, array: en };

function L (e, n, o) {
  for (var t = new Array(o), r = 0, a = n; r < o;) t[r] = e[a], r = r + 1 | 0, a = a + 1 | 0;
  return t;
}

function ce (e, n) {
  for (; ;) {
    var o = n, t = e, r = t.length, a = r === 0 ? 1 : r, m = o.length, l = a - m | 0;
    if (l === 0) return t.apply(null, o);
    if (l >= 0) return function(f, u) {return function(i) {return ce(f, u.concat([i]));};}(t, o);
    n = L(o, a, -l | 0), e = t.apply(null, L(o, 0, a));
  }
}

function rn (e, n) {
  var o = e.length;
  if (o === 1) return e(n);
  switch (o) {
    case 1:
      return e(n);
    case 2:
      return function(t) {return e(n, t);};
    case 3:
      return function(t, r) {return e(n, t, r);};
    case 4:
      return function(t, r, a) {return e(n, t, r, a);};
    case 5:
      return function(t, r, a, m) {return e(n, t, r, a, m);};
    case 6:
      return function(t, r, a, m, l) {return e(n, t, r, a, m, l);};
    case 7:
      return function(t, r, a, m, l, f) {return e(n, t, r, a, m, l, f);};
    default:
      return ce(e, [n]);
  }
}

function U (e) {
  var n = e.length;
  return n === 1 ? e : function(o) {return rn(e, o);};
}

function P (e) {return e === void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: 0 } : e !== null && e.BS_PRIVATE_NESTED_SOME_NONE !== void 0 ? { BS_PRIVATE_NESTED_SOME_NONE: e.BS_PRIVATE_NESTED_SOME_NONE + 1 | 0 } : e;}

function j (e) {
  if (!(e !== null && e.BS_PRIVATE_NESTED_SOME_NONE !== void 0)) return e;
  var n = e.BS_PRIVATE_NESTED_SOME_NONE;
  if (n !== 0) return { BS_PRIVATE_NESTED_SOME_NONE: n - 1 | 0 };
}

function on (e, n) {if (e !== void 0) return n(j(e));}

function R (e, n) {return on(e, U(n));}

function _ (e, n) {return e !== void 0 ? j(e) : n;}

function mn (e) {return Promise.resolve({});}

function ln (e, n, o) {return Promise.resolve({});}

function cn (e) {return Promise.resolve({});}

function fe (e) {return e;}

var b = { clientSecret: "", confirmPayment: mn, confirmCardPayment: ln, retrievePaymentIntent: cn, paymentRequest: fe },
  O = T.createContext(b), sn = O.Provider, q = { make: sn }, z = { ephemeralKey: "", paymentRequest: fe },
  Q = T.createContext(z), fn = Q.Provider, de = { make: fn };

function k (e, n, o) {return _(R(e[n], v.string), o);}

function H (e) {
  var n = _(v.object(e), {});
  return {
    fonts: _(R(n.fonts, v.array), []),
    locale: k(n, "locale", ""),
    clientSecret: k(n, "clientSecret", ""),
    appearance: _(R(n.appearance, v.object), {}),
    loader: k(n, "loader", "auto"),
  };
}

function pe (e) {}

function ye (e) {}

function Ce () {return new Promise(function(e, n) {setTimeout(function() {e({});}, 1e3);});}

function ve (e, n) {return le;}

var dn = { fonts: [], locale: "", clientSecret: "", appearance: {}, loader: "" },
  B = { options: dn, update: pe, getElement: ye, fetchUpdates: Ce, create: ve }, S = T.createContext(B),
  pn = S.Provider, G = { make: pn };

function _e (e) {
  var n = _(v.object(e), {});
  return {
    fonts: _(R(n.fonts, v.array), []),
    locale: k(n, "locale", ""),
    ephemeralKey: k(n, "ephemeralKey", ""),
    appearance: _(R(n.appearance, v.object), {}),
    loader: k(n, "loader", "auto"),
  };
}

var yn = { fonts: [], locale: "", ephemeralKey: "", appearance: {}, loader: "" },
  Y = { options: yn, update: pe, getElement: ye, fetchUpdates: Ce, create: ve }, Z = T.createContext(Y),
  Cn = Z.Provider, Ee = { make: Cn };

function vn (e) {
  var n = e.onClick, o = e.onBlur, t = e.onFocus, r = e.componentType, a = e.onReady, m = e.onChange, l = e.options,
    f = e.id, u = f !== void 0 ? f : "payment-Element", i = E.useContext(O), y = E.useContext(S), p = E.useRef(null),
    d = y.create(r, l);
  return E.useEffect(function() {
    var c = y.create(r, l);
    c.mount("#orca-elements-payment-element-" + u);
  }, [p, y]), E.useEffect(function() {d.on("ready", a), d.on("focus", t), d.on("blur", o), d.on("clickTriggered", n), d.on("change", m);}, [y, i]), he.jsx("div", {
    ref: P(p),
    id: "orca-elements-payment-element-" + u,
  });
}

var s = vn;

function _n (e) {
  return xe.jsx(s, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "cardCvc",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick,
  });
}

var ee = _n;

function w (e, n) {return n.then(U(e));}

function hn (e) {
  var n = e.options, o = e.stripe, t = H(n), r = W.useState(function() {return b;}), a = r[1],
    m = W.useState(function() {return B;}), l = m[1];
  return W.useEffect(function() {
    (function(f) {
      return w(function(u) {
        var i = u.elements(n), y = i.update, p = i.getElement, d = i.fetchUpdates, c = i.create,
          x = { options: t, update: y, getElement: p, fetchUpdates: d, create: c }, N = t.clientSecret,
          F = u.confirmPayment, g = u.confirmCardPayment, J = u.retrievePaymentIntent, K = u.paymentRequest, V = {
            clientSecret: N,
            confirmPayment: F,
            confirmCardPayment: g,
            retrievePaymentIntent: J,
            paymentRequest: K,
          };
        return a(function(X) {return V;}), l(function(X) {return x;}), Promise.resolve(V);
      }, f);
    })(o);
  }, []), te.jsx(q.make, { value: r[0], children: te.jsx(G.make, { value: m[0], children: e.children }) });
}

var ge = hn;

function gn (e) {
  return Pe.jsx(s, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "cardExpiry",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick,
  });
}

var re = gn;

function Rn (e) {
  return Re.jsx(s, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "cardNumber",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick,
  });
}

var oe = Rn;

function On (e) {
  return ke.jsx(s, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "card",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick,
  });
}

var ae = On;

function Mn (e) {
  var n = e.options, o = e.hyper, t = H(n), r = A.useState(function() {return b;}), a = r[1],
    m = A.useState(function() {return B;}), l = m[1];
  return A.useEffect(function() {
    (function(f) {
      return w(function(u) {
        var i = u.elements(n), y = i.update, p = i.getElement, d = i.fetchUpdates, c = i.create,
          x = { options: t, update: y, getElement: p, fetchUpdates: d, create: c }, N = t.clientSecret,
          F = u.confirmPayment, g = u.confirmCardPayment, J = u.retrievePaymentIntent, K = u.paymentRequest, V = {
            clientSecret: N,
            confirmPayment: F,
            confirmCardPayment: g,
            retrievePaymentIntent: J,
            paymentRequest: K,
          };
        return a(function(X) {return V;}), l(function(X) {return x;}), Promise.resolve(V);
      }, f);
    })(o);
  }, []), ue.jsx(q.make, { value: r[0], children: ue.jsx(G.make, { value: m[0], children: e.children }) });
}

var Oe = Mn;

function Nn (e) {
  return Se.jsx(s, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "payPal",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick,
  });
}

var Me = Nn;

function Jn (e) {
  return we.jsx(s, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "payment",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick,
  });
}

var ie = Jn;

function Tn (e) {
  return Ne.jsx(s, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "applePay",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick,
  });
}

var Fe = Tn;

function Bn (e) {
  return Je.jsx(s, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "googlePay",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick,
  });
}

var Ve = Bn;

function An (e) {
  return Te.jsx(s, {
    id: e.id,
    options: e.options,
    onChange: e.onChange,
    onReady: e.onReady,
    componentType: "expressCheckout",
    onFocus: e.onFocus,
    onBlur: e.onBlur,
    onClick: e.onClick,
  });
}

var be = An;

function $n (e) {
  var n = e.options, o = e.hyper, t = _e(n), r = D.useState(function() {return z;}), a = r[1],
    m = D.useState(function() {return Y;}), l = m[1];
  return D.useEffect(function() {
    (function(f) {
      return w(function(u) {
        var i = u.paymentMethodsManagementElements(n), y = i.update, p = i.getElement, d = i.fetchUpdates, c = i.create,
          x = { options: t, update: y, getElement: p, fetchUpdates: d, create: c }, N = t.ephemeralKey,
          F = u.paymentRequest, g = { ephemeralKey: N, paymentRequest: F };
        return a(function(J) {return g;}), l(function(J) {return x;}), Promise.resolve(g);
      }, f);
    })(o);
  }, []), me.jsx(de.make, { value: r[0], children: me.jsx(Ee.make, { value: m[0], children: e.children }) });
}

var Be = $n;

function jn (e) {
  var n = e.onClick, o = e.onBlur, t = e.onFocus, r = e.componentType, a = e.onReady, m = e.onChange, l = e.options,
    f = e.id, u = f !== void 0 ? f : "payment-management", i = r !== void 0 ? r : "paymentMethodsManagement",
    y = h.useContext(Q), p = h.useContext(Z), d = h.useRef(null), c = p.create(i, l);
  return h.useEffect(function() {
    var x = p.create(i, l);
    x.mount("#orca-elements-payment-management-" + u);
  }, [d, p]), h.useEffect(function() {return c.on("ready", a), c.on("focus", t), c.on("blur", o), c.on("clickTriggered", n), c.on("change", m), function() {c.on("ready", void 0), c.on("focus", void 0), c.on("blur", void 0), c.on("clickTriggered", void 0), c.on("change", void 0);};}, [p, y]), We.jsx("div", {
    ref: P(d),
    id: "orca-elements-payment-management-" + u,
  });
}

var Ae = jn;

function Hn () {return $.useContext(O);}

function Gn () {return console.warn("useStripe() is deprecated. Use useHyper() instead"), $.useContext(O);}

function Kn () {return $.useContext(S);}

function Xn () {return console.warn("useElements() is deprecated. Use useWidgets() instead"), $.useContext(S);}

var Ln = ge, zn = Oe, Qn = ie, Yn = ie, Zn = ae, et = ae, nt = oe, tt = oe, rt = ee, ot = ee, at = re, ut = re, it = Ve,
  mt = Fe, lt = Me, ct = be, st = Be, ft = Ae;
export {
  mt as ApplePayElement,
  rt as CardCVCElement,
  ot as CardCVCWidget,
  Zn as CardElement,
  at as CardExpiryElement,
  ut as CardExpiryWidget,
  nt as CardNumberElement,
  tt as CardNumberWidget,
  et as CardWidget,
  Ln as Elements,
  ct as ExpressCheckoutElement,
  it as GooglePayElement,
  zn as HyperElements,
  st as HyperManagementElements,
  lt as PayPalElement,
  Qn as PaymentElement,
  ft as PaymentMethodsManagementElement,
  Yn as UnifiedCheckout,
  Xn as useElements,
  Hn as useHyper,
  Gn as useStripe,
  Kn as useWidgets,
};
