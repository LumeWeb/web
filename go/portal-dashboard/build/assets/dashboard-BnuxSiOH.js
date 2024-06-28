import { j as jsxRuntimeExports, k as getDefaultExportFromCjs, R as React, r as reactExports, l as getAugmentedNamespace } from "./index-CZkutDaP.js";
import { x as Avatar, C as CrownIcon, P as PersonIcon, y as CloudIcon, z as CloudDownloadIcon, B as CheckRoundedIcon, A as AddIcon, _ as _baseGetTag, E as isObject_1, H as _root, I as debounce_1, J as debounce, K as useIsMobile, L as InfoIcon, G as GeneralLayout, N as CurrentUsageIcon, O as CloudUploadSolidIcon } from "./general-layout-jYiYq9RB.js";
import { $ as $r, e as ec } from "./index-VoJZYkST.js";
import { B as Button } from "./button-BnU71koa.js";
import { U as UsageCard } from "./usage-card-C-x4Lv9K.js";
import { r as reactDomExports } from "./index-BtTpAOFQ.js";
import { S as SectionTitle } from "./section-title-BiA0MTOA.js";
import "./utils-CrxSwyC8.js";
import "./index-BZHzSmil.js";
import "./lume-logo-DajxWjUk.js";
import "./lume-logo-ChvyOqr_.js";
import "./pinning-C3Ssqtc8.js";
import "./forms-ChQhSYFQ.js";
import "./sdk-context-D31_5OTC.js";
import "./index-CeNAs65J.js";
import "./components-Bt5ybS0r.js";
const accountBannerImage = "/assets/account-banner-image-CvVM4F3e.png";
const UpgradeAccountBanner = () => {
  const { data: identity2 } = $r();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "flex items-center justify-between p-10 border border-border/20 overflow-hidden rounded-lg bg-secondary mt-4",
      style: {
        backgroundImage: `url(${accountBannerImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      },
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-x-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "border-2 border-ring h-20 w-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-x-2 font-bold", children: [
              `${identity2 == null ? void 0 : identity2.firstName} ${identity2 == null ? void 0 : identity2.lastName}`,
              /* @__PURE__ */ jsxRuntimeExports.jsx(CrownIcon, { className: "text-ring" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                className: "flex sm:hidden items-center gap-x-2 text-foreground text-sm whitespace-nowrap",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {}),
                  "Lite Account (upgrade)"
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden lg:flex gap-x-5 mt-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-x-2 text-foreground text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(PersonIcon, {}),
                "Lite Account (upgrade)"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-x-2 text-foreground text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {}),
                "120 GB / 130 GB"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-x-2 text-foreground text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownloadIcon, {}),
                "10 GB / 25 GB"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-x-2 text-foreground text-sm", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(CheckRoundedIcon, {}),
                "0% Free Usage"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { className: "hidden sm:flex gap-x-2 py-6 border-border border bg-secondary", variant: "default", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}),
          "Upgrade to Premium"
        ] })
      ]
    }
  );
};
var pi$1 = Math.PI, tau$1 = 2 * pi$1, epsilon$1 = 1e-6, tauEpsilon = tau$1 - epsilon$1;
function Path() {
  this._x0 = this._y0 = // start of current subpath
  this._x1 = this._y1 = null;
  this._ = "";
}
function path() {
  return new Path();
}
Path.prototype = path.prototype = {
  constructor: Path,
  moveTo: function(x2, y2) {
    this._ += "M" + (this._x0 = this._x1 = +x2) + "," + (this._y0 = this._y1 = +y2);
  },
  closePath: function() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._ += "Z";
    }
  },
  lineTo: function(x2, y2) {
    this._ += "L" + (this._x1 = +x2) + "," + (this._y1 = +y2);
  },
  quadraticCurveTo: function(x1, y1, x2, y2) {
    this._ += "Q" + +x1 + "," + +y1 + "," + (this._x1 = +x2) + "," + (this._y1 = +y2);
  },
  bezierCurveTo: function(x1, y1, x2, y2, x3, y3) {
    this._ += "C" + +x1 + "," + +y1 + "," + +x2 + "," + +y2 + "," + (this._x1 = +x3) + "," + (this._y1 = +y3);
  },
  arcTo: function(x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    var x0 = this._x1, y0 = this._y1, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
    if (r < 0) throw new Error("negative radius: " + r);
    if (this._x1 === null) {
      this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
    } else if (!(l01_2 > epsilon$1)) ;
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon$1) || !r) {
      this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
    } else {
      var x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r * Math.tan((pi$1 - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
      if (Math.abs(t01 - 1) > epsilon$1) {
        this._ += "L" + (x1 + t01 * x01) + "," + (y1 + t01 * y01);
      }
      this._ += "A" + r + "," + r + ",0,0," + +(y01 * x20 > x01 * y20) + "," + (this._x1 = x1 + t21 * x21) + "," + (this._y1 = y1 + t21 * y21);
    }
  },
  arc: function(x2, y2, r, a0, a1, ccw) {
    x2 = +x2, y2 = +y2, r = +r, ccw = !!ccw;
    var dx = r * Math.cos(a0), dy = r * Math.sin(a0), x0 = x2 + dx, y0 = y2 + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
    if (r < 0) throw new Error("negative radius: " + r);
    if (this._x1 === null) {
      this._ += "M" + x0 + "," + y0;
    } else if (Math.abs(this._x1 - x0) > epsilon$1 || Math.abs(this._y1 - y0) > epsilon$1) {
      this._ += "L" + x0 + "," + y0;
    }
    if (!r) return;
    if (da < 0) da = da % tau$1 + tau$1;
    if (da > tauEpsilon) {
      this._ += "A" + r + "," + r + ",0,1," + cw + "," + (x2 - dx) + "," + (y2 - dy) + "A" + r + "," + r + ",0,1," + cw + "," + (this._x1 = x0) + "," + (this._y1 = y0);
    } else if (da > epsilon$1) {
      this._ += "A" + r + "," + r + ",0," + +(da >= pi$1) + "," + cw + "," + (this._x1 = x2 + r * Math.cos(a1)) + "," + (this._y1 = y2 + r * Math.sin(a1));
    }
  },
  rect: function(x2, y2, w, h) {
    this._ += "M" + (this._x0 = this._x1 = +x2) + "," + (this._y0 = this._y1 = +y2) + "h" + +w + "v" + +h + "h" + -w + "Z";
  },
  toString: function() {
    return this._;
  }
};
function constant$5(x2) {
  return function constant2() {
    return x2;
  };
}
var abs = Math.abs;
var atan2 = Math.atan2;
var cos = Math.cos;
var max$2 = Math.max;
var min$2 = Math.min;
var sin = Math.sin;
var sqrt$1 = Math.sqrt;
var epsilon = 1e-12;
var pi = Math.PI;
var halfPi = pi / 2;
var tau = 2 * pi;
function acos(x2) {
  return x2 > 1 ? 0 : x2 < -1 ? pi : Math.acos(x2);
}
function asin(x2) {
  return x2 >= 1 ? halfPi : x2 <= -1 ? -halfPi : Math.asin(x2);
}
function arcInnerRadius(d) {
  return d.innerRadius;
}
function arcOuterRadius(d) {
  return d.outerRadius;
}
function arcStartAngle(d) {
  return d.startAngle;
}
function arcEndAngle(d) {
  return d.endAngle;
}
function arcPadAngle(d) {
  return d && d.padAngle;
}
function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
  var x10 = x1 - x0, y10 = y1 - y0, x32 = x3 - x2, y32 = y3 - y2, t = y32 * x10 - x32 * y10;
  if (t * t < epsilon) return;
  t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
  return [x0 + t * x10, y0 + t * y10];
}
function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
  var x01 = x0 - x1, y01 = y0 - y1, lo = (cw ? rc : -rc) / sqrt$1(x01 * x01 + y01 * y01), ox = lo * y01, oy = -lo * x01, x11 = x0 + ox, y11 = y0 + oy, x10 = x1 + ox, y10 = y1 + oy, x00 = (x11 + x10) / 2, y00 = (y11 + y10) / 2, dx = x10 - x11, dy = y10 - y11, d2 = dx * dx + dy * dy, r = r1 - rc, D2 = x11 * y10 - x10 * y11, d = (dy < 0 ? -1 : 1) * sqrt$1(max$2(0, r * r * d2 - D2 * D2)), cx0 = (D2 * dy - dx * d) / d2, cy0 = (-D2 * dx - dy * d) / d2, cx1 = (D2 * dy + dx * d) / d2, cy1 = (-D2 * dx + dy * d) / d2, dx0 = cx0 - x00, dy0 = cy0 - y00, dx1 = cx1 - x00, dy1 = cy1 - y00;
  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;
  return {
    cx: cx0,
    cy: cy0,
    x01: -ox,
    y01: -oy,
    x11: cx0 * (r1 / r - 1),
    y11: cy0 * (r1 / r - 1)
  };
}
function d3Arc() {
  var innerRadius = arcInnerRadius, outerRadius = arcOuterRadius, cornerRadius = constant$5(0), padRadius = null, startAngle = arcStartAngle, endAngle = arcEndAngle, padAngle = arcPadAngle, context = null;
  function arc2() {
    var buffer, r, r0 = +innerRadius.apply(this, arguments), r1 = +outerRadius.apply(this, arguments), a0 = startAngle.apply(this, arguments) - halfPi, a1 = endAngle.apply(this, arguments) - halfPi, da = abs(a1 - a0), cw = a1 > a0;
    if (!context) context = buffer = path();
    if (r1 < r0) r = r1, r1 = r0, r0 = r;
    if (!(r1 > epsilon)) context.moveTo(0, 0);
    else if (da > tau - epsilon) {
      context.moveTo(r1 * cos(a0), r1 * sin(a0));
      context.arc(0, 0, r1, a0, a1, !cw);
      if (r0 > epsilon) {
        context.moveTo(r0 * cos(a1), r0 * sin(a1));
        context.arc(0, 0, r0, a1, a0, cw);
      }
    } else {
      var a01 = a0, a11 = a1, a00 = a0, a10 = a1, da0 = da, da1 = da, ap = padAngle.apply(this, arguments) / 2, rp = ap > epsilon && (padRadius ? +padRadius.apply(this, arguments) : sqrt$1(r0 * r0 + r1 * r1)), rc = min$2(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)), rc0 = rc, rc1 = rc, t02, t12;
      if (rp > epsilon) {
        var p0 = asin(rp / r0 * sin(ap)), p1 = asin(rp / r1 * sin(ap));
        if ((da0 -= p0 * 2) > epsilon) p0 *= cw ? 1 : -1, a00 += p0, a10 -= p0;
        else da0 = 0, a00 = a10 = (a0 + a1) / 2;
        if ((da1 -= p1 * 2) > epsilon) p1 *= cw ? 1 : -1, a01 += p1, a11 -= p1;
        else da1 = 0, a01 = a11 = (a0 + a1) / 2;
      }
      var x01 = r1 * cos(a01), y01 = r1 * sin(a01), x10 = r0 * cos(a10), y10 = r0 * sin(a10);
      if (rc > epsilon) {
        var x11 = r1 * cos(a11), y11 = r1 * sin(a11), x00 = r0 * cos(a00), y00 = r0 * sin(a00), oc;
        if (da < pi && (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10))) {
          var ax = x01 - oc[0], ay = y01 - oc[1], bx = x11 - oc[0], by = y11 - oc[1], kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt$1(ax * ax + ay * ay) * sqrt$1(bx * bx + by * by))) / 2), lc = sqrt$1(oc[0] * oc[0] + oc[1] * oc[1]);
          rc0 = min$2(rc, (r0 - lc) / (kc - 1));
          rc1 = min$2(rc, (r1 - lc) / (kc + 1));
        }
      }
      if (!(da1 > epsilon)) context.moveTo(x01, y01);
      else if (rc1 > epsilon) {
        t02 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
        t12 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);
        context.moveTo(t02.cx + t02.x01, t02.cy + t02.y01);
        if (rc1 < rc) context.arc(t02.cx, t02.cy, rc1, atan2(t02.y01, t02.x01), atan2(t12.y01, t12.x01), !cw);
        else {
          context.arc(t02.cx, t02.cy, rc1, atan2(t02.y01, t02.x01), atan2(t02.y11, t02.x11), !cw);
          context.arc(0, 0, r1, atan2(t02.cy + t02.y11, t02.cx + t02.x11), atan2(t12.cy + t12.y11, t12.cx + t12.x11), !cw);
          context.arc(t12.cx, t12.cy, rc1, atan2(t12.y11, t12.x11), atan2(t12.y01, t12.x01), !cw);
        }
      } else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);
      if (!(r0 > epsilon) || !(da0 > epsilon)) context.lineTo(x10, y10);
      else if (rc0 > epsilon) {
        t02 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
        t12 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);
        context.lineTo(t02.cx + t02.x01, t02.cy + t02.y01);
        if (rc0 < rc) context.arc(t02.cx, t02.cy, rc0, atan2(t02.y01, t02.x01), atan2(t12.y01, t12.x01), !cw);
        else {
          context.arc(t02.cx, t02.cy, rc0, atan2(t02.y01, t02.x01), atan2(t02.y11, t02.x11), !cw);
          context.arc(0, 0, r0, atan2(t02.cy + t02.y11, t02.cx + t02.x11), atan2(t12.cy + t12.y11, t12.cx + t12.x11), cw);
          context.arc(t12.cx, t12.cy, rc0, atan2(t12.y11, t12.x11), atan2(t12.y01, t12.x01), !cw);
        }
      } else context.arc(0, 0, r0, a10, a00, cw);
    }
    context.closePath();
    if (buffer) return context = null, buffer + "" || null;
  }
  arc2.centroid = function() {
    var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2, a2 = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi / 2;
    return [cos(a2) * r, sin(a2) * r];
  };
  arc2.innerRadius = function(_) {
    return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant$5(+_), arc2) : innerRadius;
  };
  arc2.outerRadius = function(_) {
    return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant$5(+_), arc2) : outerRadius;
  };
  arc2.cornerRadius = function(_) {
    return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant$5(+_), arc2) : cornerRadius;
  };
  arc2.padRadius = function(_) {
    return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant$5(+_), arc2) : padRadius;
  };
  arc2.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$5(+_), arc2) : startAngle;
  };
  arc2.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$5(+_), arc2) : endAngle;
  };
  arc2.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$5(+_), arc2) : padAngle;
  };
  arc2.context = function(_) {
    return arguments.length ? (context = _ == null ? null : _, arc2) : context;
  };
  return arc2;
}
function Linear(context) {
  this._context = context;
}
Linear.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
      default:
        this._context.lineTo(x2, y2);
        break;
    }
  }
};
function curveLinear(context) {
  return new Linear(context);
}
function x(p) {
  return p[0];
}
function y(p) {
  return p[1];
}
function d3Line() {
  var x$1 = x, y$1 = y, defined = constant$5(true), context = null, curve = curveLinear, output = null;
  function line2(data) {
    var i, n = data.length, d, defined0 = false, buffer;
    if (context == null) output = curve(buffer = path());
    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) output.lineStart();
        else output.lineEnd();
      }
      if (defined0) output.point(+x$1(d, i, data), +y$1(d, i, data));
    }
    if (buffer) return output = null, buffer + "" || null;
  }
  line2.x = function(_) {
    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$5(+_), line2) : x$1;
  };
  line2.y = function(_) {
    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$5(+_), line2) : y$1;
  };
  line2.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$5(!!_), line2) : defined;
  };
  line2.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), line2) : curve;
  };
  line2.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line2) : context;
  };
  return line2;
}
function d3Area() {
  var x0 = x, x1 = null, y0 = constant$5(0), y1 = y, defined = constant$5(true), context = null, curve = curveLinear, output = null;
  function area2(data) {
    var i, j, k2, n = data.length, d, defined0 = false, buffer, x0z = new Array(n), y0z = new Array(n);
    if (context == null) output = curve(buffer = path());
    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) {
          j = i;
          output.areaStart();
          output.lineStart();
        } else {
          output.lineEnd();
          output.lineStart();
          for (k2 = i - 1; k2 >= j; --k2) {
            output.point(x0z[k2], y0z[k2]);
          }
          output.lineEnd();
          output.areaEnd();
        }
      }
      if (defined0) {
        x0z[i] = +x0(d, i, data), y0z[i] = +y0(d, i, data);
        output.point(x1 ? +x1(d, i, data) : x0z[i], y1 ? +y1(d, i, data) : y0z[i]);
      }
    }
    if (buffer) return output = null, buffer + "" || null;
  }
  function arealine() {
    return d3Line().defined(defined).curve(curve).context(context);
  }
  area2.x = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$5(+_), x1 = null, area2) : x0;
  };
  area2.x0 = function(_) {
    return arguments.length ? (x0 = typeof _ === "function" ? _ : constant$5(+_), area2) : x0;
  };
  area2.x1 = function(_) {
    return arguments.length ? (x1 = _ == null ? null : typeof _ === "function" ? _ : constant$5(+_), area2) : x1;
  };
  area2.y = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$5(+_), y1 = null, area2) : y0;
  };
  area2.y0 = function(_) {
    return arguments.length ? (y0 = typeof _ === "function" ? _ : constant$5(+_), area2) : y0;
  };
  area2.y1 = function(_) {
    return arguments.length ? (y1 = _ == null ? null : typeof _ === "function" ? _ : constant$5(+_), area2) : y1;
  };
  area2.lineX0 = area2.lineY0 = function() {
    return arealine().x(x0).y(y0);
  };
  area2.lineY1 = function() {
    return arealine().x(x0).y(y1);
  };
  area2.lineX1 = function() {
    return arealine().x(x1).y(y0);
  };
  area2.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant$5(!!_), area2) : defined;
  };
  area2.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), area2) : curve;
  };
  area2.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), area2) : context;
  };
  return area2;
}
function descending$3(a2, b) {
  return b < a2 ? -1 : b > a2 ? 1 : b >= a2 ? 0 : NaN;
}
function identity$7(d) {
  return d;
}
function d3Pie() {
  var value2 = identity$7, sortValues = descending$3, sort2 = null, startAngle = constant$5(0), endAngle = constant$5(tau), padAngle = constant$5(0);
  function pie2(data) {
    var i, n = data.length, j, k2, sum2 = 0, index2 = new Array(n), arcs = new Array(n), a0 = +startAngle.apply(this, arguments), da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0)), a1, p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)), pa = p * (da < 0 ? -1 : 1), v;
    for (i = 0; i < n; ++i) {
      if ((v = arcs[index2[i] = i] = +value2(data[i], i, data)) > 0) {
        sum2 += v;
      }
    }
    if (sortValues != null) index2.sort(function(i2, j2) {
      return sortValues(arcs[i2], arcs[j2]);
    });
    else if (sort2 != null) index2.sort(function(i2, j2) {
      return sort2(data[i2], data[j2]);
    });
    for (i = 0, k2 = sum2 ? (da - n * pa) / sum2 : 0; i < n; ++i, a0 = a1) {
      j = index2[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k2 : 0) + pa, arcs[j] = {
        data: data[j],
        index: i,
        value: v,
        startAngle: a0,
        endAngle: a1,
        padAngle: p
      };
    }
    return arcs;
  }
  pie2.value = function(_) {
    return arguments.length ? (value2 = typeof _ === "function" ? _ : constant$5(+_), pie2) : value2;
  };
  pie2.sortValues = function(_) {
    return arguments.length ? (sortValues = _, sort2 = null, pie2) : sortValues;
  };
  pie2.sort = function(_) {
    return arguments.length ? (sort2 = _, sortValues = null, pie2) : sort2;
  };
  pie2.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant$5(+_), pie2) : startAngle;
  };
  pie2.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant$5(+_), pie2) : endAngle;
  };
  pie2.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant$5(+_), pie2) : padAngle;
  };
  return pie2;
}
var curveRadialLinear = curveRadial$1(curveLinear);
function Radial(curve) {
  this._curve = curve;
}
Radial.prototype = {
  areaStart: function() {
    this._curve.areaStart();
  },
  areaEnd: function() {
    this._curve.areaEnd();
  },
  lineStart: function() {
    this._curve.lineStart();
  },
  lineEnd: function() {
    this._curve.lineEnd();
  },
  point: function(a2, r) {
    this._curve.point(r * Math.sin(a2), r * -Math.cos(a2));
  }
};
function curveRadial$1(curve) {
  function radial2(context) {
    return new Radial(curve(context));
  }
  radial2._curve = curve;
  return radial2;
}
function lineRadial(l) {
  var c6 = l.curve;
  l.angle = l.x, delete l.x;
  l.radius = l.y, delete l.y;
  l.curve = function(_) {
    return arguments.length ? c6(curveRadial$1(_)) : c6()._curve;
  };
  return l;
}
function d3RadialLine() {
  return lineRadial(d3Line().curve(curveRadialLinear));
}
function areaRadial() {
  var a2 = d3Area().curve(curveRadialLinear), c6 = a2.curve, x0 = a2.lineX0, x1 = a2.lineX1, y0 = a2.lineY0, y1 = a2.lineY1;
  a2.angle = a2.x, delete a2.x;
  a2.startAngle = a2.x0, delete a2.x0;
  a2.endAngle = a2.x1, delete a2.x1;
  a2.radius = a2.y, delete a2.y;
  a2.innerRadius = a2.y0, delete a2.y0;
  a2.outerRadius = a2.y1, delete a2.y1;
  a2.lineStartAngle = function() {
    return lineRadial(x0());
  }, delete a2.lineX0;
  a2.lineEndAngle = function() {
    return lineRadial(x1());
  }, delete a2.lineX1;
  a2.lineInnerRadius = function() {
    return lineRadial(y0());
  }, delete a2.lineY0;
  a2.lineOuterRadius = function() {
    return lineRadial(y1());
  }, delete a2.lineY1;
  a2.curve = function(_) {
    return arguments.length ? c6(curveRadial$1(_)) : c6()._curve;
  };
  return a2;
}
function pointRadial(x2, y2) {
  return [(y2 = +y2) * Math.cos(x2 -= Math.PI / 2), y2 * Math.sin(x2)];
}
var slice$1 = Array.prototype.slice;
function linkSource(d) {
  return d.source;
}
function linkTarget(d) {
  return d.target;
}
function link(curve) {
  var source = linkSource, target = linkTarget, x$1 = x, y$1 = y, context = null;
  function link2() {
    var buffer, argv = slice$1.call(arguments), s2 = source.apply(this, argv), t = target.apply(this, argv);
    if (!context) context = buffer = path();
    curve(context, +x$1.apply(this, (argv[0] = s2, argv)), +y$1.apply(this, argv), +x$1.apply(this, (argv[0] = t, argv)), +y$1.apply(this, argv));
    if (buffer) return context = null, buffer + "" || null;
  }
  link2.source = function(_) {
    return arguments.length ? (source = _, link2) : source;
  };
  link2.target = function(_) {
    return arguments.length ? (target = _, link2) : target;
  };
  link2.x = function(_) {
    return arguments.length ? (x$1 = typeof _ === "function" ? _ : constant$5(+_), link2) : x$1;
  };
  link2.y = function(_) {
    return arguments.length ? (y$1 = typeof _ === "function" ? _ : constant$5(+_), link2) : y$1;
  };
  link2.context = function(_) {
    return arguments.length ? (context = _ == null ? null : _, link2) : context;
  };
  return link2;
}
function curveHorizontal(context, x0, y0, x1, y1) {
  context.moveTo(x0, y0);
  context.bezierCurveTo(x0 = (x0 + x1) / 2, y0, x0, y1, x1, y1);
}
function curveVertical(context, x0, y0, x1, y1) {
  context.moveTo(x0, y0);
  context.bezierCurveTo(x0, y0 = (y0 + y1) / 2, x1, y0, x1, y1);
}
function curveRadial(context, x0, y0, x1, y1) {
  var p0 = pointRadial(x0, y0), p1 = pointRadial(x0, y0 = (y0 + y1) / 2), p2 = pointRadial(x1, y0), p3 = pointRadial(x1, y1);
  context.moveTo(p0[0], p0[1]);
  context.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
}
function linkHorizontal() {
  return link(curveHorizontal);
}
function linkVertical() {
  return link(curveVertical);
}
function linkRadial() {
  var l = link(curveRadial);
  l.angle = l.x, delete l.x;
  l.radius = l.y, delete l.y;
  return l;
}
const circle = {
  draw: function(context, size) {
    var r = Math.sqrt(size / pi);
    context.moveTo(r, 0);
    context.arc(0, 0, r, 0, tau);
  }
};
const cross$2 = {
  draw: function(context, size) {
    var r = Math.sqrt(size / 5) / 2;
    context.moveTo(-3 * r, -r);
    context.lineTo(-r, -r);
    context.lineTo(-r, -3 * r);
    context.lineTo(r, -3 * r);
    context.lineTo(r, -r);
    context.lineTo(3 * r, -r);
    context.lineTo(3 * r, r);
    context.lineTo(r, r);
    context.lineTo(r, 3 * r);
    context.lineTo(-r, 3 * r);
    context.lineTo(-r, r);
    context.lineTo(-3 * r, r);
    context.closePath();
  }
};
var tan30 = Math.sqrt(1 / 3), tan30_2 = tan30 * 2;
const diamond = {
  draw: function(context, size) {
    var y2 = Math.sqrt(size / tan30_2), x2 = y2 * tan30;
    context.moveTo(0, -y2);
    context.lineTo(x2, 0);
    context.lineTo(0, y2);
    context.lineTo(-x2, 0);
    context.closePath();
  }
};
var ka = 0.8908130915292852, kr = Math.sin(pi / 10) / Math.sin(7 * pi / 10), kx = Math.sin(tau / 10) * kr, ky = -Math.cos(tau / 10) * kr;
const star = {
  draw: function(context, size) {
    var r = Math.sqrt(size * ka), x2 = kx * r, y2 = ky * r;
    context.moveTo(0, -r);
    context.lineTo(x2, y2);
    for (var i = 1; i < 5; ++i) {
      var a2 = tau * i / 5, c6 = Math.cos(a2), s2 = Math.sin(a2);
      context.lineTo(s2 * r, -c6 * r);
      context.lineTo(c6 * x2 - s2 * y2, s2 * x2 + c6 * y2);
    }
    context.closePath();
  }
};
const square$1 = {
  draw: function(context, size) {
    var w = Math.sqrt(size), x2 = -w / 2;
    context.rect(x2, x2, w, w);
  }
};
var sqrt3 = Math.sqrt(3);
const triangle = {
  draw: function(context, size) {
    var y2 = -Math.sqrt(size / (sqrt3 * 3));
    context.moveTo(0, y2 * 2);
    context.lineTo(-sqrt3 * y2, -y2);
    context.lineTo(sqrt3 * y2, -y2);
    context.closePath();
  }
};
var c = -0.5, s = Math.sqrt(3) / 2, k = 1 / Math.sqrt(12), a = (k / 2 + 1) * 3;
const wye = {
  draw: function(context, size) {
    var r = Math.sqrt(size / a), x0 = r / 2, y0 = r * k, x1 = x0, y1 = r * k + r, x2 = -x1, y2 = y1;
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(c * x0 - s * y0, s * x0 + c * y0);
    context.lineTo(c * x1 - s * y1, s * x1 + c * y1);
    context.lineTo(c * x2 - s * y2, s * x2 + c * y2);
    context.lineTo(c * x0 + s * y0, c * y0 - s * x0);
    context.lineTo(c * x1 + s * y1, c * y1 - s * x1);
    context.lineTo(c * x2 + s * y2, c * y2 - s * x2);
    context.closePath();
  }
};
var symbols = [
  circle,
  cross$2,
  diamond,
  square$1,
  star,
  triangle,
  wye
];
function symbol() {
  var type = constant$5(circle), size = constant$5(64), context = null;
  function symbol2() {
    var buffer;
    if (!context) context = buffer = path();
    type.apply(this, arguments).draw(context, +size.apply(this, arguments));
    if (buffer) return context = null, buffer + "" || null;
  }
  symbol2.type = function(_) {
    return arguments.length ? (type = typeof _ === "function" ? _ : constant$5(_), symbol2) : type;
  };
  symbol2.size = function(_) {
    return arguments.length ? (size = typeof _ === "function" ? _ : constant$5(+_), symbol2) : size;
  };
  symbol2.context = function(_) {
    return arguments.length ? (context = _ == null ? null : _, symbol2) : context;
  };
  return symbol2;
}
function noop$1() {
}
function point$4(that, x2, y2) {
  that._context.bezierCurveTo(
    (2 * that._x0 + that._x1) / 3,
    (2 * that._y0 + that._y1) / 3,
    (that._x0 + 2 * that._x1) / 3,
    (that._y0 + 2 * that._y1) / 3,
    (that._x0 + 4 * that._x1 + x2) / 6,
    (that._y0 + 4 * that._y1 + y2) / 6
  );
}
function Basis(context) {
  this._context = context;
}
Basis.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 3:
        point$4(this, this._x1, this._y1);
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._context.lineTo((5 * this._x0 + this._x1) / 6, (5 * this._y0 + this._y1) / 6);
      default:
        point$4(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
  }
};
function basis$2(context) {
  return new Basis(context);
}
function BasisClosed(context) {
  this._context = context;
}
BasisClosed.prototype = {
  areaStart: noop$1,
  areaEnd: noop$1,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x2, this._y2);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.moveTo((this._x2 + 2 * this._x3) / 3, (this._y2 + 2 * this._y3) / 3);
        this._context.lineTo((this._x3 + 2 * this._x2) / 3, (this._y3 + 2 * this._y2) / 3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x2, this._y2);
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        break;
      }
    }
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._x2 = x2, this._y2 = y2;
        break;
      case 1:
        this._point = 2;
        this._x3 = x2, this._y3 = y2;
        break;
      case 2:
        this._point = 3;
        this._x4 = x2, this._y4 = y2;
        this._context.moveTo((this._x0 + 4 * this._x1 + x2) / 6, (this._y0 + 4 * this._y1 + y2) / 6);
        break;
      default:
        point$4(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
  }
};
function basisClosed$1(context) {
  return new BasisClosed(context);
}
function BasisOpen(context) {
  this._context = context;
}
BasisOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 3) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        var x0 = (this._x0 + 4 * this._x1 + x2) / 6, y0 = (this._y0 + 4 * this._y1 + y2) / 6;
        this._line ? this._context.lineTo(x0, y0) : this._context.moveTo(x0, y0);
        break;
      case 3:
        this._point = 4;
      default:
        point$4(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
  }
};
function basisOpen(context) {
  return new BasisOpen(context);
}
function Bundle(context, beta) {
  this._basis = new Basis(context);
  this._beta = beta;
}
Bundle.prototype = {
  lineStart: function() {
    this._x = [];
    this._y = [];
    this._basis.lineStart();
  },
  lineEnd: function() {
    var x2 = this._x, y2 = this._y, j = x2.length - 1;
    if (j > 0) {
      var x0 = x2[0], y0 = y2[0], dx = x2[j] - x0, dy = y2[j] - y0, i = -1, t;
      while (++i <= j) {
        t = i / j;
        this._basis.point(
          this._beta * x2[i] + (1 - this._beta) * (x0 + t * dx),
          this._beta * y2[i] + (1 - this._beta) * (y0 + t * dy)
        );
      }
    }
    this._x = this._y = null;
    this._basis.lineEnd();
  },
  point: function(x2, y2) {
    this._x.push(+x2);
    this._y.push(+y2);
  }
};
const bundle = function custom(beta) {
  function bundle2(context) {
    return beta === 1 ? new Basis(context) : new Bundle(context, beta);
  }
  bundle2.beta = function(beta2) {
    return custom(+beta2);
  };
  return bundle2;
}(0.85);
function point$3(that, x2, y2) {
  that._context.bezierCurveTo(
    that._x1 + that._k * (that._x2 - that._x0),
    that._y1 + that._k * (that._y2 - that._y0),
    that._x2 + that._k * (that._x1 - x2),
    that._y2 + that._k * (that._y1 - y2),
    that._x2,
    that._y2
  );
}
function Cardinal(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}
Cardinal.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        point$3(this, this._x1, this._y1);
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        this._x1 = x2, this._y1 = y2;
        break;
      case 2:
        this._point = 3;
      default:
        point$3(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const curveCardinal = function custom2(tension) {
  function cardinal(context) {
    return new Cardinal(context, tension);
  }
  cardinal.tension = function(tension2) {
    return custom2(+tension2);
  };
  return cardinal;
}(0);
function CardinalClosed(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}
CardinalClosed.prototype = {
  areaStart: noop$1,
  areaEnd: noop$1,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._x3 = x2, this._y3 = y2;
        break;
      case 1:
        this._point = 2;
        this._context.moveTo(this._x4 = x2, this._y4 = y2);
        break;
      case 2:
        this._point = 3;
        this._x5 = x2, this._y5 = y2;
        break;
      default:
        point$3(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const cardinalClosed = function custom3(tension) {
  function cardinal(context) {
    return new CardinalClosed(context, tension);
  }
  cardinal.tension = function(tension2) {
    return custom3(+tension2);
  };
  return cardinal;
}(0);
function CardinalOpen(context, tension) {
  this._context = context;
  this._k = (1 - tension) / 6;
}
CardinalOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 3) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
        break;
      case 3:
        this._point = 4;
      default:
        point$3(this, x2, y2);
        break;
    }
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const cardinalOpen = function custom4(tension) {
  function cardinal(context) {
    return new CardinalOpen(context, tension);
  }
  cardinal.tension = function(tension2) {
    return custom4(+tension2);
  };
  return cardinal;
}(0);
function point$2(that, x2, y2) {
  var x1 = that._x1, y1 = that._y1, x22 = that._x2, y22 = that._y2;
  if (that._l01_a > epsilon) {
    var a2 = 2 * that._l01_2a + 3 * that._l01_a * that._l12_a + that._l12_2a, n = 3 * that._l01_a * (that._l01_a + that._l12_a);
    x1 = (x1 * a2 - that._x0 * that._l12_2a + that._x2 * that._l01_2a) / n;
    y1 = (y1 * a2 - that._y0 * that._l12_2a + that._y2 * that._l01_2a) / n;
  }
  if (that._l23_a > epsilon) {
    var b = 2 * that._l23_2a + 3 * that._l23_a * that._l12_a + that._l12_2a, m = 3 * that._l23_a * (that._l23_a + that._l12_a);
    x22 = (x22 * b + that._x1 * that._l23_2a - x2 * that._l12_2a) / m;
    y22 = (y22 * b + that._y1 * that._l23_2a - y2 * that._l12_2a) / m;
  }
  that._context.bezierCurveTo(x1, y1, x22, y22, that._x2, that._y2);
}
function CatmullRom(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}
CatmullRom.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x2, this._y2);
        break;
      case 3:
        this.point(this._x2, this._y2);
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) {
      var x23 = this._x2 - x2, y23 = this._y2 - y2;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
      default:
        point$2(this, x2, y2);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const catmullRom = function custom5(alpha) {
  function catmullRom2(context) {
    return alpha ? new CatmullRom(context, alpha) : new Cardinal(context, 0);
  }
  catmullRom2.alpha = function(alpha2) {
    return custom5(+alpha2);
  };
  return catmullRom2;
}(0.5);
function CatmullRomClosed(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}
CatmullRomClosed.prototype = {
  areaStart: noop$1,
  areaEnd: noop$1,
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._x3 = this._x4 = this._x5 = this._y0 = this._y1 = this._y2 = this._y3 = this._y4 = this._y5 = NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 1: {
        this._context.moveTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 2: {
        this._context.lineTo(this._x3, this._y3);
        this._context.closePath();
        break;
      }
      case 3: {
        this.point(this._x3, this._y3);
        this.point(this._x4, this._y4);
        this.point(this._x5, this._y5);
        break;
      }
    }
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) {
      var x23 = this._x2 - x2, y23 = this._y2 - y2;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        this._x3 = x2, this._y3 = y2;
        break;
      case 1:
        this._point = 2;
        this._context.moveTo(this._x4 = x2, this._y4 = y2);
        break;
      case 2:
        this._point = 3;
        this._x5 = x2, this._y5 = y2;
        break;
      default:
        point$2(this, x2, y2);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const catmullRomClosed = function custom6(alpha) {
  function catmullRom2(context) {
    return alpha ? new CatmullRomClosed(context, alpha) : new CardinalClosed(context, 0);
  }
  catmullRom2.alpha = function(alpha2) {
    return custom6(+alpha2);
  };
  return catmullRom2;
}(0.5);
function CatmullRomOpen(context, alpha) {
  this._context = context;
  this._alpha = alpha;
}
CatmullRomOpen.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._x2 = this._y0 = this._y1 = this._y2 = NaN;
    this._l01_a = this._l12_a = this._l23_a = this._l01_2a = this._l12_2a = this._l23_2a = this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 3) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) {
      var x23 = this._x2 - x2, y23 = this._y2 - y2;
      this._l23_a = Math.sqrt(this._l23_2a = Math.pow(x23 * x23 + y23 * y23, this._alpha));
    }
    switch (this._point) {
      case 0:
        this._point = 1;
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        this._line ? this._context.lineTo(this._x2, this._y2) : this._context.moveTo(this._x2, this._y2);
        break;
      case 3:
        this._point = 4;
      default:
        point$2(this, x2, y2);
        break;
    }
    this._l01_a = this._l12_a, this._l12_a = this._l23_a;
    this._l01_2a = this._l12_2a, this._l12_2a = this._l23_2a;
    this._x0 = this._x1, this._x1 = this._x2, this._x2 = x2;
    this._y0 = this._y1, this._y1 = this._y2, this._y2 = y2;
  }
};
const catmullRomOpen = function custom7(alpha) {
  function catmullRom2(context) {
    return alpha ? new CatmullRomOpen(context, alpha) : new CardinalOpen(context, 0);
  }
  catmullRom2.alpha = function(alpha2) {
    return custom7(+alpha2);
  };
  return catmullRom2;
}(0.5);
function LinearClosed(context) {
  this._context = context;
}
LinearClosed.prototype = {
  areaStart: noop$1,
  areaEnd: noop$1,
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._point) this._context.closePath();
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    if (this._point) this._context.lineTo(x2, y2);
    else this._point = 1, this._context.moveTo(x2, y2);
  }
};
function linearClosed(context) {
  return new LinearClosed(context);
}
function sign(x2) {
  return x2 < 0 ? -1 : 1;
}
function slope3(that, x2, y2) {
  var h0 = that._x1 - that._x0, h1 = x2 - that._x1, s0 = (that._y1 - that._y0) / (h0 || h1 < 0 && -0), s1 = (y2 - that._y1) / (h1 || h0 < 0 && -0), p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}
function slope2(that, t) {
  var h = that._x1 - that._x0;
  return h ? (3 * (that._y1 - that._y0) / h - t) / 2 : t;
}
function point$1(that, t02, t12) {
  var x0 = that._x0, y0 = that._y0, x1 = that._x1, y1 = that._y1, dx = (x1 - x0) / 3;
  that._context.bezierCurveTo(x0 + dx, y0 + dx * t02, x1 - dx, y1 - dx * t12, x1, y1);
}
function MonotoneX(context) {
  this._context = context;
}
MonotoneX.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x0 = this._x1 = this._y0 = this._y1 = this._t0 = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    switch (this._point) {
      case 2:
        this._context.lineTo(this._x1, this._y1);
        break;
      case 3:
        point$1(this, this._t0, slope2(this, this._t0));
        break;
    }
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    var t12 = NaN;
    x2 = +x2, y2 = +y2;
    if (x2 === this._x1 && y2 === this._y1) return;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
        break;
      case 2:
        this._point = 3;
        point$1(this, slope2(this, t12 = slope3(this, x2, y2)), t12);
        break;
      default:
        point$1(this, this._t0, t12 = slope3(this, x2, y2));
        break;
    }
    this._x0 = this._x1, this._x1 = x2;
    this._y0 = this._y1, this._y1 = y2;
    this._t0 = t12;
  }
};
function MonotoneY(context) {
  this._context = new ReflectContext(context);
}
(MonotoneY.prototype = Object.create(MonotoneX.prototype)).point = function(x2, y2) {
  MonotoneX.prototype.point.call(this, y2, x2);
};
function ReflectContext(context) {
  this._context = context;
}
ReflectContext.prototype = {
  moveTo: function(x2, y2) {
    this._context.moveTo(y2, x2);
  },
  closePath: function() {
    this._context.closePath();
  },
  lineTo: function(x2, y2) {
    this._context.lineTo(y2, x2);
  },
  bezierCurveTo: function(x1, y1, x2, y2, x3, y3) {
    this._context.bezierCurveTo(y1, x1, y2, x2, y3, x3);
  }
};
function monotoneX(context) {
  return new MonotoneX(context);
}
function monotoneY(context) {
  return new MonotoneY(context);
}
function Natural(context) {
  this._context = context;
}
Natural.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = [];
    this._y = [];
  },
  lineEnd: function() {
    var x2 = this._x, y2 = this._y, n = x2.length;
    if (n) {
      this._line ? this._context.lineTo(x2[0], y2[0]) : this._context.moveTo(x2[0], y2[0]);
      if (n === 2) {
        this._context.lineTo(x2[1], y2[1]);
      } else {
        var px = controlPoints(x2), py = controlPoints(y2);
        for (var i0 = 0, i1 = 1; i1 < n; ++i0, ++i1) {
          this._context.bezierCurveTo(px[0][i0], py[0][i0], px[1][i0], py[1][i0], x2[i1], y2[i1]);
        }
      }
    }
    if (this._line || this._line !== 0 && n === 1) this._context.closePath();
    this._line = 1 - this._line;
    this._x = this._y = null;
  },
  point: function(x2, y2) {
    this._x.push(+x2);
    this._y.push(+y2);
  }
};
function controlPoints(x2) {
  var i, n = x2.length - 1, m, a2 = new Array(n), b = new Array(n), r = new Array(n);
  a2[0] = 0, b[0] = 2, r[0] = x2[0] + 2 * x2[1];
  for (i = 1; i < n - 1; ++i) a2[i] = 1, b[i] = 4, r[i] = 4 * x2[i] + 2 * x2[i + 1];
  a2[n - 1] = 2, b[n - 1] = 7, r[n - 1] = 8 * x2[n - 1] + x2[n];
  for (i = 1; i < n; ++i) m = a2[i] / b[i - 1], b[i] -= m, r[i] -= m * r[i - 1];
  a2[n - 1] = r[n - 1] / b[n - 1];
  for (i = n - 2; i >= 0; --i) a2[i] = (r[i] - a2[i + 1]) / b[i];
  b[n - 1] = (x2[n] + a2[n - 1]) / 2;
  for (i = 0; i < n - 1; ++i) b[i] = 2 * x2[i + 1] - a2[i + 1];
  return [a2, b];
}
function natural(context) {
  return new Natural(context);
}
function Step(context, t) {
  this._context = context;
  this._t = t;
}
Step.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._x = this._y = NaN;
    this._point = 0;
  },
  lineEnd: function() {
    if (0 < this._t && this._t < 1 && this._point === 2) this._context.lineTo(this._x, this._y);
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    if (this._line >= 0) this._t = 1 - this._t, this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
      default: {
        if (this._t <= 0) {
          this._context.lineTo(this._x, y2);
          this._context.lineTo(x2, y2);
        } else {
          var x1 = this._x * (1 - this._t) + x2 * this._t;
          this._context.lineTo(x1, this._y);
          this._context.lineTo(x1, y2);
        }
        break;
      }
    }
    this._x = x2, this._y = y2;
  }
};
function step(context) {
  return new Step(context, 0.5);
}
function stepBefore(context) {
  return new Step(context, 0);
}
function stepAfter(context) {
  return new Step(context, 1);
}
function stackOffsetNone(series, order) {
  if (!((n = series.length) > 1)) return;
  for (var i = 1, j, s0, s1 = series[order[0]], n, m = s1.length; i < n; ++i) {
    s0 = s1, s1 = series[order[i]];
    for (j = 0; j < m; ++j) {
      s1[j][1] += s1[j][0] = isNaN(s0[j][1]) ? s0[j][0] : s0[j][1];
    }
  }
}
function stackOrderNone(series) {
  var n = series.length, o = new Array(n);
  while (--n >= 0) o[n] = n;
  return o;
}
function stackValue(d, key) {
  return d[key];
}
function d3stack() {
  var keys = constant$5([]), order = stackOrderNone, offset = stackOffsetNone, value2 = stackValue;
  function stack2(data) {
    var kz = keys.apply(this, arguments), i, m = data.length, n = kz.length, sz = new Array(n), oz;
    for (i = 0; i < n; ++i) {
      for (var ki = kz[i], si = sz[i] = new Array(m), j = 0, sij; j < m; ++j) {
        si[j] = sij = [0, +value2(data[j], ki, j, data)];
        sij.data = data[j];
      }
      si.key = ki;
    }
    for (i = 0, oz = order(sz); i < n; ++i) {
      sz[oz[i]].index = i;
    }
    offset(sz, oz);
    return sz;
  }
  stack2.keys = function(_) {
    return arguments.length ? (keys = typeof _ === "function" ? _ : constant$5(slice$1.call(_)), stack2) : keys;
  };
  stack2.value = function(_) {
    return arguments.length ? (value2 = typeof _ === "function" ? _ : constant$5(+_), stack2) : value2;
  };
  stack2.order = function(_) {
    return arguments.length ? (order = _ == null ? stackOrderNone : typeof _ === "function" ? _ : constant$5(slice$1.call(_)), stack2) : order;
  };
  stack2.offset = function(_) {
    return arguments.length ? (offset = _ == null ? stackOffsetNone : _, stack2) : offset;
  };
  return stack2;
}
function stackOffsetExpand(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var i, n, j = 0, m = series[0].length, y2; j < m; ++j) {
    for (y2 = i = 0; i < n; ++i) y2 += series[i][j][1] || 0;
    if (y2) for (i = 0; i < n; ++i) series[i][j][1] /= y2;
  }
  stackOffsetNone(series, order);
}
function stackOffsetDiverging(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var i, j = 0, d, dy, yp, yn, n, m = series[order[0]].length; j < m; ++j) {
    for (yp = yn = 0, i = 0; i < n; ++i) {
      if ((dy = (d = series[order[i]][j])[1] - d[0]) > 0) {
        d[0] = yp, d[1] = yp += dy;
      } else if (dy < 0) {
        d[1] = yn, d[0] = yn += dy;
      } else {
        d[0] = 0, d[1] = dy;
      }
    }
  }
}
function stackOffsetSilhouette(series, order) {
  if (!((n = series.length) > 0)) return;
  for (var j = 0, s0 = series[order[0]], n, m = s0.length; j < m; ++j) {
    for (var i = 0, y2 = 0; i < n; ++i) y2 += series[i][j][1] || 0;
    s0[j][1] += s0[j][0] = -y2 / 2;
  }
  stackOffsetNone(series, order);
}
function stackOffsetWiggle(series, order) {
  if (!((n = series.length) > 0) || !((m = (s0 = series[order[0]]).length) > 0)) return;
  for (var y2 = 0, j = 1, s0, m, n; j < m; ++j) {
    for (var i = 0, s1 = 0, s2 = 0; i < n; ++i) {
      var si = series[order[i]], sij0 = si[j][1] || 0, sij1 = si[j - 1][1] || 0, s3 = (sij0 - sij1) / 2;
      for (var k2 = 0; k2 < i; ++k2) {
        var sk = series[order[k2]], skj0 = sk[j][1] || 0, skj1 = sk[j - 1][1] || 0;
        s3 += skj0 - skj1;
      }
      s1 += sij0, s2 += s3 * sij0;
    }
    s0[j - 1][1] += s0[j - 1][0] = y2;
    if (s1) y2 -= s2 / s1;
  }
  s0[j - 1][1] += s0[j - 1][0] = y2;
  stackOffsetNone(series, order);
}
function appearance(series) {
  var peaks = series.map(peak);
  return stackOrderNone(series).sort(function(a2, b) {
    return peaks[a2] - peaks[b];
  });
}
function peak(series) {
  var i = -1, j = 0, n = series.length, vi, vj = -Infinity;
  while (++i < n) if ((vi = +series[i][1]) > vj) vj = vi, j = i;
  return j;
}
function stackOrderAscending(series) {
  var sums = series.map(sum$2);
  return stackOrderNone(series).sort(function(a2, b) {
    return sums[a2] - sums[b];
  });
}
function sum$2(series) {
  var s2 = 0, i = -1, n = series.length, v;
  while (++i < n) if (v = +series[i][1]) s2 += v;
  return s2;
}
function stackOrderDescending(series) {
  return stackOrderAscending(series).reverse();
}
function stackOrderInsideOut(series) {
  var n = series.length, i, j, sums = series.map(sum$2), order = appearance(series), top = 0, bottom = 0, tops = [], bottoms = [];
  for (i = 0; i < n; ++i) {
    j = order[i];
    if (top < bottom) {
      top += sums[j];
      tops.push(j);
    } else {
      bottom += sums[j];
      bottoms.push(j);
    }
  }
  return bottoms.reverse().concat(tops);
}
function stackOrderReverse(series) {
  return stackOrderNone(series).reverse();
}
const src$8 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  arc: d3Arc,
  area: d3Area,
  areaRadial,
  curveBasis: basis$2,
  curveBasisClosed: basisClosed$1,
  curveBasisOpen: basisOpen,
  curveBundle: bundle,
  curveCardinal,
  curveCardinalClosed: cardinalClosed,
  curveCardinalOpen: cardinalOpen,
  curveCatmullRom: catmullRom,
  curveCatmullRomClosed: catmullRomClosed,
  curveCatmullRomOpen: catmullRomOpen,
  curveLinear,
  curveLinearClosed: linearClosed,
  curveMonotoneX: monotoneX,
  curveMonotoneY: monotoneY,
  curveNatural: natural,
  curveStep: step,
  curveStepAfter: stepAfter,
  curveStepBefore: stepBefore,
  line: d3Line,
  lineRadial: d3RadialLine,
  linkHorizontal,
  linkRadial,
  linkVertical,
  pie: d3Pie,
  pointRadial,
  radialArea: areaRadial,
  radialLine: d3RadialLine,
  stack: d3stack,
  stackOffsetDiverging,
  stackOffsetExpand,
  stackOffsetNone,
  stackOffsetSilhouette,
  stackOffsetWiggle,
  stackOrderAppearance: appearance,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderInsideOut,
  stackOrderNone,
  stackOrderReverse,
  symbol,
  symbolCircle: circle,
  symbolCross: cross$2,
  symbolDiamond: diamond,
  symbolSquare: square$1,
  symbolStar: star,
  symbolTriangle: triangle,
  symbolWye: wye,
  symbols
}, Symbol.toStringTag, { value: "Module" }));
var propTypes = { exports: {} };
var ReactPropTypesSecret$1 = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
var ReactPropTypesSecret_1 = ReactPropTypesSecret$1;
var ReactPropTypesSecret = ReactPropTypesSecret_1;
function emptyFunction() {
}
function emptyFunctionWithReset() {
}
emptyFunctionWithReset.resetWarningCache = emptyFunction;
var factoryWithThrowingShims = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      return;
    }
    var err = new Error(
      "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types"
    );
    err.name = "Invariant Violation";
    throw err;
  }
  shim.isRequired = shim;
  function getShim() {
    return shim;
  }
  var ReactPropTypes = {
    array: shim,
    bigint: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,
    any: shim,
    arrayOf: getShim,
    element: shim,
    elementType: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim,
    exact: getShim,
    checkPropTypes: emptyFunctionWithReset,
    resetWarningCache: emptyFunction
  };
  ReactPropTypes.PropTypes = ReactPropTypes;
  return ReactPropTypes;
};
{
  propTypes.exports = factoryWithThrowingShims();
}
var propTypesExports = propTypes.exports;
const _pt = /* @__PURE__ */ getDefaultExportFromCjs(propTypesExports);
var classnames = { exports: {} };
/*!
	Copyright (c) 2018 Jed Watson.
	Licensed under the MIT License (MIT), see
	http://jedwatson.github.io/classnames
*/
(function(module) {
  (function() {
    var hasOwn = {}.hasOwnProperty;
    function classNames() {
      var classes = "";
      for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (arg) {
          classes = appendClass(classes, parseValue(arg));
        }
      }
      return classes;
    }
    function parseValue(arg) {
      if (typeof arg === "string" || typeof arg === "number") {
        return arg;
      }
      if (typeof arg !== "object") {
        return "";
      }
      if (Array.isArray(arg)) {
        return classNames.apply(null, arg);
      }
      if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes("[native code]")) {
        return arg.toString();
      }
      var classes = "";
      for (var key in arg) {
        if (hasOwn.call(arg, key) && arg[key]) {
          classes = appendClass(classes, key);
        }
      }
      return classes;
    }
    function appendClass(value2, newClass) {
      if (!newClass) {
        return value2;
      }
      if (value2) {
        return value2 + " " + newClass;
      }
      return value2 + newClass;
    }
    if (module.exports) {
      classNames.default = classNames;
      module.exports = classNames;
    } else {
      window.classNames = classNames;
    }
  })();
})(classnames);
var classnamesExports = classnames.exports;
const cx = /* @__PURE__ */ getDefaultExportFromCjs(classnamesExports);
var _excluded$D = ["top", "left", "transform", "className", "children", "innerRef"];
function _extends$S() {
  _extends$S = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$S.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$D(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function Group(_ref) {
  var _ref$top = _ref.top, top = _ref$top === void 0 ? 0 : _ref$top, _ref$left = _ref.left, left = _ref$left === void 0 ? 0 : _ref$left, transform2 = _ref.transform, className = _ref.className, children = _ref.children, innerRef = _ref.innerRef, restProps = _objectWithoutPropertiesLoose$D(_ref, _excluded$D);
  return /* @__PURE__ */ React.createElement("g", _extends$S({
    ref: innerRef,
    className: cx("visx-group", className),
    transform: transform2 || "translate(" + left + ", " + top + ")"
  }, restProps), children);
}
Group.propTypes = {
  top: _pt.number,
  left: _pt.number,
  transform: _pt.string,
  className: _pt.string,
  children: _pt.node,
  innerRef: _pt.oneOfType([_pt.string, _pt.func, _pt.object])
};
const esm$4 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Group
}, Symbol.toStringTag, { value: "Module" }));
var balancedMatch$1 = balanced$3;
function balanced$3(a2, b, str) {
  if (a2 instanceof RegExp) a2 = maybeMatch$1(a2, str);
  if (b instanceof RegExp) b = maybeMatch$1(b, str);
  var r = range$5(a2, b, str);
  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a2.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}
function maybeMatch$1(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}
balanced$3.range = range$5;
function range$5(a2, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a2);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;
  if (ai >= 0 && bi > 0) {
    begs = [];
    left = str.length;
    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a2, i + 1);
      } else if (begs.length == 1) {
        result = [begs.pop(), bi];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }
        bi = str.indexOf(b, i + 1);
      }
      i = ai < bi && ai >= 0 ? ai : bi;
    }
    if (begs.length) {
      result = [left, right];
    }
  }
  return result;
}
var balancedMatch = balanced$2;
function balanced$2(a2, b, str) {
  if (a2 instanceof RegExp) a2 = maybeMatch(a2, str);
  if (b instanceof RegExp) b = maybeMatch(b, str);
  var r = range$4(a2, b, str);
  return r && {
    start: r[0],
    end: r[1],
    pre: str.slice(0, r[0]),
    body: str.slice(r[0] + a2.length, r[1]),
    post: str.slice(r[1] + b.length)
  };
}
function maybeMatch(reg, str) {
  var m = str.match(reg);
  return m ? m[0] : null;
}
balanced$2.range = range$4;
function range$4(a2, b, str) {
  var begs, beg, left, right, result;
  var ai = str.indexOf(a2);
  var bi = str.indexOf(b, ai + 1);
  var i = ai;
  if (ai >= 0 && bi > 0) {
    if (a2 === b) {
      return [ai, bi];
    }
    begs = [];
    left = str.length;
    while (i >= 0 && !result) {
      if (i == ai) {
        begs.push(i);
        ai = str.indexOf(a2, i + 1);
      } else if (begs.length == 1) {
        result = [begs.pop(), bi];
      } else {
        beg = begs.pop();
        if (beg < left) {
          left = beg;
          right = bi;
        }
        bi = str.indexOf(b, i + 1);
      }
      i = ai < bi && ai >= 0 ? ai : bi;
    }
    if (begs.length) {
      result = [left, right];
    }
  }
  return result;
}
var balanced$1 = balancedMatch;
var reduceFunctionCall_1 = reduceFunctionCall$1;
function reduceFunctionCall$1(string2, functionRE, callback) {
  var call2 = string2;
  return getFunctionCalls(string2, functionRE).reduce(function(string3, obj) {
    return string3.replace(obj.functionIdentifier + "(" + obj.matches.body + ")", evalFunctionCall(obj.matches.body, obj.functionIdentifier, callback, call2, functionRE));
  }, string2);
}
function getFunctionCalls(call2, functionRE) {
  var expressions = [];
  var fnRE = typeof functionRE === "string" ? new RegExp("\\b(" + functionRE + ")\\(") : functionRE;
  do {
    var searchMatch = fnRE.exec(call2);
    if (!searchMatch) {
      return expressions;
    }
    if (searchMatch[1] === void 0) {
      throw new Error("Missing the first couple of parenthesis to get the function identifier in " + functionRE);
    }
    var fn = searchMatch[1];
    var startIndex = searchMatch.index;
    var matches = balanced$1("(", ")", call2.substring(startIndex));
    if (!matches || matches.start !== searchMatch[0].length - 1) {
      throw new SyntaxError(fn + "(): missing closing ')' in the value '" + call2 + "'");
    }
    expressions.push({ matches, functionIdentifier: fn });
    call2 = matches.post;
  } while (fnRE.test(call2));
  return expressions;
}
function evalFunctionCall(string2, functionIdentifier, callback, call2, functionRE) {
  return callback(reduceFunctionCall$1(string2, functionRE, callback), functionIdentifier, call2);
}
var Mexp$4 = function(parsed) {
  this.value = parsed;
};
Mexp$4.math = {
  isDegree: true,
  // mode of calculator
  acos: function(x2) {
    return Mexp$4.math.isDegree ? 180 / Math.PI * Math.acos(x2) : Math.acos(x2);
  },
  add: function(a2, b) {
    return a2 + b;
  },
  asin: function(x2) {
    return Mexp$4.math.isDegree ? 180 / Math.PI * Math.asin(x2) : Math.asin(x2);
  },
  atan: function(x2) {
    return Mexp$4.math.isDegree ? 180 / Math.PI * Math.atan(x2) : Math.atan(x2);
  },
  acosh: function(x2) {
    return Math.log(x2 + Math.sqrt(x2 * x2 - 1));
  },
  asinh: function(x2) {
    return Math.log(x2 + Math.sqrt(x2 * x2 + 1));
  },
  atanh: function(x2) {
    return Math.log((1 + x2) / (1 - x2));
  },
  C: function(n, r) {
    var pro = 1;
    var other = n - r;
    var choice = r;
    if (choice < other) {
      choice = other;
      other = r;
    }
    for (var i = choice + 1; i <= n; i++) {
      pro *= i;
    }
    return pro / Mexp$4.math.fact(other);
  },
  changeSign: function(x2) {
    return -x2;
  },
  cos: function(x2) {
    if (Mexp$4.math.isDegree) x2 = Mexp$4.math.toRadian(x2);
    return Math.cos(x2);
  },
  cosh: function(x2) {
    return (Math.pow(Math.E, x2) + Math.pow(Math.E, -1 * x2)) / 2;
  },
  div: function(a2, b) {
    return a2 / b;
  },
  fact: function(n) {
    if (n % 1 !== 0) return "NaN";
    var pro = 1;
    for (var i = 2; i <= n; i++) {
      pro *= i;
    }
    return pro;
  },
  inverse: function(x2) {
    return 1 / x2;
  },
  log: function(i) {
    return Math.log(i) / Math.log(10);
  },
  mod: function(a2, b) {
    return a2 % b;
  },
  mul: function(a2, b) {
    return a2 * b;
  },
  P: function(n, r) {
    var pro = 1;
    for (var i = Math.floor(n) - Math.floor(r) + 1; i <= Math.floor(n); i++) {
      pro *= i;
    }
    return pro;
  },
  Pi: function(low, high, ex) {
    var pro = 1;
    for (var i = low; i <= high; i++) {
      pro *= Number(ex.postfixEval({
        n: i
      }));
    }
    return pro;
  },
  pow10x: function(e) {
    var x2 = 1;
    while (e--) {
      x2 *= 10;
    }
    return x2;
  },
  sigma: function(low, high, ex) {
    var sum2 = 0;
    for (var i = low; i <= high; i++) {
      sum2 += Number(ex.postfixEval({
        n: i
      }));
    }
    return sum2;
  },
  sin: function(x2) {
    if (Mexp$4.math.isDegree) x2 = Mexp$4.math.toRadian(x2);
    return Math.sin(x2);
  },
  sinh: function(x2) {
    return (Math.pow(Math.E, x2) - Math.pow(Math.E, -1 * x2)) / 2;
  },
  sub: function(a2, b) {
    return a2 - b;
  },
  tan: function(x2) {
    if (Mexp$4.math.isDegree) x2 = Mexp$4.math.toRadian(x2);
    return Math.tan(x2);
  },
  tanh: function(x2) {
    return Mexp$4.sinha(x2) / Mexp$4.cosha(x2);
  },
  toRadian: function(x2) {
    return x2 * Math.PI / 180;
  },
  and: function(a2, b) {
    return a2 & b;
  }
};
Mexp$4.Exception = function(message) {
  this.message = message;
};
var math_function = Mexp$4;
var Mexp$3 = math_function;
function inc(arr, val) {
  for (var i = 0; i < arr.length; i++) {
    arr[i] += val;
  }
  return arr;
}
var tokens = [
  { token: "sin", show: "sin", type: 0, value: Mexp$3.math.sin },
  { token: "cos", show: "cos", type: 0, value: Mexp$3.math.cos },
  { token: "tan", show: "tan", type: 0, value: Mexp$3.math.tan },
  { token: "pi", show: "&pi;", type: 3, value: "PI" },
  { token: "(", show: "(", type: 4, value: "(" },
  { token: ")", show: ")", type: 5, value: ")" },
  { token: "P", show: "P", type: 10, value: Mexp$3.math.P },
  { token: "C", show: "C", type: 10, value: Mexp$3.math.C },
  { token: " ", show: " ", type: 14, value: " ".anchor },
  { token: "asin", show: "asin", type: 0, value: Mexp$3.math.asin },
  { token: "acos", show: "acos", type: 0, value: Mexp$3.math.acos },
  { token: "atan", show: "atan", type: 0, value: Mexp$3.math.atan },
  { token: "7", show: "7", type: 1, value: "7" },
  { token: "8", show: "8", type: 1, value: "8" },
  { token: "9", show: "9", type: 1, value: "9" },
  { token: "int", show: "Int", type: 0, value: Math.floor },
  { token: "cosh", show: "cosh", type: 0, value: Mexp$3.math.cosh },
  { token: "acosh", show: "acosh", type: 0, value: Mexp$3.math.acosh },
  { token: "ln", show: " ln", type: 0, value: Math.log },
  { token: "^", show: "^", type: 10, value: Math.pow },
  { token: "root", show: "root", type: 0, value: Math.sqrt },
  { token: "4", show: "4", type: 1, value: "4" },
  { token: "5", show: "5", type: 1, value: "5" },
  { token: "6", show: "6", type: 1, value: "6" },
  { token: "/", show: "&divide;", type: 2, value: Mexp$3.math.div },
  { token: "!", show: "!", type: 7, value: Mexp$3.math.fact },
  { token: "tanh", show: "tanh", type: 0, value: Mexp$3.math.tanh },
  { token: "atanh", show: "atanh", type: 0, value: Mexp$3.math.atanh },
  { token: "Mod", show: " Mod ", type: 2, value: Mexp$3.math.mod },
  { token: "1", show: "1", type: 1, value: "1" },
  { token: "2", show: "2", type: 1, value: "2" },
  { token: "3", show: "3", type: 1, value: "3" },
  { token: "*", show: "&times;", type: 2, value: Mexp$3.math.mul },
  { token: "sinh", show: "sinh", type: 0, value: Mexp$3.math.sinh },
  { token: "asinh", show: "asinh", type: 0, value: Mexp$3.math.asinh },
  { token: "e", show: "e", type: 3, value: "E" },
  { token: "log", show: " log", type: 0, value: Mexp$3.math.log },
  { token: "0", show: "0", type: 1, value: "0" },
  { token: ".", show: ".", type: 6, value: "." },
  { token: "+", show: "+", type: 9, value: Mexp$3.math.add },
  { token: "-", show: "-", type: 9, value: Mexp$3.math.sub },
  { token: ",", show: ",", type: 11, value: "," },
  { token: "Sigma", show: "&Sigma;", type: 12, value: Mexp$3.math.sigma },
  { token: "n", show: "n", type: 13, value: "n" },
  { token: "Pi", show: "&Pi;", type: 12, value: Mexp$3.math.Pi },
  { token: "pow", show: "pow", type: 8, value: Math.pow, numberOfArguments: 2 },
  { token: "&", show: "&", type: 9, value: Mexp$3.math.and }
];
var preced = {
  0: 11,
  1: 0,
  2: 3,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 11,
  8: 11,
  9: 1,
  10: 10,
  11: 0,
  12: 11,
  13: 0,
  14: -1,
  15: 11
  // will be filtered after lexer
};
for (var i = 0; i < tokens.length; i++) {
  tokens[i].precedence = preced[tokens[i].type];
}
var type0 = {
  0: true,
  1: true,
  3: true,
  4: true,
  6: true,
  8: true,
  9: true,
  12: true,
  13: true,
  14: true,
  15: true
};
var type1 = {
  0: true,
  1: true,
  2: true,
  3: true,
  4: true,
  5: true,
  6: true,
  7: true,
  8: true,
  9: true,
  10: true,
  11: true,
  12: true,
  13: true,
  15: true
};
var type1Asterick = {
  0: true,
  3: true,
  4: true,
  8: true,
  12: true,
  13: true,
  15: true
};
var empty$1 = {};
var type3Asterick = {
  0: true,
  1: true,
  3: true,
  4: true,
  6: true,
  8: true,
  12: true,
  13: true,
  15: true
};
var type6 = {
  1: true
};
var newAr = [
  [],
  [
    "1",
    "2",
    "3",
    "7",
    "8",
    "9",
    "4",
    "5",
    "6",
    "+",
    "-",
    "*",
    "/",
    "(",
    ")",
    "^",
    "!",
    "P",
    "C",
    "e",
    "0",
    ".",
    ",",
    "n",
    " ",
    "&"
  ],
  ["pi", "ln", "Pi"],
  ["sin", "cos", "tan", "Del", "int", "Mod", "log", "pow"],
  ["asin", "acos", "atan", "cosh", "root", "tanh", "sinh"],
  ["acosh", "atanh", "asinh", "Sigma"]
];
function match(str1, str2, i, x2) {
  for (var f = 0; f < x2; f++) {
    if (str1[i + f] !== str2[f]) {
      return false;
    }
  }
  return true;
}
Mexp$3.tokenTypes = {
  FUNCTION_WITH_ONE_ARG: 0,
  NUMBER: 1,
  BINARY_OPERATOR_HIGH_PRECENDENCE: 2,
  CONSTANT: 3,
  OPENING_PARENTHESIS: 4,
  CLOSING_PARENTHESIS: 5,
  DECIMAL: 6,
  POSTFIX_FUNCTION_WITH_ONE_ARG: 7,
  FUNCTION_WITH_N_ARGS: 8,
  BINARY_OPERATOR_LOW_PRECENDENCE: 9,
  BINARY_OPERATOR_PERMUTATION: 10,
  COMMA: 11,
  EVALUATED_FUNCTION: 12,
  EVALUATED_FUNCTION_PARAMETER: 13,
  SPACE: 14
};
Mexp$3.addToken = function(newTokens) {
  for (var i = 0; i < newTokens.length; i++) {
    var x2 = newTokens[i].token.length;
    var temp = -1;
    if (newTokens[i].type === Mexp$3.tokenTypes.FUNCTION_WITH_N_ARGS && newTokens[i].numberOfArguments === void 0) {
      newTokens[i].numberOfArguments = 2;
    }
    newAr[x2] = newAr[x2] || [];
    for (var y2 = 0; y2 < newAr[x2].length; y2++) {
      if (newTokens[i].token === newAr[x2][y2]) {
        temp = indexOfToken(newAr[x2][y2], tokens);
        break;
      }
    }
    if (temp === -1) {
      tokens.push(newTokens[i]);
      newTokens[i].precedence = preced[newTokens[i].type];
      if (newAr.length <= newTokens[i].token.length) {
        newAr[newTokens[i].token.length] = [];
      }
      newAr[newTokens[i].token.length].push(newTokens[i].token);
    } else {
      tokens[temp] = newTokens[i];
      newTokens[i].precedence = preced[newTokens[i].type];
    }
  }
};
function indexOfToken(key, tokens2) {
  for (var search = 0; search < tokens2.length; search++) {
    if (tokens2[search].token === key) return search;
  }
  return -1;
}
function tokenize(string2) {
  var nodes = [];
  var length2 = string2.length;
  var key, x2, y2;
  for (var i = 0; i < length2; i++) {
    if (i < length2 - 1 && string2[i] === " " && string2[i + 1] === " ") {
      continue;
    }
    key = "";
    for (x2 = string2.length - i > newAr.length - 2 ? newAr.length - 1 : string2.length - i; x2 > 0; x2--) {
      if (newAr[x2] === void 0) continue;
      for (y2 = 0; y2 < newAr[x2].length; y2++) {
        if (match(string2, newAr[x2][y2], i, x2)) {
          key = newAr[x2][y2];
          y2 = newAr[x2].length;
          x2 = 0;
        }
      }
    }
    i += key.length - 1;
    if (key === "") {
      throw new Mexp$3.Exception("Can't understand after " + string2.slice(i));
    }
    nodes.push(tokens[indexOfToken(key, tokens)]);
  }
  return nodes;
}
var changeSignObj = {
  value: Mexp$3.math.changeSign,
  type: 0,
  pre: 21,
  show: "-"
};
var closingParObj = {
  value: ")",
  show: ")",
  type: 5,
  pre: 0
};
var openingParObj = {
  value: "(",
  type: 4,
  pre: 0,
  show: "("
};
Mexp$3.lex = function(inp, tokens2) {
  var str = [openingParObj];
  var ptc = [];
  var inpStr = inp;
  var allowed = type0;
  var bracToClose = 0;
  var asterick = empty$1;
  var prevKey = "";
  var i;
  if (typeof tokens2 !== "undefined") {
    Mexp$3.addToken(tokens2);
  }
  var obj = {};
  var nodes = tokenize(inpStr);
  for (i = 0; i < nodes.length; i++) {
    var node = nodes[i];
    if (node.type === 14) {
      if (i > 0 && i < nodes.length - 1 && nodes[i + 1].type === 1 && (nodes[i - 1].type === 1 || nodes[i - 1].type === 6)) {
        throw new Mexp$3.Exception("Unexpected Space");
      }
      continue;
    }
    var cToken = node.token;
    var cType = node.type;
    var cEv = node.value;
    var cPre = node.precedence;
    var cShow = node.show;
    var pre = str[str.length - 1];
    var j;
    for (j = ptc.length; j--; ) {
      if (ptc[j] === 0) {
        if ([0, 2, 3, 4, 5, 9, 11, 12, 13].indexOf(cType) !== -1) {
          if (allowed[cType] !== true) {
            throw new Mexp$3.Exception(cToken + " is not allowed after " + prevKey);
          }
          str.push(closingParObj);
          allowed = type1;
          asterick = type3Asterick;
          ptc.pop();
        }
      } else break;
    }
    if (allowed[cType] !== true) {
      throw new Mexp$3.Exception(cToken + " is not allowed after " + prevKey);
    }
    if (asterick[cType] === true) {
      cType = 2;
      cEv = Mexp$3.math.mul;
      cShow = "&times;";
      cPre = 3;
      i = i - 1;
    }
    obj = {
      value: cEv,
      type: cType,
      pre: cPre,
      show: cShow,
      numberOfArguments: node.numberOfArguments
    };
    if (cType === 0) {
      allowed = type0;
      asterick = empty$1;
      inc(ptc, 2);
      str.push(obj);
      if (nodes[i + 1].type !== 4) {
        str.push(openingParObj);
        ptc.push(2);
      }
    } else if (cType === 1) {
      if (pre.type === 1) {
        pre.value += cEv;
        inc(ptc, 1);
      } else {
        str.push(obj);
      }
      allowed = type1;
      asterick = type1Asterick;
    } else if (cType === 2) {
      allowed = type0;
      asterick = empty$1;
      inc(ptc, 2);
      str.push(obj);
    } else if (cType === 3) {
      str.push(obj);
      allowed = type1;
      asterick = type3Asterick;
    } else if (cType === 4) {
      inc(ptc, 1);
      bracToClose++;
      allowed = type0;
      asterick = empty$1;
      str.push(obj);
    } else if (cType === 5) {
      if (!bracToClose) {
        throw new Mexp$3.Exception("Closing parenthesis are more than opening one, wait What!!!");
      }
      bracToClose--;
      allowed = type1;
      asterick = type3Asterick;
      str.push(obj);
      inc(ptc, 1);
    } else if (cType === 6) {
      if (pre.hasDec) {
        throw new Mexp$3.Exception("Two decimals are not allowed in one number");
      }
      if (pre.type !== 1) {
        pre = {
          value: 0,
          type: 1,
          pre: 0
        };
        str.push(pre);
      }
      allowed = type6;
      inc(ptc, 1);
      asterick = empty$1;
      pre.value += cEv;
      pre.hasDec = true;
    } else if (cType === 7) {
      allowed = type1;
      asterick = type3Asterick;
      inc(ptc, 1);
      str.push(obj);
    }
    if (cType === 8) {
      allowed = type0;
      asterick = empty$1;
      inc(ptc, node.numberOfArguments + 2);
      str.push(obj);
      if (nodes[i + 1].type !== 4) {
        str.push(openingParObj);
        ptc.push(node.numberOfArguments + 2);
      }
    } else if (cType === 9) {
      if (pre.type === 9) {
        if (pre.value === Mexp$3.math.add) {
          pre.value = cEv;
          pre.show = cShow;
          inc(ptc, 1);
        } else if (pre.value === Mexp$3.math.sub && cShow === "-") {
          pre.value = Mexp$3.math.add;
          pre.show = "+";
          inc(ptc, 1);
        }
      } else if (pre.type !== 5 && pre.type !== 7 && pre.type !== 1 && pre.type !== 3 && pre.type !== 13) {
        if (cToken === "-") {
          allowed = type0;
          asterick = empty$1;
          inc(ptc, 2).push(2);
          str.push(changeSignObj);
          str.push(openingParObj);
        }
      } else {
        str.push(obj);
        inc(ptc, 2);
      }
      allowed = type0;
      asterick = empty$1;
    } else if (cType === 10) {
      allowed = type0;
      asterick = empty$1;
      inc(ptc, 2);
      str.push(obj);
    } else if (cType === 11) {
      allowed = type0;
      asterick = empty$1;
      str.push(obj);
    } else if (cType === 12) {
      allowed = type0;
      asterick = empty$1;
      inc(ptc, 6);
      str.push(obj);
      if (nodes[i + 1].type !== 4) {
        str.push(openingParObj);
        ptc.push(6);
      }
    } else if (cType === 13) {
      allowed = type1;
      asterick = type3Asterick;
      str.push(obj);
    }
    inc(ptc, -1);
    prevKey = cToken;
  }
  for (j = ptc.length; j--; ) {
    str.push(closingParObj);
  }
  if (allowed[5] !== true) {
    throw new Mexp$3.Exception("complete the expression");
  }
  while (bracToClose--) {
    str.push(closingParObj);
  }
  str.push(closingParObj);
  return new Mexp$3(str);
};
var lexer = Mexp$3;
var Mexp$2 = lexer;
Mexp$2.prototype.toPostfix = function() {
  var post = [], elem, popped, prep, pre, ele;
  var stack2 = [{ value: "(", type: 4, pre: 0 }];
  var arr = this.value;
  for (var i = 1; i < arr.length; i++) {
    if (arr[i].type === 1 || arr[i].type === 3 || arr[i].type === 13) {
      if (arr[i].type === 1)
        arr[i].value = Number(arr[i].value);
      post.push(arr[i]);
    } else if (arr[i].type === 4) {
      stack2.push(arr[i]);
    } else if (arr[i].type === 5) {
      while ((popped = stack2.pop()).type !== 4) {
        post.push(popped);
      }
    } else if (arr[i].type === 11) {
      while ((popped = stack2.pop()).type !== 4) {
        post.push(popped);
      }
      stack2.push(popped);
    } else {
      elem = arr[i];
      pre = elem.pre;
      ele = stack2[stack2.length - 1];
      prep = ele.pre;
      var flag = ele.value == "Math.pow" && elem.value == "Math.pow";
      if (pre > prep) stack2.push(elem);
      else {
        while (prep >= pre && !flag || flag && pre < prep) {
          popped = stack2.pop();
          ele = stack2[stack2.length - 1];
          post.push(popped);
          prep = ele.pre;
          flag = elem.value == "Math.pow" && ele.value == "Math.pow";
        }
        stack2.push(elem);
      }
    }
  }
  return new Mexp$2(post);
};
var postfix = Mexp$2;
var Mexp$1 = postfix;
Mexp$1.prototype.postfixEval = function(UserDefined) {
  UserDefined = UserDefined || {};
  UserDefined.PI = Math.PI;
  UserDefined.E = Math.E;
  var stack2 = [], pop1, pop2, pop3;
  var arr = this.value;
  var bool = typeof UserDefined.n !== "undefined";
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].type === 1) {
      stack2.push({ value: arr[i].value, type: 1 });
    } else if (arr[i].type === 3) {
      stack2.push({ value: UserDefined[arr[i].value], type: 1 });
    } else if (arr[i].type === 0) {
      if (typeof stack2[stack2.length - 1].type === "undefined") {
        stack2[stack2.length - 1].value.push(arr[i]);
      } else stack2[stack2.length - 1].value = arr[i].value(stack2[stack2.length - 1].value);
    } else if (arr[i].type === 7) {
      if (typeof stack2[stack2.length - 1].type === "undefined") {
        stack2[stack2.length - 1].value.push(arr[i]);
      } else stack2[stack2.length - 1].value = arr[i].value(stack2[stack2.length - 1].value);
    } else if (arr[i].type === 8) {
      var popped = [];
      for (var x2 = 0; x2 < arr[i].numberOfArguments; x2++) {
        popped.push(stack2.pop().value);
      }
      stack2.push({ type: 1, value: arr[i].value.apply(arr[i], popped.reverse()) });
    } else if (arr[i].type === 10) {
      pop1 = stack2.pop();
      pop2 = stack2.pop();
      if (typeof pop2.type === "undefined") {
        pop2.value = pop2.concat(pop1);
        pop2.value.push(arr[i]);
        stack2.push(pop2);
      } else if (typeof pop1.type === "undefined") {
        pop1.unshift(pop2);
        pop1.push(arr[i]);
        stack2.push(pop1);
      } else {
        stack2.push({ type: 1, value: arr[i].value(pop2.value, pop1.value) });
      }
    } else if (arr[i].type === 2 || arr[i].type === 9) {
      pop1 = stack2.pop();
      pop2 = stack2.pop();
      if (typeof pop2.type === "undefined") {
        pop2 = pop2.concat(pop1);
        pop2.push(arr[i]);
        stack2.push(pop2);
      } else if (typeof pop1.type === "undefined") {
        pop1.unshift(pop2);
        pop1.push(arr[i]);
        stack2.push(pop1);
      } else {
        stack2.push({ type: 1, value: arr[i].value(pop2.value, pop1.value) });
      }
    } else if (arr[i].type === 12) {
      pop1 = stack2.pop();
      if (typeof pop1.type !== "undefined") {
        pop1 = [pop1];
      }
      pop2 = stack2.pop();
      pop3 = stack2.pop();
      stack2.push({ type: 1, value: arr[i].value(pop3.value, pop2.value, new Mexp$1(pop1)) });
    } else if (arr[i].type === 13) {
      if (bool) {
        stack2.push({ value: UserDefined[arr[i].value], type: 3 });
      } else stack2.push([arr[i]]);
    }
  }
  if (stack2.length > 1) {
    throw new Mexp$1.Exception("Uncaught Syntax error");
  }
  return stack2[0].value > 1e15 ? "Infinity" : parseFloat(stack2[0].value.toFixed(15));
};
Mexp$1.eval = function(str, tokens2, obj) {
  if (typeof tokens2 === "undefined") {
    return this.lex(str).toPostfix().postfixEval();
  } else if (typeof obj === "undefined") {
    if (typeof tokens2.length !== "undefined") return this.lex(str, tokens2).toPostfix().postfixEval();
    else return this.lex(str).toPostfix().postfixEval(tokens2);
  } else return this.lex(str, tokens2).toPostfix().postfixEval(obj);
};
var postfix_evaluator = Mexp$1;
var Mexp = postfix_evaluator;
Mexp.prototype.formulaEval = function() {
  var pop1, pop2, pop3;
  var disp = [];
  var arr = this.value;
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].type === 1 || arr[i].type === 3) {
      disp.push({ value: arr[i].type === 3 ? arr[i].show : arr[i].value, type: 1 });
    } else if (arr[i].type === 13) {
      disp.push({ value: arr[i].show, type: 1 });
    } else if (arr[i].type === 0) {
      disp[disp.length - 1] = { value: arr[i].show + (arr[i].show != "-" ? "(" : "") + disp[disp.length - 1].value + (arr[i].show != "-" ? ")" : ""), type: 0 };
    } else if (arr[i].type === 7) {
      disp[disp.length - 1] = { value: (disp[disp.length - 1].type != 1 ? "(" : "") + disp[disp.length - 1].value + (disp[disp.length - 1].type != 1 ? ")" : "") + arr[i].show, type: 7 };
    } else if (arr[i].type === 10) {
      pop1 = disp.pop();
      pop2 = disp.pop();
      if (arr[i].show === "P" || arr[i].show === "C") disp.push({ value: "<sup>" + pop2.value + "</sup>" + arr[i].show + "<sub>" + pop1.value + "</sub>", type: 10 });
      else disp.push({ value: (pop2.type != 1 ? "(" : "") + pop2.value + (pop2.type != 1 ? ")" : "") + "<sup>" + pop1.value + "</sup>", type: 1 });
    } else if (arr[i].type === 2 || arr[i].type === 9) {
      pop1 = disp.pop();
      pop2 = disp.pop();
      disp.push({ value: (pop2.type != 1 ? "(" : "") + pop2.value + (pop2.type != 1 ? ")" : "") + arr[i].show + (pop1.type != 1 ? "(" : "") + pop1.value + (pop1.type != 1 ? ")" : ""), type: arr[i].type });
    } else if (arr[i].type === 12) {
      pop1 = disp.pop();
      pop2 = disp.pop();
      pop3 = disp.pop();
      disp.push({ value: arr[i].show + "(" + pop3.value + "," + pop2.value + "," + pop1.value + ")", type: 12 });
    }
  }
  return disp[0].value;
};
var formula_evaluator = Mexp;
var balanced = balancedMatch$1;
var reduceFunctionCall = reduceFunctionCall_1;
var mexp = formula_evaluator;
var MAX_STACK = 100;
var NESTED_CALC_RE = /(\+|\-|\*|\\|[^a-z]|)(\s*)(\()/g;
var stack$2;
var reduceCssCalc = reduceCSSCalc;
function reduceCSSCalc(value2, decimalPrecision) {
  stack$2 = 0;
  decimalPrecision = Math.pow(10, decimalPrecision === void 0 ? 5 : decimalPrecision);
  value2 = value2.replace(/\n+/g, " ");
  function evaluateExpression(expression, functionIdentifier, call2) {
    if (stack$2++ > MAX_STACK) {
      stack$2 = 0;
      throw new Error("Call stack overflow for " + call2);
    }
    if (expression === "") {
      throw new Error(functionIdentifier + "(): '" + call2 + "' must contain a non-whitespace string");
    }
    expression = evaluateNestedExpression(expression, call2);
    var units = getUnitsInExpression(expression);
    if (units.length > 1 || expression.indexOf("var(") > -1) {
      return functionIdentifier + "(" + expression + ")";
    }
    var unit2 = units[0] || "";
    if (unit2 === "%") {
      expression = expression.replace(/\b[0-9\.]+%/g, function(percent) {
        return parseFloat(percent.slice(0, -1)) * 0.01;
      });
    }
    var toEvaluate = expression.replace(new RegExp(unit2, "gi"), "");
    var result;
    try {
      result = mexp.eval(toEvaluate);
    } catch (e) {
      return functionIdentifier + "(" + expression + ")";
    }
    if (unit2 === "%") {
      result *= 100;
    }
    if (functionIdentifier.length || unit2 === "%") {
      result = Math.round(result * decimalPrecision) / decimalPrecision;
    }
    result += unit2;
    return result;
  }
  function evaluateNestedExpression(expression, call2) {
    expression = expression.replace(/((?:\-[a-z]+\-)?calc)/g, "");
    var evaluatedPart = "";
    var nonEvaluatedPart = expression;
    var matches;
    while (matches = NESTED_CALC_RE.exec(nonEvaluatedPart)) {
      if (matches[0].index > 0) {
        evaluatedPart += nonEvaluatedPart.substring(0, matches[0].index);
      }
      var balancedExpr = balanced("(", ")", nonEvaluatedPart.substring([0].index));
      if (balancedExpr.body === "") {
        throw new Error("'" + expression + "' must contain a non-whitespace string");
      }
      var evaluated = evaluateExpression(balancedExpr.body, "", call2);
      evaluatedPart += balancedExpr.pre + evaluated;
      nonEvaluatedPart = balancedExpr.post;
    }
    return evaluatedPart + nonEvaluatedPart;
  }
  return reduceFunctionCall(value2, /((?:\-[a-z]+\-)?calc)\(/, evaluateExpression);
}
function getUnitsInExpression(expression) {
  var uniqueUnits = [];
  var uniqueLowerCaseUnits = [];
  var unitRegEx = /[\.0-9]([%a-z]+)/gi;
  var matches = unitRegEx.exec(expression);
  while (matches) {
    if (!matches || !matches[1]) {
      continue;
    }
    if (uniqueLowerCaseUnits.indexOf(matches[1].toLowerCase()) === -1) {
      uniqueUnits.push(matches[1]);
      uniqueLowerCaseUnits.push(matches[1].toLowerCase());
    }
    matches = unitRegEx.exec(expression);
  }
  return uniqueUnits;
}
const reduceCSSCalc$1 = /* @__PURE__ */ getDefaultExportFromCjs(reduceCssCalc);
var baseGetTag = _baseGetTag, isObject$1 = isObject_1;
var asyncTag = "[object AsyncFunction]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
function isFunction$1(value2) {
  if (!isObject$1(value2)) {
    return false;
  }
  var tag = baseGetTag(value2);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}
var isFunction_1 = isFunction$1;
var root$1 = _root;
var coreJsData$1 = root$1["__core-js_shared__"];
var _coreJsData = coreJsData$1;
var coreJsData = _coreJsData;
var maskSrcKey = function() {
  var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
  return uid ? "Symbol(src)_1." + uid : "";
}();
function isMasked$1(func) {
  return !!maskSrcKey && maskSrcKey in func;
}
var _isMasked = isMasked$1;
var funcProto$1 = Function.prototype;
var funcToString$1 = funcProto$1.toString;
function toSource$1(func) {
  if (func != null) {
    try {
      return funcToString$1.call(func);
    } catch (e) {
    }
    try {
      return func + "";
    } catch (e) {
    }
  }
  return "";
}
var _toSource = toSource$1;
var isFunction = isFunction_1, isMasked = _isMasked, isObject = isObject_1, toSource = _toSource;
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
var reIsHostCtor = /^\[object .+?Constructor\]$/;
var funcProto = Function.prototype, objectProto$2 = Object.prototype;
var funcToString = funcProto.toString;
var hasOwnProperty$2 = objectProto$2.hasOwnProperty;
var reIsNative = RegExp(
  "^" + funcToString.call(hasOwnProperty$2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
);
function baseIsNative$1(value2) {
  if (!isObject(value2) || isMasked(value2)) {
    return false;
  }
  var pattern = isFunction(value2) ? reIsNative : reIsHostCtor;
  return pattern.test(toSource(value2));
}
var _baseIsNative = baseIsNative$1;
function getValue$1(object2, key) {
  return object2 == null ? void 0 : object2[key];
}
var _getValue = getValue$1;
var baseIsNative = _baseIsNative, getValue = _getValue;
function getNative$2(object2, key) {
  var value2 = getValue(object2, key);
  return baseIsNative(value2) ? value2 : void 0;
}
var _getNative = getNative$2;
var getNative$1 = _getNative;
var nativeCreate$4 = getNative$1(Object, "create");
var _nativeCreate = nativeCreate$4;
var nativeCreate$3 = _nativeCreate;
function hashClear$1() {
  this.__data__ = nativeCreate$3 ? nativeCreate$3(null) : {};
  this.size = 0;
}
var _hashClear = hashClear$1;
function hashDelete$1(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}
var _hashDelete = hashDelete$1;
var nativeCreate$2 = _nativeCreate;
var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
var objectProto$1 = Object.prototype;
var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
function hashGet$1(key) {
  var data = this.__data__;
  if (nativeCreate$2) {
    var result = data[key];
    return result === HASH_UNDEFINED$1 ? void 0 : result;
  }
  return hasOwnProperty$1.call(data, key) ? data[key] : void 0;
}
var _hashGet = hashGet$1;
var nativeCreate$1 = _nativeCreate;
var objectProto = Object.prototype;
var hasOwnProperty = objectProto.hasOwnProperty;
function hashHas$1(key) {
  var data = this.__data__;
  return nativeCreate$1 ? data[key] !== void 0 : hasOwnProperty.call(data, key);
}
var _hashHas = hashHas$1;
var nativeCreate = _nativeCreate;
var HASH_UNDEFINED = "__lodash_hash_undefined__";
function hashSet$1(key, value2) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = nativeCreate && value2 === void 0 ? HASH_UNDEFINED : value2;
  return this;
}
var _hashSet = hashSet$1;
var hashClear = _hashClear, hashDelete = _hashDelete, hashGet = _hashGet, hashHas = _hashHas, hashSet = _hashSet;
function Hash$1(entries) {
  var index2 = -1, length2 = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length2) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
Hash$1.prototype.clear = hashClear;
Hash$1.prototype["delete"] = hashDelete;
Hash$1.prototype.get = hashGet;
Hash$1.prototype.has = hashHas;
Hash$1.prototype.set = hashSet;
var _Hash = Hash$1;
function listCacheClear$1() {
  this.__data__ = [];
  this.size = 0;
}
var _listCacheClear = listCacheClear$1;
function eq$1(value2, other) {
  return value2 === other || value2 !== value2 && other !== other;
}
var eq_1 = eq$1;
var eq = eq_1;
function assocIndexOf$4(array2, key) {
  var length2 = array2.length;
  while (length2--) {
    if (eq(array2[length2][0], key)) {
      return length2;
    }
  }
  return -1;
}
var _assocIndexOf = assocIndexOf$4;
var assocIndexOf$3 = _assocIndexOf;
var arrayProto = Array.prototype;
var splice = arrayProto.splice;
function listCacheDelete$1(key) {
  var data = this.__data__, index2 = assocIndexOf$3(data, key);
  if (index2 < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index2 == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index2, 1);
  }
  --this.size;
  return true;
}
var _listCacheDelete = listCacheDelete$1;
var assocIndexOf$2 = _assocIndexOf;
function listCacheGet$1(key) {
  var data = this.__data__, index2 = assocIndexOf$2(data, key);
  return index2 < 0 ? void 0 : data[index2][1];
}
var _listCacheGet = listCacheGet$1;
var assocIndexOf$1 = _assocIndexOf;
function listCacheHas$1(key) {
  return assocIndexOf$1(this.__data__, key) > -1;
}
var _listCacheHas = listCacheHas$1;
var assocIndexOf = _assocIndexOf;
function listCacheSet$1(key, value2) {
  var data = this.__data__, index2 = assocIndexOf(data, key);
  if (index2 < 0) {
    ++this.size;
    data.push([key, value2]);
  } else {
    data[index2][1] = value2;
  }
  return this;
}
var _listCacheSet = listCacheSet$1;
var listCacheClear = _listCacheClear, listCacheDelete = _listCacheDelete, listCacheGet = _listCacheGet, listCacheHas = _listCacheHas, listCacheSet = _listCacheSet;
function ListCache$1(entries) {
  var index2 = -1, length2 = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length2) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
ListCache$1.prototype.clear = listCacheClear;
ListCache$1.prototype["delete"] = listCacheDelete;
ListCache$1.prototype.get = listCacheGet;
ListCache$1.prototype.has = listCacheHas;
ListCache$1.prototype.set = listCacheSet;
var _ListCache = ListCache$1;
var getNative = _getNative, root = _root;
var Map$2 = getNative(root, "Map");
var _Map = Map$2;
var Hash = _Hash, ListCache = _ListCache, Map$1 = _Map;
function mapCacheClear$1() {
  this.size = 0;
  this.__data__ = {
    "hash": new Hash(),
    "map": new (Map$1 || ListCache)(),
    "string": new Hash()
  };
}
var _mapCacheClear = mapCacheClear$1;
function isKeyable$1(value2) {
  var type = typeof value2;
  return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value2 !== "__proto__" : value2 === null;
}
var _isKeyable = isKeyable$1;
var isKeyable = _isKeyable;
function getMapData$4(map2, key) {
  var data = map2.__data__;
  return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
}
var _getMapData = getMapData$4;
var getMapData$3 = _getMapData;
function mapCacheDelete$1(key) {
  var result = getMapData$3(this, key)["delete"](key);
  this.size -= result ? 1 : 0;
  return result;
}
var _mapCacheDelete = mapCacheDelete$1;
var getMapData$2 = _getMapData;
function mapCacheGet$1(key) {
  return getMapData$2(this, key).get(key);
}
var _mapCacheGet = mapCacheGet$1;
var getMapData$1 = _getMapData;
function mapCacheHas$1(key) {
  return getMapData$1(this, key).has(key);
}
var _mapCacheHas = mapCacheHas$1;
var getMapData = _getMapData;
function mapCacheSet$1(key, value2) {
  var data = getMapData(this, key), size = data.size;
  data.set(key, value2);
  this.size += data.size == size ? 0 : 1;
  return this;
}
var _mapCacheSet = mapCacheSet$1;
var mapCacheClear = _mapCacheClear, mapCacheDelete = _mapCacheDelete, mapCacheGet = _mapCacheGet, mapCacheHas = _mapCacheHas, mapCacheSet = _mapCacheSet;
function MapCache$1(entries) {
  var index2 = -1, length2 = entries == null ? 0 : entries.length;
  this.clear();
  while (++index2 < length2) {
    var entry = entries[index2];
    this.set(entry[0], entry[1]);
  }
}
MapCache$1.prototype.clear = mapCacheClear;
MapCache$1.prototype["delete"] = mapCacheDelete;
MapCache$1.prototype.get = mapCacheGet;
MapCache$1.prototype.has = mapCacheHas;
MapCache$1.prototype.set = mapCacheSet;
var _MapCache = MapCache$1;
var MapCache = _MapCache;
var FUNC_ERROR_TEXT = "Expected a function";
function memoize(func, resolver) {
  if (typeof func != "function" || resolver != null && typeof resolver != "function") {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || MapCache)();
  return memoized;
}
memoize.Cache = MapCache;
var memoize_1 = memoize;
const memoize$1 = /* @__PURE__ */ getDefaultExportFromCjs(memoize_1);
var MEASUREMENT_ELEMENT_ID$1 = "__react_svg_text_measurement_id";
function getStringWidth(str, style) {
  try {
    var textEl = document.getElementById(MEASUREMENT_ELEMENT_ID$1);
    if (!textEl) {
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("aria-hidden", "true");
      svg.style.width = "0";
      svg.style.height = "0";
      svg.style.position = "absolute";
      svg.style.top = "-100%";
      svg.style.left = "-100%";
      textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textEl.setAttribute("id", MEASUREMENT_ELEMENT_ID$1);
      svg.appendChild(textEl);
      document.body.appendChild(svg);
    }
    Object.assign(textEl.style, style);
    textEl.textContent = str;
    return textEl.getComputedTextLength();
  } catch (e) {
    return null;
  }
}
const getStringWidth$1 = memoize$1(getStringWidth, function(str, style) {
  return str + "_" + JSON.stringify(style);
});
var _excluded$C = ["verticalAnchor", "scaleToFit", "angle", "width", "lineHeight", "capHeight", "children", "style"];
function _objectWithoutPropertiesLoose$C(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function isNumber(val) {
  return typeof val === "number";
}
function isXOrYInValid(xOrY) {
  return (
    // number that is not NaN or Infinity
    typeof xOrY === "number" && Number.isFinite(xOrY) || // for percentage
    typeof xOrY === "string"
  );
}
function useText(props) {
  var _props$verticalAnchor = props.verticalAnchor, verticalAnchor = _props$verticalAnchor === void 0 ? "end" : _props$verticalAnchor, _props$scaleToFit = props.scaleToFit, scaleToFit = _props$scaleToFit === void 0 ? false : _props$scaleToFit, angle = props.angle, width = props.width, _props$lineHeight = props.lineHeight, lineHeight = _props$lineHeight === void 0 ? "1em" : _props$lineHeight, _props$capHeight = props.capHeight, capHeight = _props$capHeight === void 0 ? "0.71em" : _props$capHeight, children = props.children, style = props.style, textProps = _objectWithoutPropertiesLoose$C(props, _excluded$C);
  var _textProps$x = textProps.x, x2 = _textProps$x === void 0 ? 0 : _textProps$x, _textProps$y = textProps.y, y2 = _textProps$y === void 0 ? 0 : _textProps$y;
  var isXOrYNotValid = !isXOrYInValid(x2) || !isXOrYInValid(y2);
  var _useMemo = reactExports.useMemo(function() {
    var words = children == null ? [] : children.toString().split(/(?:(?!\u00A0+)\s+)/);
    return {
      wordsWithWidth: words.map(function(word) {
        return {
          word,
          wordWidth: getStringWidth$1(word, style) || 0
        };
      }),
      spaceWidth: getStringWidth$1(" ", style) || 0
    };
  }, [children, style]), wordsWithWidth = _useMemo.wordsWithWidth, spaceWidth = _useMemo.spaceWidth;
  var wordsByLines = reactExports.useMemo(function() {
    if (isXOrYNotValid) {
      return [];
    }
    if (width || scaleToFit) {
      return wordsWithWidth.reduce(function(result, _ref) {
        var word = _ref.word, wordWidth = _ref.wordWidth;
        var currentLine = result[result.length - 1];
        if (currentLine && (width == null || scaleToFit || (currentLine.width || 0) + wordWidth + spaceWidth < width)) {
          currentLine.words.push(word);
          currentLine.width = currentLine.width || 0;
          currentLine.width += wordWidth + spaceWidth;
        } else {
          var newLine = {
            words: [word],
            width: wordWidth
          };
          result.push(newLine);
        }
        return result;
      }, []);
    }
    return [{
      words: children == null ? [] : children.toString().split(/(?:(?!\u00A0+)\s+)/)
    }];
  }, [isXOrYNotValid, width, scaleToFit, children, wordsWithWidth, spaceWidth]);
  var startDy = reactExports.useMemo(function() {
    var startDyStr = isXOrYNotValid ? "" : verticalAnchor === "start" ? reduceCSSCalc$1("calc(" + capHeight + ")") : verticalAnchor === "middle" ? reduceCSSCalc$1("calc(" + (wordsByLines.length - 1) / 2 + " * -" + lineHeight + " + (" + capHeight + " / 2))") : reduceCSSCalc$1("calc(" + (wordsByLines.length - 1) + " * -" + lineHeight + ")");
    return startDyStr;
  }, [isXOrYNotValid, verticalAnchor, capHeight, wordsByLines.length, lineHeight]);
  var transform2 = reactExports.useMemo(function() {
    var transforms = [];
    if (isXOrYNotValid) {
      return "";
    }
    if (isNumber(x2) && isNumber(y2) && isNumber(width) && scaleToFit && wordsByLines.length > 0) {
      var lineWidth = wordsByLines[0].width || 1;
      var sx = scaleToFit === "shrink-only" ? Math.min(width / lineWidth, 1) : width / lineWidth;
      var sy = sx;
      var originX = x2 - sx * x2;
      var originY = y2 - sy * y2;
      transforms.push("matrix(" + sx + ", 0, 0, " + sy + ", " + originX + ", " + originY + ")");
    }
    if (angle) {
      transforms.push("rotate(" + angle + ", " + x2 + ", " + y2 + ")");
    }
    return transforms.length > 0 ? transforms.join(" ") : "";
  }, [isXOrYNotValid, x2, y2, width, scaleToFit, wordsByLines, angle]);
  return {
    wordsByLines,
    startDy,
    transform: transform2
  };
}
var _excluded$B = ["dx", "dy", "textAnchor", "innerRef", "innerTextRef", "verticalAnchor", "angle", "lineHeight", "scaleToFit", "capHeight", "width"];
function _extends$R() {
  _extends$R = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$R.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$B(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
var SVG_STYLE = {
  overflow: "visible"
};
function Text(props) {
  var _props$dx = props.dx, dx = _props$dx === void 0 ? 0 : _props$dx, _props$dy = props.dy, dy = _props$dy === void 0 ? 0 : _props$dy, _props$textAnchor = props.textAnchor, textAnchor = _props$textAnchor === void 0 ? "start" : _props$textAnchor, innerRef = props.innerRef, innerTextRef = props.innerTextRef;
  props.verticalAnchor;
  props.angle;
  var _props$lineHeight = props.lineHeight, lineHeight = _props$lineHeight === void 0 ? "1em" : _props$lineHeight;
  props.scaleToFit;
  props.capHeight;
  props.width;
  var textProps = _objectWithoutPropertiesLoose$B(props, _excluded$B);
  var _textProps$x = textProps.x, x2 = _textProps$x === void 0 ? 0 : _textProps$x, fontSize = textProps.fontSize;
  var _useText = useText(props), wordsByLines = _useText.wordsByLines, startDy = _useText.startDy, transform2 = _useText.transform;
  return /* @__PURE__ */ React.createElement("svg", {
    ref: innerRef,
    x: dx,
    y: dy,
    fontSize,
    style: SVG_STYLE
  }, wordsByLines.length > 0 ? /* @__PURE__ */ React.createElement("text", _extends$R({
    ref: innerTextRef,
    transform: transform2
  }, textProps, {
    textAnchor
  }), wordsByLines.map(function(line2, index2) {
    return /* @__PURE__ */ React.createElement("tspan", {
      key: index2,
      x: x2,
      dy: index2 === 0 ? startDy : lineHeight
    }, line2.words.join(" "));
  })) : null);
}
const esm$3 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Text,
  getStringWidth: getStringWidth$1,
  useText
}, Symbol.toStringTag, { value: "Module" }));
var Point = /* @__PURE__ */ function() {
  function Point2(_ref) {
    var _ref$x = _ref.x, x2 = _ref$x === void 0 ? 0 : _ref$x, _ref$y = _ref.y, y2 = _ref$y === void 0 ? 0 : _ref$y;
    this.x = 0;
    this.y = 0;
    this.x = x2;
    this.y = y2;
  }
  var _proto = Point2.prototype;
  _proto.value = function value2() {
    return {
      x: this.x,
      y: this.y
    };
  };
  _proto.toArray = function toArray2() {
    return [this.x, this.y];
  };
  return Point2;
}();
function sumPoints(point1, point2) {
  return new Point({
    x: point1.x + point2.x,
    y: point1.y + point2.y
  });
}
function subtractPoints(point1, point2) {
  return new Point({
    x: point1.x - point2.x,
    y: point1.y - point2.y
  });
}
const esm$2 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Point,
  subtractPoints,
  sumPoints
}, Symbol.toStringTag, { value: "Module" }));
const require$$5 = /* @__PURE__ */ getAugmentedNamespace(esm$2);
function isElement(elem) {
  return !!elem && elem instanceof Element;
}
function isSVGElement(elem) {
  return !!elem && (elem instanceof SVGElement || "ownerSVGElement" in elem);
}
function isSVGSVGElement(elem) {
  return !!elem && "createSVGPoint" in elem;
}
function isSVGGraphicsElement(elem) {
  return !!elem && "getScreenCTM" in elem;
}
function isTouchEvent(event) {
  return !!event && "changedTouches" in event;
}
function isMouseEvent(event) {
  return !!event && "clientX" in event;
}
function isEvent(event) {
  return !!event && (event instanceof Event || "nativeEvent" in event && event.nativeEvent instanceof Event);
}
function _extends$Q() {
  _extends$Q = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$Q.apply(this, arguments);
}
var DEFAULT_POINT = {
  x: 0,
  y: 0
};
function getXAndYFromEvent(event) {
  if (!event) return _extends$Q({}, DEFAULT_POINT);
  if (isTouchEvent(event)) {
    return event.changedTouches.length > 0 ? {
      x: event.changedTouches[0].clientX,
      y: event.changedTouches[0].clientY
    } : _extends$Q({}, DEFAULT_POINT);
  }
  if (isMouseEvent(event)) {
    return {
      x: event.clientX,
      y: event.clientY
    };
  }
  var target = event == null ? void 0 : event.target;
  var boundingClientRect = target && "getBoundingClientRect" in target ? target.getBoundingClientRect() : null;
  if (!boundingClientRect) return _extends$Q({}, DEFAULT_POINT);
  return {
    x: boundingClientRect.x + boundingClientRect.width / 2,
    y: boundingClientRect.y + boundingClientRect.height / 2
  };
}
function localPoint$1(node, event) {
  if (!node || !event) return null;
  var coords = getXAndYFromEvent(event);
  var svg = isSVGElement(node) ? node.ownerSVGElement : node;
  var screenCTM = isSVGGraphicsElement(svg) ? svg.getScreenCTM() : null;
  if (isSVGSVGElement(svg) && screenCTM) {
    var point2 = svg.createSVGPoint();
    point2.x = coords.x;
    point2.y = coords.y;
    point2 = point2.matrixTransform(screenCTM.inverse());
    return new Point({
      x: point2.x,
      y: point2.y
    });
  }
  var rect = node.getBoundingClientRect();
  return new Point({
    x: coords.x - rect.left - node.clientLeft,
    y: coords.y - rect.top - node.clientTop
  });
}
function localPoint(nodeOrEvent, maybeEvent) {
  if (isElement(nodeOrEvent) && maybeEvent) {
    return localPoint$1(nodeOrEvent, maybeEvent);
  }
  if (isEvent(nodeOrEvent)) {
    var event = nodeOrEvent;
    var node = event.target;
    if (node) return localPoint$1(node, event);
  }
  return null;
}
var src$7 = {};
var band$1 = {};
var src$6 = {};
var bisect = {};
var ascending$2 = {};
Object.defineProperty(ascending$2, "__esModule", {
  value: true
});
ascending$2.default = ascending$1;
function ascending$1(a2, b) {
  return a2 == null || b == null ? NaN : a2 < b ? -1 : a2 > b ? 1 : a2 >= b ? 0 : NaN;
}
var bisector$2 = {};
var descending$2 = {};
Object.defineProperty(descending$2, "__esModule", {
  value: true
});
descending$2.default = descending$1;
function descending$1(a2, b) {
  return a2 == null || b == null ? NaN : b < a2 ? -1 : b > a2 ? 1 : b >= a2 ? 0 : NaN;
}
Object.defineProperty(bisector$2, "__esModule", {
  value: true
});
bisector$2.default = bisector$1;
var _ascending$8 = _interopRequireDefault$R(ascending$2);
var _descending = _interopRequireDefault$R(descending$2);
function _interopRequireDefault$R(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function bisector$1(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = _ascending$8.default;
    compare2 = (d, x2) => (0, _ascending$8.default)(f(d), x2);
    delta = (d, x2) => f(d) - x2;
  } else {
    compare1 = f === _ascending$8.default || f === _descending.default ? f : zero$3;
    compare2 = f;
    delta = f;
  }
  function left(a2, x2, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x2) < 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right(a2, x2, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x2) <= 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center(a2, x2, lo = 0, hi = a2.length) {
    const i = left(a2, x2, lo, hi - 1);
    return i > lo && delta(a2[i - 1], x2) > -delta(a2[i], x2) ? i - 1 : i;
  }
  return {
    left,
    center,
    right
  };
}
function zero$3() {
  return 0;
}
var number$6 = {};
Object.defineProperty(number$6, "__esModule", {
  value: true
});
number$6.default = number$5;
number$6.numbers = numbers;
function number$5(x2) {
  return x2 === null ? NaN : +x2;
}
function* numbers(values, valueof) {
  if (valueof === void 0) {
    for (let value2 of values) {
      if (value2 != null && (value2 = +value2) >= value2) {
        yield value2;
      }
    }
  } else {
    let index2 = -1;
    for (let value2 of values) {
      if ((value2 = valueof(value2, ++index2, values)) != null && (value2 = +value2) >= value2) {
        yield value2;
      }
    }
  }
}
Object.defineProperty(bisect, "__esModule", {
  value: true
});
bisect.default = bisect.bisectRight = bisect.bisectLeft = bisect.bisectCenter = void 0;
var _ascending$7 = _interopRequireDefault$Q(ascending$2);
var _bisector = _interopRequireDefault$Q(bisector$2);
var _number$6 = _interopRequireDefault$Q(number$6);
function _interopRequireDefault$Q(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
const ascendingBisect$1 = (0, _bisector.default)(_ascending$7.default);
const bisectRight = ascendingBisect$1.right;
bisect.bisectRight = bisectRight;
const bisectLeft$1 = ascendingBisect$1.left;
bisect.bisectLeft = bisectLeft$1;
const bisectCenter = (0, _bisector.default)(_number$6.default).center;
bisect.bisectCenter = bisectCenter;
var _default$D = bisectRight;
bisect.default = _default$D;
var blur$1 = {};
Object.defineProperty(blur$1, "__esModule", {
  value: true
});
blur$1.blur = blur;
blur$1.blurImage = blur$1.blur2 = void 0;
function blur(values, r) {
  if (!((r = +r) >= 0)) throw new RangeError("invalid r");
  let length2 = values.length;
  if (!((length2 = Math.floor(length2)) >= 0)) throw new RangeError("invalid length");
  if (!length2 || !r) return values;
  const blur3 = blurf(r);
  const temp = values.slice();
  blur3(values, temp, 0, length2, 1);
  blur3(temp, values, 0, length2, 1);
  blur3(values, temp, 0, length2, 1);
  return values;
}
const blur2 = Blur2(blurf);
blur$1.blur2 = blur2;
const blurImage = Blur2(blurfImage);
blur$1.blurImage = blurImage;
function Blur2(blur3) {
  return function(data, rx, ry = rx) {
    if (!((rx = +rx) >= 0)) throw new RangeError("invalid rx");
    if (!((ry = +ry) >= 0)) throw new RangeError("invalid ry");
    let {
      data: values,
      width,
      height
    } = data;
    if (!((width = Math.floor(width)) >= 0)) throw new RangeError("invalid width");
    if (!((height = Math.floor(height !== void 0 ? height : values.length / width)) >= 0)) throw new RangeError("invalid height");
    if (!width || !height || !rx && !ry) return data;
    const blurx = rx && blur3(rx);
    const blury = ry && blur3(ry);
    const temp = values.slice();
    if (blurx && blury) {
      blurh(blurx, temp, values, width, height);
      blurh(blurx, values, temp, width, height);
      blurh(blurx, temp, values, width, height);
      blurv(blury, values, temp, width, height);
      blurv(blury, temp, values, width, height);
      blurv(blury, values, temp, width, height);
    } else if (blurx) {
      blurh(blurx, values, temp, width, height);
      blurh(blurx, temp, values, width, height);
      blurh(blurx, values, temp, width, height);
    } else if (blury) {
      blurv(blury, values, temp, width, height);
      blurv(blury, temp, values, width, height);
      blurv(blury, values, temp, width, height);
    }
    return data;
  };
}
function blurh(blur3, T, S, w, h) {
  for (let y2 = 0, n = w * h; y2 < n; ) {
    blur3(T, S, y2, y2 += w, 1);
  }
}
function blurv(blur3, T, S, w, h) {
  for (let x2 = 0, n = w * h; x2 < w; ++x2) {
    blur3(T, S, x2, x2 + n, w);
  }
}
function blurfImage(radius) {
  const blur3 = blurf(radius);
  return (T, S, start2, stop2, step2) => {
    start2 <<= 2, stop2 <<= 2, step2 <<= 2;
    blur3(T, S, start2 + 0, stop2 + 0, step2);
    blur3(T, S, start2 + 1, stop2 + 1, step2);
    blur3(T, S, start2 + 2, stop2 + 2, step2);
    blur3(T, S, start2 + 3, stop2 + 3, step2);
  };
}
function blurf(radius) {
  const radius0 = Math.floor(radius);
  if (radius0 === radius) return bluri(radius);
  const t = radius - radius0;
  const w = 2 * radius + 1;
  return (T, S, start2, stop2, step2) => {
    if (!((stop2 -= step2) >= start2)) return;
    let sum2 = radius0 * S[start2];
    const s0 = step2 * radius0;
    const s1 = s0 + step2;
    for (let i = start2, j = start2 + s0; i < j; i += step2) {
      sum2 += S[Math.min(stop2, i)];
    }
    for (let i = start2, j = stop2; i <= j; i += step2) {
      sum2 += S[Math.min(stop2, i + s0)];
      T[i] = (sum2 + t * (S[Math.max(start2, i - s1)] + S[Math.min(stop2, i + s1)])) / w;
      sum2 -= S[Math.max(start2, i - s0)];
    }
  };
}
function bluri(radius) {
  const w = 2 * radius + 1;
  return (T, S, start2, stop2, step2) => {
    if (!((stop2 -= step2) >= start2)) return;
    let sum2 = radius * S[start2];
    const s2 = step2 * radius;
    for (let i = start2, j = start2 + s2; i < j; i += step2) {
      sum2 += S[Math.min(stop2, i)];
    }
    for (let i = start2, j = stop2; i <= j; i += step2) {
      sum2 += S[Math.min(stop2, i + s2)];
      T[i] = sum2 / w;
      sum2 -= S[Math.max(start2, i - s2)];
    }
  };
}
var count$1 = {};
Object.defineProperty(count$1, "__esModule", {
  value: true
});
count$1.default = count;
function count(values, valueof) {
  let count2 = 0;
  if (valueof === void 0) {
    for (let value2 of values) {
      if (value2 != null && (value2 = +value2) >= value2) {
        ++count2;
      }
    }
  } else {
    let index2 = -1;
    for (let value2 of values) {
      if ((value2 = valueof(value2, ++index2, values)) != null && (value2 = +value2) >= value2) {
        ++count2;
      }
    }
  }
  return count2;
}
var cross$1 = {};
Object.defineProperty(cross$1, "__esModule", {
  value: true
});
cross$1.default = cross;
function length$1(array2) {
  return array2.length | 0;
}
function empty(length2) {
  return !(length2 > 0);
}
function arrayify(values) {
  return typeof values !== "object" || "length" in values ? values : Array.from(values);
}
function reducer(reduce2) {
  return (values) => reduce2(...values);
}
function cross(...values) {
  const reduce2 = typeof values[values.length - 1] === "function" && reducer(values.pop());
  values = values.map(arrayify);
  const lengths = values.map(length$1);
  const j = values.length - 1;
  const index2 = new Array(j + 1).fill(0);
  const product = [];
  if (j < 0 || lengths.some(empty)) return product;
  while (true) {
    product.push(index2.map((j2, i2) => values[i2][j2]));
    let i = j;
    while (++index2[i] === lengths[i]) {
      if (i === 0) return reduce2 ? product.map(reduce2) : product;
      index2[i--] = 0;
    }
  }
}
var cumsum$1 = {};
Object.defineProperty(cumsum$1, "__esModule", {
  value: true
});
cumsum$1.default = cumsum;
function cumsum(values, valueof) {
  var sum2 = 0, index2 = 0;
  return Float64Array.from(values, valueof === void 0 ? (v) => sum2 += +v || 0 : (v) => sum2 += +valueof(v, index2++, values) || 0);
}
var deviation$1 = {};
var variance$1 = {};
Object.defineProperty(variance$1, "__esModule", {
  value: true
});
variance$1.default = variance;
function variance(values, valueof) {
  let count2 = 0;
  let delta;
  let mean2 = 0;
  let sum2 = 0;
  if (valueof === void 0) {
    for (let value2 of values) {
      if (value2 != null && (value2 = +value2) >= value2) {
        delta = value2 - mean2;
        mean2 += delta / ++count2;
        sum2 += delta * (value2 - mean2);
      }
    }
  } else {
    let index2 = -1;
    for (let value2 of values) {
      if ((value2 = valueof(value2, ++index2, values)) != null && (value2 = +value2) >= value2) {
        delta = value2 - mean2;
        mean2 += delta / ++count2;
        sum2 += delta * (value2 - mean2);
      }
    }
  }
  if (count2 > 1) return sum2 / (count2 - 1);
}
Object.defineProperty(deviation$1, "__esModule", {
  value: true
});
deviation$1.default = deviation;
var _variance = _interopRequireDefault$P(variance$1);
function _interopRequireDefault$P(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function deviation(values, valueof) {
  const v = (0, _variance.default)(values, valueof);
  return v ? Math.sqrt(v) : v;
}
var extent$2 = {};
Object.defineProperty(extent$2, "__esModule", {
  value: true
});
extent$2.default = extent$1;
function extent$1(values, valueof) {
  let min2;
  let max2;
  if (valueof === void 0) {
    for (const value2 of values) {
      if (value2 != null) {
        if (min2 === void 0) {
          if (value2 >= value2) min2 = max2 = value2;
        } else {
          if (min2 > value2) min2 = value2;
          if (max2 < value2) max2 = value2;
        }
      }
    }
  } else {
    let index2 = -1;
    for (let value2 of values) {
      if ((value2 = valueof(value2, ++index2, values)) != null) {
        if (min2 === void 0) {
          if (value2 >= value2) min2 = max2 = value2;
        } else {
          if (min2 > value2) min2 = value2;
          if (max2 < value2) max2 = value2;
        }
      }
    }
  }
  return [min2, max2];
}
var fsum$1 = {};
Object.defineProperty(fsum$1, "__esModule", {
  value: true
});
fsum$1.Adder = void 0;
fsum$1.fcumsum = fcumsum;
fsum$1.fsum = fsum;
class Adder {
  constructor() {
    this._partials = new Float64Array(32);
    this._n = 0;
  }
  add(x2) {
    const p = this._partials;
    let i = 0;
    for (let j = 0; j < this._n && j < 32; j++) {
      const y2 = p[j], hi = x2 + y2, lo = Math.abs(x2) < Math.abs(y2) ? x2 - (hi - y2) : y2 - (hi - x2);
      if (lo) p[i++] = lo;
      x2 = hi;
    }
    p[i] = x2;
    this._n = i + 1;
    return this;
  }
  valueOf() {
    const p = this._partials;
    let n = this._n, x2, y2, lo, hi = 0;
    if (n > 0) {
      hi = p[--n];
      while (n > 0) {
        x2 = hi;
        y2 = p[--n];
        hi = x2 + y2;
        lo = y2 - (hi - x2);
        if (lo) break;
      }
      if (n > 0 && (lo < 0 && p[n - 1] < 0 || lo > 0 && p[n - 1] > 0)) {
        y2 = lo * 2;
        x2 = hi + y2;
        if (y2 == x2 - hi) hi = x2;
      }
    }
    return hi;
  }
}
fsum$1.Adder = Adder;
function fsum(values, valueof) {
  const adder = new Adder();
  if (valueof === void 0) {
    for (let value2 of values) {
      if (value2 = +value2) {
        adder.add(value2);
      }
    }
  } else {
    let index2 = -1;
    for (let value2 of values) {
      if (value2 = +valueof(value2, ++index2, values)) {
        adder.add(value2);
      }
    }
  }
  return +adder;
}
function fcumsum(values, valueof) {
  const adder = new Adder();
  let index2 = -1;
  return Float64Array.from(values, valueof === void 0 ? (v) => adder.add(+v || 0) : (v) => adder.add(+valueof(v, ++index2, values) || 0));
}
var group$1 = {};
var src$5 = {};
Object.defineProperty(src$5, "__esModule", {
  value: true
});
src$5.InternSet = src$5.InternMap = void 0;
class InternMap extends Map {
  constructor(entries, key = keyof) {
    super();
    Object.defineProperties(this, {
      _intern: {
        value: /* @__PURE__ */ new Map()
      },
      _key: {
        value: key
      }
    });
    if (entries != null) for (const [key2, value2] of entries) this.set(key2, value2);
  }
  get(key) {
    return super.get(intern_get(this, key));
  }
  has(key) {
    return super.has(intern_get(this, key));
  }
  set(key, value2) {
    return super.set(intern_set(this, key), value2);
  }
  delete(key) {
    return super.delete(intern_delete(this, key));
  }
}
src$5.InternMap = InternMap;
class InternSet extends Set {
  constructor(values, key = keyof) {
    super();
    Object.defineProperties(this, {
      _intern: {
        value: /* @__PURE__ */ new Map()
      },
      _key: {
        value: key
      }
    });
    if (values != null) for (const value2 of values) this.add(value2);
  }
  has(value2) {
    return super.has(intern_get(this, value2));
  }
  add(value2) {
    return super.add(intern_set(this, value2));
  }
  delete(value2) {
    return super.delete(intern_delete(this, value2));
  }
}
src$5.InternSet = InternSet;
function intern_get({
  _intern,
  _key
}, value2) {
  const key = _key(value2);
  return _intern.has(key) ? _intern.get(key) : value2;
}
function intern_set({
  _intern,
  _key
}, value2) {
  const key = _key(value2);
  if (_intern.has(key)) return _intern.get(key);
  _intern.set(key, value2);
  return value2;
}
function intern_delete({
  _intern,
  _key
}, value2) {
  const key = _key(value2);
  if (_intern.has(key)) {
    value2 = _intern.get(key);
    _intern.delete(key);
  }
  return value2;
}
function keyof(value2) {
  return value2 !== null && typeof value2 === "object" ? value2.valueOf() : value2;
}
var identity$6 = {};
Object.defineProperty(identity$6, "__esModule", {
  value: true
});
identity$6.default = identity$5;
function identity$5(x2) {
  return x2;
}
Object.defineProperty(group$1, "__esModule", {
  value: true
});
group$1.default = group;
group$1.flatGroup = flatGroup;
group$1.flatRollup = flatRollup;
group$1.groups = groups;
group$1.index = index;
group$1.indexes = indexes;
group$1.rollup = rollup;
group$1.rollups = rollups;
var _index$q = src$5;
var _identity$2 = _interopRequireDefault$O(identity$6);
function _interopRequireDefault$O(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function group(values, ...keys) {
  return nest(values, _identity$2.default, _identity$2.default, keys);
}
function groups(values, ...keys) {
  return nest(values, Array.from, _identity$2.default, keys);
}
function flatten$1(groups2, keys) {
  for (let i = 1, n = keys.length; i < n; ++i) {
    groups2 = groups2.flatMap((g) => g.pop().map(([key, value2]) => [...g, key, value2]));
  }
  return groups2;
}
function flatGroup(values, ...keys) {
  return flatten$1(groups(values, ...keys), keys);
}
function flatRollup(values, reduce2, ...keys) {
  return flatten$1(rollups(values, reduce2, ...keys), keys);
}
function rollup(values, reduce2, ...keys) {
  return nest(values, _identity$2.default, reduce2, keys);
}
function rollups(values, reduce2, ...keys) {
  return nest(values, Array.from, reduce2, keys);
}
function index(values, ...keys) {
  return nest(values, _identity$2.default, unique, keys);
}
function indexes(values, ...keys) {
  return nest(values, Array.from, unique, keys);
}
function unique(values) {
  if (values.length !== 1) throw new Error("duplicate key");
  return values[0];
}
function nest(values, map2, reduce2, keys) {
  return function regroup(values2, i) {
    if (i >= keys.length) return reduce2(values2);
    const groups2 = new _index$q.InternMap();
    const keyof2 = keys[i++];
    let index2 = -1;
    for (const value2 of values2) {
      const key = keyof2(value2, ++index2, values2);
      const group2 = groups2.get(key);
      if (group2) group2.push(value2);
      else groups2.set(key, [value2]);
    }
    for (const [key, values3] of groups2) {
      groups2.set(key, regroup(values3, i));
    }
    return map2(groups2);
  }(values, 0);
}
var groupSort$1 = {};
var sort$1 = {};
var permute$1 = {};
Object.defineProperty(permute$1, "__esModule", {
  value: true
});
permute$1.default = permute;
function permute(source, keys) {
  return Array.from(keys, (key) => source[key]);
}
Object.defineProperty(sort$1, "__esModule", {
  value: true
});
sort$1.ascendingDefined = ascendingDefined;
sort$1.compareDefined = compareDefined;
sort$1.default = sort;
var _ascending$6 = _interopRequireDefault$N(ascending$2);
var _permute = _interopRequireDefault$N(permute$1);
function _interopRequireDefault$N(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function sort(values, ...F) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  values = Array.from(values);
  let [f] = F;
  if (f && f.length !== 2 || F.length > 1) {
    const index2 = Uint32Array.from(values, (d, i) => i);
    if (F.length > 1) {
      F = F.map((f2) => values.map(f2));
      index2.sort((i, j) => {
        for (const f2 of F) {
          const c6 = ascendingDefined(f2[i], f2[j]);
          if (c6) return c6;
        }
      });
    } else {
      f = values.map(f);
      index2.sort((i, j) => ascendingDefined(f[i], f[j]));
    }
    return (0, _permute.default)(values, index2);
  }
  return values.sort(compareDefined(f));
}
function compareDefined(compare = _ascending$6.default) {
  if (compare === _ascending$6.default) return ascendingDefined;
  if (typeof compare !== "function") throw new TypeError("compare is not a function");
  return (a2, b) => {
    const x2 = compare(a2, b);
    if (x2 || x2 === 0) return x2;
    return (compare(b, b) === 0) - (compare(a2, a2) === 0);
  };
}
function ascendingDefined(a2, b) {
  return (a2 == null || !(a2 >= a2)) - (b == null || !(b >= b)) || (a2 < b ? -1 : a2 > b ? 1 : 0);
}
Object.defineProperty(groupSort$1, "__esModule", {
  value: true
});
groupSort$1.default = groupSort;
var _ascending$5 = _interopRequireDefault$M(ascending$2);
var _group$2 = _interopRequireWildcard$e(group$1);
var _sort$3 = _interopRequireDefault$M(sort$1);
function _getRequireWildcardCache$e(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$e = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$e(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$e(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function _interopRequireDefault$M(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function groupSort(values, reduce2, key) {
  return (reduce2.length !== 2 ? (0, _sort$3.default)((0, _group$2.rollup)(values, reduce2, key), ([ak, av], [bk, bv]) => (0, _ascending$5.default)(av, bv) || (0, _ascending$5.default)(ak, bk)) : (0, _sort$3.default)((0, _group$2.default)(values, key), ([ak, av], [bk, bv]) => reduce2(av, bv) || (0, _ascending$5.default)(ak, bk))).map(([key2]) => key2);
}
var bin$1 = {};
var array$2 = {};
Object.defineProperty(array$2, "__esModule", {
  value: true
});
array$2.slice = array$2.map = void 0;
var array$1 = Array.prototype;
var slice = array$1.slice;
array$2.slice = slice;
var map$3 = array$1.map;
array$2.map = map$3;
var constant$4 = {};
Object.defineProperty(constant$4, "__esModule", {
  value: true
});
constant$4.default = constant$3;
function constant$3(x2) {
  return () => x2;
}
var nice$4 = {};
var ticks$2 = {};
Object.defineProperty(ticks$2, "__esModule", {
  value: true
});
ticks$2.default = ticks$1;
ticks$2.tickIncrement = tickIncrement;
ticks$2.tickStep = tickStep;
var e10 = Math.sqrt(50), e5 = Math.sqrt(10), e2 = Math.sqrt(2);
function ticks$1(start2, stop2, count2) {
  var reverse2, i = -1, n, ticks2, step2;
  stop2 = +stop2, start2 = +start2, count2 = +count2;
  if (start2 === stop2 && count2 > 0) return [start2];
  if (reverse2 = stop2 < start2) n = start2, start2 = stop2, stop2 = n;
  if ((step2 = tickIncrement(start2, stop2, count2)) === 0 || !isFinite(step2)) return [];
  if (step2 > 0) {
    let r0 = Math.round(start2 / step2), r1 = Math.round(stop2 / step2);
    if (r0 * step2 < start2) ++r0;
    if (r1 * step2 > stop2) --r1;
    ticks2 = new Array(n = r1 - r0 + 1);
    while (++i < n) ticks2[i] = (r0 + i) * step2;
  } else {
    step2 = -step2;
    let r0 = Math.round(start2 * step2), r1 = Math.round(stop2 * step2);
    if (r0 / step2 < start2) ++r0;
    if (r1 / step2 > stop2) --r1;
    ticks2 = new Array(n = r1 - r0 + 1);
    while (++i < n) ticks2[i] = (r0 + i) / step2;
  }
  if (reverse2) ticks2.reverse();
  return ticks2;
}
function tickIncrement(start2, stop2, count2) {
  var step2 = (stop2 - start2) / Math.max(0, count2), power = Math.floor(Math.log(step2) / Math.LN10), error = step2 / Math.pow(10, power);
  return power >= 0 ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power) : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
}
function tickStep(start2, stop2, count2) {
  var step0 = Math.abs(stop2 - start2) / Math.max(0, count2), step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)), error = step0 / step1;
  if (error >= e10) step1 *= 10;
  else if (error >= e5) step1 *= 5;
  else if (error >= e2) step1 *= 2;
  return stop2 < start2 ? -step1 : step1;
}
Object.defineProperty(nice$4, "__esModule", {
  value: true
});
nice$4.default = nice$3;
var _ticks$1 = ticks$2;
function nice$3(start2, stop2, count2) {
  let prestep;
  while (true) {
    const step2 = (0, _ticks$1.tickIncrement)(start2, stop2, count2);
    if (step2 === prestep || step2 === 0 || !isFinite(step2)) {
      return [start2, stop2];
    } else if (step2 > 0) {
      start2 = Math.floor(start2 / step2) * step2;
      stop2 = Math.ceil(stop2 / step2) * step2;
    } else if (step2 < 0) {
      start2 = Math.ceil(start2 * step2) / step2;
      stop2 = Math.floor(stop2 * step2) / step2;
    }
    prestep = step2;
  }
}
var sturges = {};
Object.defineProperty(sturges, "__esModule", {
  value: true
});
sturges.default = thresholdSturges;
var _count$2 = _interopRequireDefault$L(count$1);
function _interopRequireDefault$L(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function thresholdSturges(values) {
  return Math.ceil(Math.log((0, _count$2.default)(values)) / Math.LN2) + 1;
}
Object.defineProperty(bin$1, "__esModule", {
  value: true
});
bin$1.default = bin;
var _array = array$2;
var _bisect = _interopRequireDefault$K(bisect);
var _constant$3 = _interopRequireDefault$K(constant$4);
var _extent = _interopRequireDefault$K(extent$2);
var _identity$1 = _interopRequireDefault$K(identity$6);
var _nice$3 = _interopRequireDefault$K(nice$4);
var _ticks = _interopRequireWildcard$d(ticks$2);
var _sturges = _interopRequireDefault$K(sturges);
function _getRequireWildcardCache$d(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$d = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$d(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$d(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function _interopRequireDefault$K(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function bin() {
  var value2 = _identity$1.default, domain2 = _extent.default, threshold2 = _sturges.default;
  function histogram(data) {
    if (!Array.isArray(data)) data = Array.from(data);
    var i, n = data.length, x2, step2, values = new Array(n);
    for (i = 0; i < n; ++i) {
      values[i] = value2(data[i], i, data);
    }
    var xz = domain2(values), x0 = xz[0], x1 = xz[1], tz = threshold2(values, x0, x1);
    if (!Array.isArray(tz)) {
      const max2 = x1, tn = +tz;
      if (domain2 === _extent.default) [x0, x1] = (0, _nice$3.default)(x0, x1, tn);
      tz = (0, _ticks.default)(x0, x1, tn);
      if (tz[0] <= x0) step2 = (0, _ticks.tickIncrement)(x0, x1, tn);
      if (tz[tz.length - 1] >= x1) {
        if (max2 >= x1 && domain2 === _extent.default) {
          const step3 = (0, _ticks.tickIncrement)(x0, x1, tn);
          if (isFinite(step3)) {
            if (step3 > 0) {
              x1 = (Math.floor(x1 / step3) + 1) * step3;
            } else if (step3 < 0) {
              x1 = (Math.ceil(x1 * -step3) + 1) / -step3;
            }
          }
        } else {
          tz.pop();
        }
      }
    }
    var m = tz.length, a2 = 0, b = m;
    while (tz[a2] <= x0) ++a2;
    while (tz[b - 1] > x1) --b;
    if (a2 || b < m) tz = tz.slice(a2, b), m = b - a2;
    var bins = new Array(m + 1), bin2;
    for (i = 0; i <= m; ++i) {
      bin2 = bins[i] = [];
      bin2.x0 = i > 0 ? tz[i - 1] : x0;
      bin2.x1 = i < m ? tz[i] : x1;
    }
    if (isFinite(step2)) {
      if (step2 > 0) {
        for (i = 0; i < n; ++i) {
          if ((x2 = values[i]) != null && x0 <= x2 && x2 <= x1) {
            bins[Math.min(m, Math.floor((x2 - x0) / step2))].push(data[i]);
          }
        }
      } else if (step2 < 0) {
        for (i = 0; i < n; ++i) {
          if ((x2 = values[i]) != null && x0 <= x2 && x2 <= x1) {
            const j = Math.floor((x0 - x2) * step2);
            bins[Math.min(m, j + (tz[j] <= x2))].push(data[i]);
          }
        }
      }
    } else {
      for (i = 0; i < n; ++i) {
        if ((x2 = values[i]) != null && x0 <= x2 && x2 <= x1) {
          bins[(0, _bisect.default)(tz, x2, 0, m)].push(data[i]);
        }
      }
    }
    return bins;
  }
  histogram.value = function(_) {
    return arguments.length ? (value2 = typeof _ === "function" ? _ : (0, _constant$3.default)(_), histogram) : value2;
  };
  histogram.domain = function(_) {
    return arguments.length ? (domain2 = typeof _ === "function" ? _ : (0, _constant$3.default)([_[0], _[1]]), histogram) : domain2;
  };
  histogram.thresholds = function(_) {
    return arguments.length ? (threshold2 = typeof _ === "function" ? _ : (0, _constant$3.default)(Array.isArray(_) ? _array.slice.call(_) : _), histogram) : threshold2;
  };
  return histogram;
}
var freedmanDiaconis = {};
var quantile$3 = {};
var max$1 = {};
Object.defineProperty(max$1, "__esModule", {
  value: true
});
max$1.default = max;
function max(values, valueof) {
  let max2;
  if (valueof === void 0) {
    for (const value2 of values) {
      if (value2 != null && (max2 < value2 || max2 === void 0 && value2 >= value2)) {
        max2 = value2;
      }
    }
  } else {
    let index2 = -1;
    for (let value2 of values) {
      if ((value2 = valueof(value2, ++index2, values)) != null && (max2 < value2 || max2 === void 0 && value2 >= value2)) {
        max2 = value2;
      }
    }
  }
  return max2;
}
var maxIndex$1 = {};
Object.defineProperty(maxIndex$1, "__esModule", {
  value: true
});
maxIndex$1.default = maxIndex;
function maxIndex(values, valueof) {
  let max2;
  let maxIndex2 = -1;
  let index2 = -1;
  if (valueof === void 0) {
    for (const value2 of values) {
      ++index2;
      if (value2 != null && (max2 < value2 || max2 === void 0 && value2 >= value2)) {
        max2 = value2, maxIndex2 = index2;
      }
    }
  } else {
    for (let value2 of values) {
      if ((value2 = valueof(value2, ++index2, values)) != null && (max2 < value2 || max2 === void 0 && value2 >= value2)) {
        max2 = value2, maxIndex2 = index2;
      }
    }
  }
  return maxIndex2;
}
var min$1 = {};
Object.defineProperty(min$1, "__esModule", {
  value: true
});
min$1.default = min;
function min(values, valueof) {
  let min2;
  if (valueof === void 0) {
    for (const value2 of values) {
      if (value2 != null && (min2 > value2 || min2 === void 0 && value2 >= value2)) {
        min2 = value2;
      }
    }
  } else {
    let index2 = -1;
    for (let value2 of values) {
      if ((value2 = valueof(value2, ++index2, values)) != null && (min2 > value2 || min2 === void 0 && value2 >= value2)) {
        min2 = value2;
      }
    }
  }
  return min2;
}
var minIndex$1 = {};
Object.defineProperty(minIndex$1, "__esModule", {
  value: true
});
minIndex$1.default = minIndex;
function minIndex(values, valueof) {
  let min2;
  let minIndex2 = -1;
  let index2 = -1;
  if (valueof === void 0) {
    for (const value2 of values) {
      ++index2;
      if (value2 != null && (min2 > value2 || min2 === void 0 && value2 >= value2)) {
        min2 = value2, minIndex2 = index2;
      }
    }
  } else {
    for (let value2 of values) {
      if ((value2 = valueof(value2, ++index2, values)) != null && (min2 > value2 || min2 === void 0 && value2 >= value2)) {
        min2 = value2, minIndex2 = index2;
      }
    }
  }
  return minIndex2;
}
var quickselect$1 = {};
Object.defineProperty(quickselect$1, "__esModule", {
  value: true
});
quickselect$1.default = quickselect;
var _sort$2 = sort$1;
function quickselect(array2, k2, left = 0, right = Infinity, compare) {
  k2 = Math.floor(k2);
  left = Math.floor(Math.max(0, left));
  right = Math.floor(Math.min(array2.length - 1, right));
  if (!(left <= k2 && k2 <= right)) return array2;
  compare = compare === void 0 ? _sort$2.ascendingDefined : (0, _sort$2.compareDefined)(compare);
  while (right > left) {
    if (right - left > 600) {
      const n = right - left + 1;
      const m = k2 - left + 1;
      const z = Math.log(n);
      const s2 = 0.5 * Math.exp(2 * z / 3);
      const sd = 0.5 * Math.sqrt(z * s2 * (n - s2) / n) * (m - n / 2 < 0 ? -1 : 1);
      const newLeft = Math.max(left, Math.floor(k2 - m * s2 / n + sd));
      const newRight = Math.min(right, Math.floor(k2 + (n - m) * s2 / n + sd));
      quickselect(array2, k2, newLeft, newRight, compare);
    }
    const t = array2[k2];
    let i = left;
    let j = right;
    swap(array2, left, k2);
    if (compare(array2[right], t) > 0) swap(array2, left, right);
    while (i < j) {
      swap(array2, i, j), ++i, --j;
      while (compare(array2[i], t) < 0) ++i;
      while (compare(array2[j], t) > 0) --j;
    }
    if (compare(array2[left], t) === 0) swap(array2, left, j);
    else ++j, swap(array2, j, right);
    if (j <= k2) left = j + 1;
    if (k2 <= j) right = j - 1;
  }
  return array2;
}
function swap(array2, i, j) {
  const t = array2[i];
  array2[i] = array2[j];
  array2[j] = t;
}
var greatest$1 = {};
Object.defineProperty(greatest$1, "__esModule", {
  value: true
});
greatest$1.default = greatest;
var _ascending$4 = _interopRequireDefault$J(ascending$2);
function _interopRequireDefault$J(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function greatest(values, compare = _ascending$4.default) {
  let max2;
  let defined = false;
  if (compare.length === 1) {
    let maxValue;
    for (const element of values) {
      const value2 = compare(element);
      if (defined ? (0, _ascending$4.default)(value2, maxValue) > 0 : (0, _ascending$4.default)(value2, value2) === 0) {
        max2 = element;
        maxValue = value2;
        defined = true;
      }
    }
  } else {
    for (const value2 of values) {
      if (defined ? compare(value2, max2) > 0 : compare(value2, value2) === 0) {
        max2 = value2;
        defined = true;
      }
    }
  }
  return max2;
}
Object.defineProperty(quantile$3, "__esModule", {
  value: true
});
quantile$3.default = quantile$2;
quantile$3.quantileIndex = quantileIndex;
quantile$3.quantileSorted = quantileSorted;
var _max = _interopRequireDefault$I(max$1);
var _maxIndex$1 = _interopRequireDefault$I(maxIndex$1);
var _min$1 = _interopRequireDefault$I(min$1);
var _minIndex$1 = _interopRequireDefault$I(minIndex$1);
var _quickselect = _interopRequireDefault$I(quickselect$1);
var _number$5 = _interopRequireWildcard$c(number$6);
var _sort$1 = sort$1;
var _greatest = _interopRequireDefault$I(greatest$1);
function _getRequireWildcardCache$c(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$c = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$c(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$c(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function _interopRequireDefault$I(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function quantile$2(values, p, valueof) {
  values = Float64Array.from((0, _number$5.numbers)(values, valueof));
  if (!(n = values.length) || isNaN(p = +p)) return;
  if (p <= 0 || n < 2) return (0, _min$1.default)(values);
  if (p >= 1) return (0, _max.default)(values);
  var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = (0, _max.default)((0, _quickselect.default)(values, i0).subarray(0, i0 + 1)), value1 = (0, _min$1.default)(values.subarray(i0 + 1));
  return value0 + (value1 - value0) * (i - i0);
}
function quantileSorted(values, p, valueof = _number$5.default) {
  if (!(n = values.length) || isNaN(p = +p)) return;
  if (p <= 0 || n < 2) return +valueof(values[0], 0, values);
  if (p >= 1) return +valueof(values[n - 1], n - 1, values);
  var n, i = (n - 1) * p, i0 = Math.floor(i), value0 = +valueof(values[i0], i0, values), value1 = +valueof(values[i0 + 1], i0 + 1, values);
  return value0 + (value1 - value0) * (i - i0);
}
function quantileIndex(values, p, valueof) {
  values = Float64Array.from((0, _number$5.numbers)(values, valueof));
  if (!(n = values.length) || isNaN(p = +p)) return;
  if (p <= 0 || n < 2) return (0, _minIndex$1.default)(values);
  if (p >= 1) return (0, _maxIndex$1.default)(values);
  var n, i = Math.floor((n - 1) * p), order = (i2, j) => (0, _sort$1.ascendingDefined)(values[i2], values[j]), index2 = (0, _quickselect.default)(Uint32Array.from(values, (_, i2) => i2), i, 0, n - 1, order);
  return (0, _greatest.default)(index2.subarray(0, i + 1), (i2) => values[i2]);
}
Object.defineProperty(freedmanDiaconis, "__esModule", {
  value: true
});
freedmanDiaconis.default = thresholdFreedmanDiaconis;
var _count$1 = _interopRequireDefault$H(count$1);
var _quantile$1 = _interopRequireDefault$H(quantile$3);
function _interopRequireDefault$H(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function thresholdFreedmanDiaconis(values, min2, max2) {
  return Math.ceil((max2 - min2) / (2 * ((0, _quantile$1.default)(values, 0.75) - (0, _quantile$1.default)(values, 0.25)) * Math.pow((0, _count$1.default)(values), -1 / 3)));
}
var scott = {};
Object.defineProperty(scott, "__esModule", {
  value: true
});
scott.default = thresholdScott;
var _count = _interopRequireDefault$G(count$1);
var _deviation = _interopRequireDefault$G(deviation$1);
function _interopRequireDefault$G(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function thresholdScott(values, min2, max2) {
  return Math.ceil((max2 - min2) * Math.cbrt((0, _count.default)(values)) / (3.49 * (0, _deviation.default)(values)));
}
var mean$1 = {};
Object.defineProperty(mean$1, "__esModule", {
  value: true
});
mean$1.default = mean;
function mean(values, valueof) {
  let count2 = 0;
  let sum2 = 0;
  if (valueof === void 0) {
    for (let value2 of values) {
      if (value2 != null && (value2 = +value2) >= value2) {
        ++count2, sum2 += value2;
      }
    }
  } else {
    let index2 = -1;
    for (let value2 of values) {
      if ((value2 = valueof(value2, ++index2, values)) != null && (value2 = +value2) >= value2) {
        ++count2, sum2 += value2;
      }
    }
  }
  if (count2) return sum2 / count2;
}
var median$1 = {};
Object.defineProperty(median$1, "__esModule", {
  value: true
});
median$1.default = median;
median$1.medianIndex = medianIndex;
var _quantile = _interopRequireWildcard$b(quantile$3);
function _getRequireWildcardCache$b(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$b = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$b(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$b(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function median(values, valueof) {
  return (0, _quantile.default)(values, 0.5, valueof);
}
function medianIndex(values, valueof) {
  return (0, _quantile.quantileIndex)(values, 0.5, valueof);
}
var merge$1 = {};
Object.defineProperty(merge$1, "__esModule", {
  value: true
});
merge$1.default = merge;
function* flatten(arrays) {
  for (const array2 of arrays) {
    yield* array2;
  }
}
function merge(arrays) {
  return Array.from(flatten(arrays));
}
var mode$1 = {};
Object.defineProperty(mode$1, "__esModule", {
  value: true
});
mode$1.default = mode;
var _index$p = src$5;
function mode(values, valueof) {
  const counts = new _index$p.InternMap();
  if (valueof === void 0) {
    for (let value2 of values) {
      if (value2 != null && value2 >= value2) {
        counts.set(value2, (counts.get(value2) || 0) + 1);
      }
    }
  } else {
    let index2 = -1;
    for (let value2 of values) {
      if ((value2 = valueof(value2, ++index2, values)) != null && value2 >= value2) {
        counts.set(value2, (counts.get(value2) || 0) + 1);
      }
    }
  }
  let modeValue;
  let modeCount = 0;
  for (const [value2, count2] of counts) {
    if (count2 > modeCount) {
      modeCount = count2;
      modeValue = value2;
    }
  }
  return modeValue;
}
var pairs$1 = {};
Object.defineProperty(pairs$1, "__esModule", {
  value: true
});
pairs$1.default = pairs;
pairs$1.pair = pair;
function pairs(values, pairof = pair) {
  const pairs2 = [];
  let previous;
  let first = false;
  for (const value2 of values) {
    if (first) pairs2.push(pairof(previous, value2));
    previous = value2;
    first = true;
  }
  return pairs2;
}
function pair(a2, b) {
  return [a2, b];
}
var range$3 = {};
Object.defineProperty(range$3, "__esModule", {
  value: true
});
range$3.default = range$2;
function range$2(start2, stop2, step2) {
  start2 = +start2, stop2 = +stop2, step2 = (n = arguments.length) < 2 ? (stop2 = start2, start2 = 0, 1) : n < 3 ? 1 : +step2;
  var i = -1, n = Math.max(0, Math.ceil((stop2 - start2) / step2)) | 0, range2 = new Array(n);
  while (++i < n) {
    range2[i] = start2 + i * step2;
  }
  return range2;
}
var rank$1 = {};
Object.defineProperty(rank$1, "__esModule", {
  value: true
});
rank$1.default = rank;
var _ascending$3 = _interopRequireDefault$F(ascending$2);
var _sort = sort$1;
function _interopRequireDefault$F(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function rank(values, valueof = _ascending$3.default) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  let V = Array.from(values);
  const R = new Float64Array(V.length);
  if (valueof.length !== 2) V = V.map(valueof), valueof = _ascending$3.default;
  const compareIndex = (i, j) => valueof(V[i], V[j]);
  let k2, r;
  Uint32Array.from(V, (_, i) => i).sort(valueof === _ascending$3.default ? (i, j) => (0, _sort.ascendingDefined)(V[i], V[j]) : (0, _sort.compareDefined)(compareIndex)).forEach((j, i) => {
    const c6 = compareIndex(j, k2 === void 0 ? j : k2);
    if (c6 >= 0) {
      if (k2 === void 0 || c6 > 0) k2 = j, r = i;
      R[j] = r;
    } else {
      R[j] = NaN;
    }
  });
  return R;
}
var least$1 = {};
Object.defineProperty(least$1, "__esModule", {
  value: true
});
least$1.default = least;
var _ascending$2 = _interopRequireDefault$E(ascending$2);
function _interopRequireDefault$E(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function least(values, compare = _ascending$2.default) {
  let min2;
  let defined = false;
  if (compare.length === 1) {
    let minValue;
    for (const element of values) {
      const value2 = compare(element);
      if (defined ? (0, _ascending$2.default)(value2, minValue) < 0 : (0, _ascending$2.default)(value2, value2) === 0) {
        min2 = element;
        minValue = value2;
        defined = true;
      }
    }
  } else {
    for (const value2 of values) {
      if (defined ? compare(value2, min2) < 0 : compare(value2, value2) === 0) {
        min2 = value2;
        defined = true;
      }
    }
  }
  return min2;
}
var leastIndex$1 = {};
Object.defineProperty(leastIndex$1, "__esModule", {
  value: true
});
leastIndex$1.default = leastIndex;
var _ascending$1 = _interopRequireDefault$D(ascending$2);
var _minIndex = _interopRequireDefault$D(minIndex$1);
function _interopRequireDefault$D(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function leastIndex(values, compare = _ascending$1.default) {
  if (compare.length === 1) return (0, _minIndex.default)(values, compare);
  let minValue;
  let min2 = -1;
  let index2 = -1;
  for (const value2 of values) {
    ++index2;
    if (min2 < 0 ? compare(value2, value2) === 0 : compare(value2, minValue) < 0) {
      minValue = value2;
      min2 = index2;
    }
  }
  return min2;
}
var greatestIndex$1 = {};
Object.defineProperty(greatestIndex$1, "__esModule", {
  value: true
});
greatestIndex$1.default = greatestIndex;
var _ascending = _interopRequireDefault$C(ascending$2);
var _maxIndex = _interopRequireDefault$C(maxIndex$1);
function _interopRequireDefault$C(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function greatestIndex(values, compare = _ascending.default) {
  if (compare.length === 1) return (0, _maxIndex.default)(values, compare);
  let maxValue;
  let max2 = -1;
  let index2 = -1;
  for (const value2 of values) {
    ++index2;
    if (max2 < 0 ? compare(value2, value2) === 0 : compare(value2, maxValue) > 0) {
      maxValue = value2;
      max2 = index2;
    }
  }
  return max2;
}
var scan$1 = {};
Object.defineProperty(scan$1, "__esModule", {
  value: true
});
scan$1.default = scan;
var _leastIndex = _interopRequireDefault$B(leastIndex$1);
function _interopRequireDefault$B(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function scan(values, compare) {
  const index2 = (0, _leastIndex.default)(values, compare);
  return index2 < 0 ? void 0 : index2;
}
var shuffle = {};
Object.defineProperty(shuffle, "__esModule", {
  value: true
});
shuffle.default = void 0;
shuffle.shuffler = shuffler;
var _default$C = shuffler(Math.random);
shuffle.default = _default$C;
function shuffler(random) {
  return function shuffle2(array2, i0 = 0, i1 = array2.length) {
    let m = i1 - (i0 = +i0);
    while (m) {
      const i = random() * m-- | 0, t = array2[m + i0];
      array2[m + i0] = array2[i + i0];
      array2[i + i0] = t;
    }
    return array2;
  };
}
var sum$1 = {};
Object.defineProperty(sum$1, "__esModule", {
  value: true
});
sum$1.default = sum;
function sum(values, valueof) {
  let sum2 = 0;
  if (valueof === void 0) {
    for (let value2 of values) {
      if (value2 = +value2) {
        sum2 += value2;
      }
    }
  } else {
    let index2 = -1;
    for (let value2 of values) {
      if (value2 = +valueof(value2, ++index2, values)) {
        sum2 += value2;
      }
    }
  }
  return sum2;
}
var transpose$1 = {};
Object.defineProperty(transpose$1, "__esModule", {
  value: true
});
transpose$1.default = transpose;
var _min = _interopRequireDefault$A(min$1);
function _interopRequireDefault$A(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function transpose(matrix) {
  if (!(n = matrix.length)) return [];
  for (var i = -1, m = (0, _min.default)(matrix, length), transpose2 = new Array(m); ++i < m; ) {
    for (var j = -1, n, row = transpose2[i] = new Array(n); ++j < n; ) {
      row[j] = matrix[j][i];
    }
  }
  return transpose2;
}
function length(d) {
  return d.length;
}
var zip$1 = {};
Object.defineProperty(zip$1, "__esModule", {
  value: true
});
zip$1.default = zip;
var _transpose = _interopRequireDefault$z(transpose$1);
function _interopRequireDefault$z(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function zip() {
  return (0, _transpose.default)(arguments);
}
var every$1 = {};
Object.defineProperty(every$1, "__esModule", {
  value: true
});
every$1.default = every;
function every(values, test) {
  if (typeof test !== "function") throw new TypeError("test is not a function");
  let index2 = -1;
  for (const value2 of values) {
    if (!test(value2, ++index2, values)) {
      return false;
    }
  }
  return true;
}
var some$1 = {};
Object.defineProperty(some$1, "__esModule", {
  value: true
});
some$1.default = some;
function some(values, test) {
  if (typeof test !== "function") throw new TypeError("test is not a function");
  let index2 = -1;
  for (const value2 of values) {
    if (test(value2, ++index2, values)) {
      return true;
    }
  }
  return false;
}
var filter$1 = {};
Object.defineProperty(filter$1, "__esModule", {
  value: true
});
filter$1.default = filter;
function filter(values, test) {
  if (typeof test !== "function") throw new TypeError("test is not a function");
  const array2 = [];
  let index2 = -1;
  for (const value2 of values) {
    if (test(value2, ++index2, values)) {
      array2.push(value2);
    }
  }
  return array2;
}
var map$2 = {};
Object.defineProperty(map$2, "__esModule", {
  value: true
});
map$2.default = map$1;
function map$1(values, mapper) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  if (typeof mapper !== "function") throw new TypeError("mapper is not a function");
  return Array.from(values, (value2, index2) => mapper(value2, index2, values));
}
var reduce$1 = {};
Object.defineProperty(reduce$1, "__esModule", {
  value: true
});
reduce$1.default = reduce;
function reduce(values, reducer2, value2) {
  if (typeof reducer2 !== "function") throw new TypeError("reducer is not a function");
  const iterator = values[Symbol.iterator]();
  let done, next, index2 = -1;
  if (arguments.length < 3) {
    ({
      done,
      value: value2
    } = iterator.next());
    if (done) return;
    ++index2;
  }
  while ({
    done,
    value: next
  } = iterator.next(), !done) {
    value2 = reducer2(value2, next, ++index2, values);
  }
  return value2;
}
var reverse$2 = {};
Object.defineProperty(reverse$2, "__esModule", {
  value: true
});
reverse$2.default = reverse$1;
function reverse$1(values) {
  if (typeof values[Symbol.iterator] !== "function") throw new TypeError("values is not iterable");
  return Array.from(values).reverse();
}
var difference$1 = {};
Object.defineProperty(difference$1, "__esModule", {
  value: true
});
difference$1.default = difference;
var _index$o = src$5;
function difference(values, ...others) {
  values = new _index$o.InternSet(values);
  for (const other of others) {
    for (const value2 of other) {
      values.delete(value2);
    }
  }
  return values;
}
var disjoint$1 = {};
Object.defineProperty(disjoint$1, "__esModule", {
  value: true
});
disjoint$1.default = disjoint;
var _index$n = src$5;
function disjoint(values, other) {
  const iterator = other[Symbol.iterator](), set2 = new _index$n.InternSet();
  for (const v of values) {
    if (set2.has(v)) return false;
    let value2, done;
    while ({
      value: value2,
      done
    } = iterator.next()) {
      if (done) break;
      if (Object.is(v, value2)) return false;
      set2.add(value2);
    }
  }
  return true;
}
var intersection$1 = {};
Object.defineProperty(intersection$1, "__esModule", {
  value: true
});
intersection$1.default = intersection;
var _index$m = src$5;
function intersection(values, ...others) {
  values = new _index$m.InternSet(values);
  others = others.map(set);
  out: for (const value2 of values) {
    for (const other of others) {
      if (!other.has(value2)) {
        values.delete(value2);
        continue out;
      }
    }
  }
  return values;
}
function set(values) {
  return values instanceof _index$m.InternSet ? values : new _index$m.InternSet(values);
}
var subset$1 = {};
var superset$1 = {};
Object.defineProperty(superset$1, "__esModule", {
  value: true
});
superset$1.default = superset;
function superset(values, other) {
  const iterator = values[Symbol.iterator](), set2 = /* @__PURE__ */ new Set();
  for (const o of other) {
    const io = intern(o);
    if (set2.has(io)) continue;
    let value2, done;
    while ({
      value: value2,
      done
    } = iterator.next()) {
      if (done) return false;
      const ivalue = intern(value2);
      set2.add(ivalue);
      if (Object.is(io, ivalue)) break;
    }
  }
  return true;
}
function intern(value2) {
  return value2 !== null && typeof value2 === "object" ? value2.valueOf() : value2;
}
Object.defineProperty(subset$1, "__esModule", {
  value: true
});
subset$1.default = subset;
var _superset = _interopRequireDefault$y(superset$1);
function _interopRequireDefault$y(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function subset(values, other) {
  return (0, _superset.default)(other, values);
}
var union$1 = {};
Object.defineProperty(union$1, "__esModule", {
  value: true
});
union$1.default = union;
var _index$l = src$5;
function union(...others) {
  const set2 = new _index$l.InternSet();
  for (const other of others) {
    for (const o of other) {
      set2.add(o);
    }
  }
  return set2;
}
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "Adder", {
    enumerable: true,
    get: function() {
      return _fsum.Adder;
    }
  });
  Object.defineProperty(exports, "InternMap", {
    enumerable: true,
    get: function() {
      return _index3.InternMap;
    }
  });
  Object.defineProperty(exports, "InternSet", {
    enumerable: true,
    get: function() {
      return _index3.InternSet;
    }
  });
  Object.defineProperty(exports, "ascending", {
    enumerable: true,
    get: function() {
      return _ascending2.default;
    }
  });
  Object.defineProperty(exports, "bin", {
    enumerable: true,
    get: function() {
      return _bin.default;
    }
  });
  Object.defineProperty(exports, "bisect", {
    enumerable: true,
    get: function() {
      return _bisect2.default;
    }
  });
  Object.defineProperty(exports, "bisectCenter", {
    enumerable: true,
    get: function() {
      return _bisect2.bisectCenter;
    }
  });
  Object.defineProperty(exports, "bisectLeft", {
    enumerable: true,
    get: function() {
      return _bisect2.bisectLeft;
    }
  });
  Object.defineProperty(exports, "bisectRight", {
    enumerable: true,
    get: function() {
      return _bisect2.bisectRight;
    }
  });
  Object.defineProperty(exports, "bisector", {
    enumerable: true,
    get: function() {
      return _bisector2.default;
    }
  });
  Object.defineProperty(exports, "blur", {
    enumerable: true,
    get: function() {
      return _blur.blur;
    }
  });
  Object.defineProperty(exports, "blur2", {
    enumerable: true,
    get: function() {
      return _blur.blur2;
    }
  });
  Object.defineProperty(exports, "blurImage", {
    enumerable: true,
    get: function() {
      return _blur.blurImage;
    }
  });
  Object.defineProperty(exports, "count", {
    enumerable: true,
    get: function() {
      return _count2.default;
    }
  });
  Object.defineProperty(exports, "cross", {
    enumerable: true,
    get: function() {
      return _cross.default;
    }
  });
  Object.defineProperty(exports, "cumsum", {
    enumerable: true,
    get: function() {
      return _cumsum.default;
    }
  });
  Object.defineProperty(exports, "descending", {
    enumerable: true,
    get: function() {
      return _descending2.default;
    }
  });
  Object.defineProperty(exports, "deviation", {
    enumerable: true,
    get: function() {
      return _deviation2.default;
    }
  });
  Object.defineProperty(exports, "difference", {
    enumerable: true,
    get: function() {
      return _difference.default;
    }
  });
  Object.defineProperty(exports, "disjoint", {
    enumerable: true,
    get: function() {
      return _disjoint.default;
    }
  });
  Object.defineProperty(exports, "every", {
    enumerable: true,
    get: function() {
      return _every.default;
    }
  });
  Object.defineProperty(exports, "extent", {
    enumerable: true,
    get: function() {
      return _extent2.default;
    }
  });
  Object.defineProperty(exports, "fcumsum", {
    enumerable: true,
    get: function() {
      return _fsum.fcumsum;
    }
  });
  Object.defineProperty(exports, "filter", {
    enumerable: true,
    get: function() {
      return _filter.default;
    }
  });
  Object.defineProperty(exports, "flatGroup", {
    enumerable: true,
    get: function() {
      return _group2.flatGroup;
    }
  });
  Object.defineProperty(exports, "flatRollup", {
    enumerable: true,
    get: function() {
      return _group2.flatRollup;
    }
  });
  Object.defineProperty(exports, "fsum", {
    enumerable: true,
    get: function() {
      return _fsum.fsum;
    }
  });
  Object.defineProperty(exports, "greatest", {
    enumerable: true,
    get: function() {
      return _greatest2.default;
    }
  });
  Object.defineProperty(exports, "greatestIndex", {
    enumerable: true,
    get: function() {
      return _greatestIndex.default;
    }
  });
  Object.defineProperty(exports, "group", {
    enumerable: true,
    get: function() {
      return _group2.default;
    }
  });
  Object.defineProperty(exports, "groupSort", {
    enumerable: true,
    get: function() {
      return _groupSort.default;
    }
  });
  Object.defineProperty(exports, "groups", {
    enumerable: true,
    get: function() {
      return _group2.groups;
    }
  });
  Object.defineProperty(exports, "histogram", {
    enumerable: true,
    get: function() {
      return _bin.default;
    }
  });
  Object.defineProperty(exports, "index", {
    enumerable: true,
    get: function() {
      return _group2.index;
    }
  });
  Object.defineProperty(exports, "indexes", {
    enumerable: true,
    get: function() {
      return _group2.indexes;
    }
  });
  Object.defineProperty(exports, "intersection", {
    enumerable: true,
    get: function() {
      return _intersection.default;
    }
  });
  Object.defineProperty(exports, "least", {
    enumerable: true,
    get: function() {
      return _least.default;
    }
  });
  Object.defineProperty(exports, "leastIndex", {
    enumerable: true,
    get: function() {
      return _leastIndex2.default;
    }
  });
  Object.defineProperty(exports, "map", {
    enumerable: true,
    get: function() {
      return _map.default;
    }
  });
  Object.defineProperty(exports, "max", {
    enumerable: true,
    get: function() {
      return _max2.default;
    }
  });
  Object.defineProperty(exports, "maxIndex", {
    enumerable: true,
    get: function() {
      return _maxIndex2.default;
    }
  });
  Object.defineProperty(exports, "mean", {
    enumerable: true,
    get: function() {
      return _mean.default;
    }
  });
  Object.defineProperty(exports, "median", {
    enumerable: true,
    get: function() {
      return _median.default;
    }
  });
  Object.defineProperty(exports, "medianIndex", {
    enumerable: true,
    get: function() {
      return _median.medianIndex;
    }
  });
  Object.defineProperty(exports, "merge", {
    enumerable: true,
    get: function() {
      return _merge.default;
    }
  });
  Object.defineProperty(exports, "min", {
    enumerable: true,
    get: function() {
      return _min2.default;
    }
  });
  Object.defineProperty(exports, "minIndex", {
    enumerable: true,
    get: function() {
      return _minIndex2.default;
    }
  });
  Object.defineProperty(exports, "mode", {
    enumerable: true,
    get: function() {
      return _mode.default;
    }
  });
  Object.defineProperty(exports, "nice", {
    enumerable: true,
    get: function() {
      return _nice2.default;
    }
  });
  Object.defineProperty(exports, "pairs", {
    enumerable: true,
    get: function() {
      return _pairs.default;
    }
  });
  Object.defineProperty(exports, "permute", {
    enumerable: true,
    get: function() {
      return _permute2.default;
    }
  });
  Object.defineProperty(exports, "quantile", {
    enumerable: true,
    get: function() {
      return _quantile2.default;
    }
  });
  Object.defineProperty(exports, "quantileIndex", {
    enumerable: true,
    get: function() {
      return _quantile2.quantileIndex;
    }
  });
  Object.defineProperty(exports, "quantileSorted", {
    enumerable: true,
    get: function() {
      return _quantile2.quantileSorted;
    }
  });
  Object.defineProperty(exports, "quickselect", {
    enumerable: true,
    get: function() {
      return _quickselect2.default;
    }
  });
  Object.defineProperty(exports, "range", {
    enumerable: true,
    get: function() {
      return _range2.default;
    }
  });
  Object.defineProperty(exports, "rank", {
    enumerable: true,
    get: function() {
      return _rank.default;
    }
  });
  Object.defineProperty(exports, "reduce", {
    enumerable: true,
    get: function() {
      return _reduce.default;
    }
  });
  Object.defineProperty(exports, "reverse", {
    enumerable: true,
    get: function() {
      return _reverse2.default;
    }
  });
  Object.defineProperty(exports, "rollup", {
    enumerable: true,
    get: function() {
      return _group2.rollup;
    }
  });
  Object.defineProperty(exports, "rollups", {
    enumerable: true,
    get: function() {
      return _group2.rollups;
    }
  });
  Object.defineProperty(exports, "scan", {
    enumerable: true,
    get: function() {
      return _scan.default;
    }
  });
  Object.defineProperty(exports, "shuffle", {
    enumerable: true,
    get: function() {
      return _shuffle.default;
    }
  });
  Object.defineProperty(exports, "shuffler", {
    enumerable: true,
    get: function() {
      return _shuffle.shuffler;
    }
  });
  Object.defineProperty(exports, "some", {
    enumerable: true,
    get: function() {
      return _some.default;
    }
  });
  Object.defineProperty(exports, "sort", {
    enumerable: true,
    get: function() {
      return _sort2.default;
    }
  });
  Object.defineProperty(exports, "subset", {
    enumerable: true,
    get: function() {
      return _subset.default;
    }
  });
  Object.defineProperty(exports, "sum", {
    enumerable: true,
    get: function() {
      return _sum.default;
    }
  });
  Object.defineProperty(exports, "superset", {
    enumerable: true,
    get: function() {
      return _superset2.default;
    }
  });
  Object.defineProperty(exports, "thresholdFreedmanDiaconis", {
    enumerable: true,
    get: function() {
      return _freedmanDiaconis.default;
    }
  });
  Object.defineProperty(exports, "thresholdScott", {
    enumerable: true,
    get: function() {
      return _scott.default;
    }
  });
  Object.defineProperty(exports, "thresholdSturges", {
    enumerable: true,
    get: function() {
      return _sturges2.default;
    }
  });
  Object.defineProperty(exports, "tickIncrement", {
    enumerable: true,
    get: function() {
      return _ticks2.tickIncrement;
    }
  });
  Object.defineProperty(exports, "tickStep", {
    enumerable: true,
    get: function() {
      return _ticks2.tickStep;
    }
  });
  Object.defineProperty(exports, "ticks", {
    enumerable: true,
    get: function() {
      return _ticks2.default;
    }
  });
  Object.defineProperty(exports, "transpose", {
    enumerable: true,
    get: function() {
      return _transpose2.default;
    }
  });
  Object.defineProperty(exports, "union", {
    enumerable: true,
    get: function() {
      return _union.default;
    }
  });
  Object.defineProperty(exports, "variance", {
    enumerable: true,
    get: function() {
      return _variance2.default;
    }
  });
  Object.defineProperty(exports, "zip", {
    enumerable: true,
    get: function() {
      return _zip.default;
    }
  });
  var _bisect2 = _interopRequireWildcard2(bisect);
  var _ascending2 = _interopRequireDefault2(ascending$2);
  var _bisector2 = _interopRequireDefault2(bisector$2);
  var _blur = blur$1;
  var _count2 = _interopRequireDefault2(count$1);
  var _cross = _interopRequireDefault2(cross$1);
  var _cumsum = _interopRequireDefault2(cumsum$1);
  var _descending2 = _interopRequireDefault2(descending$2);
  var _deviation2 = _interopRequireDefault2(deviation$1);
  var _extent2 = _interopRequireDefault2(extent$2);
  var _fsum = fsum$1;
  var _group2 = _interopRequireWildcard2(group$1);
  var _groupSort = _interopRequireDefault2(groupSort$1);
  var _bin = _interopRequireDefault2(bin$1);
  var _freedmanDiaconis = _interopRequireDefault2(freedmanDiaconis);
  var _scott = _interopRequireDefault2(scott);
  var _sturges2 = _interopRequireDefault2(sturges);
  var _max2 = _interopRequireDefault2(max$1);
  var _maxIndex2 = _interopRequireDefault2(maxIndex$1);
  var _mean = _interopRequireDefault2(mean$1);
  var _median = _interopRequireWildcard2(median$1);
  var _merge = _interopRequireDefault2(merge$1);
  var _min2 = _interopRequireDefault2(min$1);
  var _minIndex2 = _interopRequireDefault2(minIndex$1);
  var _mode = _interopRequireDefault2(mode$1);
  var _nice2 = _interopRequireDefault2(nice$4);
  var _pairs = _interopRequireDefault2(pairs$1);
  var _permute2 = _interopRequireDefault2(permute$1);
  var _quantile2 = _interopRequireWildcard2(quantile$3);
  var _quickselect2 = _interopRequireDefault2(quickselect$1);
  var _range2 = _interopRequireDefault2(range$3);
  var _rank = _interopRequireDefault2(rank$1);
  var _least = _interopRequireDefault2(least$1);
  var _leastIndex2 = _interopRequireDefault2(leastIndex$1);
  var _greatest2 = _interopRequireDefault2(greatest$1);
  var _greatestIndex = _interopRequireDefault2(greatestIndex$1);
  var _scan = _interopRequireDefault2(scan$1);
  var _shuffle = _interopRequireWildcard2(shuffle);
  var _sum = _interopRequireDefault2(sum$1);
  var _ticks2 = _interopRequireWildcard2(ticks$2);
  var _transpose2 = _interopRequireDefault2(transpose$1);
  var _variance2 = _interopRequireDefault2(variance$1);
  var _zip = _interopRequireDefault2(zip$1);
  var _every = _interopRequireDefault2(every$1);
  var _some = _interopRequireDefault2(some$1);
  var _filter = _interopRequireDefault2(filter$1);
  var _map = _interopRequireDefault2(map$2);
  var _reduce = _interopRequireDefault2(reduce$1);
  var _reverse2 = _interopRequireDefault2(reverse$2);
  var _sort2 = _interopRequireDefault2(sort$1);
  var _difference = _interopRequireDefault2(difference$1);
  var _disjoint = _interopRequireDefault2(disjoint$1);
  var _intersection = _interopRequireDefault2(intersection$1);
  var _subset = _interopRequireDefault2(subset$1);
  var _superset2 = _interopRequireDefault2(superset$1);
  var _union = _interopRequireDefault2(union$1);
  var _index3 = src$5;
  function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _getRequireWildcardCache2(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache2 = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard2(obj, nodeInterop) {
    if (obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache2(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
})(src$6);
var init = {};
Object.defineProperty(init, "__esModule", {
  value: true
});
init.initInterpolator = initInterpolator;
init.initRange = initRange;
function initRange(domain2, range2) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain2);
      break;
    default:
      this.range(range2).domain(domain2);
      break;
  }
  return this;
}
function initInterpolator(domain2, interpolator) {
  switch (arguments.length) {
    case 0:
      break;
    case 1: {
      if (typeof domain2 === "function") this.interpolator(domain2);
      else this.range(domain2);
      break;
    }
    default: {
      this.domain(domain2);
      if (typeof interpolator === "function") this.interpolator(interpolator);
      else this.range(interpolator);
      break;
    }
  }
  return this;
}
var ordinal$1 = {};
Object.defineProperty(ordinal$1, "__esModule", {
  value: true
});
ordinal$1.default = ordinal;
ordinal$1.implicit = void 0;
var _index$k = src$6;
var _init$e = init;
const implicit = Symbol("implicit");
ordinal$1.implicit = implicit;
function ordinal() {
  var index2 = new _index$k.InternMap(), domain2 = [], range2 = [], unknown2 = implicit;
  function scale(d) {
    let i = index2.get(d);
    if (i === void 0) {
      if (unknown2 !== implicit) return unknown2;
      index2.set(d, i = domain2.push(d) - 1);
    }
    return range2[i % range2.length];
  }
  scale.domain = function(_) {
    if (!arguments.length) return domain2.slice();
    domain2 = [], index2 = new _index$k.InternMap();
    for (const value2 of _) {
      if (index2.has(value2)) continue;
      index2.set(value2, domain2.push(value2) - 1);
    }
    return scale;
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), scale) : range2.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown2 = _, scale) : unknown2;
  };
  scale.copy = function() {
    return ordinal(domain2, range2).unknown(unknown2);
  };
  _init$e.initRange.apply(scale, arguments);
  return scale;
}
Object.defineProperty(band$1, "__esModule", {
  value: true
});
band$1.default = band;
band$1.point = point;
var _index$j = src$6;
var _init$d = init;
var _ordinal = _interopRequireDefault$x(ordinal$1);
function _interopRequireDefault$x(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function band() {
  var scale = (0, _ordinal.default)().unknown(void 0), domain2 = scale.domain, ordinalRange = scale.range, r0 = 0, r1 = 1, step2, bandwidth, round2 = false, paddingInner = 0, paddingOuter = 0, align2 = 0.5;
  delete scale.unknown;
  function rescale() {
    var n = domain2().length, reverse2 = r1 < r0, start2 = reverse2 ? r1 : r0, stop2 = reverse2 ? r0 : r1;
    step2 = (stop2 - start2) / Math.max(1, n - paddingInner + paddingOuter * 2);
    if (round2) step2 = Math.floor(step2);
    start2 += (stop2 - start2 - step2 * (n - paddingInner)) * align2;
    bandwidth = step2 * (1 - paddingInner);
    if (round2) start2 = Math.round(start2), bandwidth = Math.round(bandwidth);
    var values = (0, _index$j.range)(n).map(function(i) {
      return start2 + step2 * i;
    });
    return ordinalRange(reverse2 ? values.reverse() : values);
  }
  scale.domain = function(_) {
    return arguments.length ? (domain2(_), rescale()) : domain2();
  };
  scale.range = function(_) {
    return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
  };
  scale.rangeRound = function(_) {
    return [r0, r1] = _, r0 = +r0, r1 = +r1, round2 = true, rescale();
  };
  scale.bandwidth = function() {
    return bandwidth;
  };
  scale.step = function() {
    return step2;
  };
  scale.round = function(_) {
    return arguments.length ? (round2 = !!_, rescale()) : round2;
  };
  scale.padding = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
  };
  scale.paddingInner = function(_) {
    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
  };
  scale.paddingOuter = function(_) {
    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
  };
  scale.align = function(_) {
    return arguments.length ? (align2 = Math.max(0, Math.min(1, _)), rescale()) : align2;
  };
  scale.copy = function() {
    return band(domain2(), [r0, r1]).round(round2).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align2);
  };
  return _init$d.initRange.apply(rescale(), arguments);
}
function pointish(scale) {
  var copy2 = scale.copy;
  scale.padding = scale.paddingOuter;
  delete scale.paddingInner;
  delete scale.paddingOuter;
  scale.copy = function() {
    return pointish(copy2());
  };
  return scale;
}
function point() {
  return pointish(band.apply(null, arguments).paddingInner(1));
}
var identity$4 = {};
var linear$2 = {};
var continuous$1 = {};
var src$4 = {};
var value = {};
var src$3 = {};
var color$2 = {};
var define = {};
Object.defineProperty(define, "__esModule", {
  value: true
});
define.default = _default$B;
define.extend = extend$1;
function _default$B(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend$1(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}
Object.defineProperty(color$2, "__esModule", {
  value: true
});
color$2.Color = Color;
color$2.Rgb = Rgb;
color$2.darker = color$2.brighter = void 0;
color$2.default = color$1;
color$2.hsl = hsl$3;
color$2.hslConvert = hslConvert;
color$2.rgb = rgb$2;
color$2.rgbConvert = rgbConvert;
var _define$2 = _interopRequireWildcard$a(define);
function _getRequireWildcardCache$a(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$a = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$a(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$a(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function Color() {
}
var darker = 0.7;
color$2.darker = darker;
var brighter = 1 / darker;
color$2.brighter = brighter;
var reI = "\\s*([+-]?\\d+)\\s*", reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*", reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*", reHex = /^#([0-9a-f]{3,8})$/, reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`), reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`), reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`), reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`), reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`), reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
(0, _define$2.default)(Color, color$1, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color$1(format2) {
  var m, l;
  format2 = (format2 + "").trim().toLowerCase();
  return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba$1(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba$1(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba$1(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba$1(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla$1(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla$1(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba$1(r, g, b, a2) {
  if (a2 <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a2);
}
function rgbConvert(o) {
  if (!(o instanceof Color)) o = color$1(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb$2(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
(0, _define$2.default)(Rgb, rgb$2, (0, _define$2.extend)(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Rgb(this.r * k2, this.g * k2, this.b * k2, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a2 = clampa(this.opacity);
  return `${a2 === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a2 === 1 ? ")" : `, ${a2})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value2) {
  return Math.max(0, Math.min(255, Math.round(value2) || 0));
}
function hex(value2) {
  value2 = clampi(value2);
  return (value2 < 16 ? "0" : "") + value2.toString(16);
}
function hsla$1(h, s2, l, a2) {
  if (a2 <= 0) h = s2 = l = NaN;
  else if (l <= 0 || l >= 1) h = s2 = NaN;
  else if (s2 <= 0) h = NaN;
  return new Hsl(h, s2, l, a2);
}
function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color$1(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min2 = Math.min(r, g, b), max2 = Math.max(r, g, b), h = NaN, s2 = max2 - min2, l = (max2 + min2) / 2;
  if (s2) {
    if (r === max2) h = (g - b) / s2 + (g < b) * 6;
    else if (g === max2) h = (b - r) / s2 + 2;
    else h = (r - g) / s2 + 4;
    s2 /= l < 0.5 ? max2 + min2 : 2 - max2 - min2;
    h *= 60;
  } else {
    s2 = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s2, l, o.opacity);
}
function hsl$3(h, s2, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s2, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s2, l, opacity) {
  this.h = +h;
  this.s = +s2;
  this.l = +l;
  this.opacity = +opacity;
}
(0, _define$2.default)(Hsl, hsl$3, (0, _define$2.extend)(Color, {
  brighter(k2) {
    k2 = k2 == null ? brighter : Math.pow(brighter, k2);
    return new Hsl(this.h, this.s, this.l * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? darker : Math.pow(darker, k2);
    return new Hsl(this.h, this.s, this.l * k2, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360, s2 = isNaN(h) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s2, m1 = 2 * l - m2;
    return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const a2 = clampa(this.opacity);
    return `${a2 === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a2 === 1 ? ")" : `, ${a2})`}`;
  }
}));
function clamph(value2) {
  value2 = (value2 || 0) % 360;
  return value2 < 0 ? value2 + 360 : value2;
}
function clampt(value2) {
  return Math.max(0, Math.min(1, value2 || 0));
}
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}
var lab$3 = {};
var math = {};
Object.defineProperty(math, "__esModule", {
  value: true
});
math.radians = math.degrees = void 0;
const radians = Math.PI / 180;
math.radians = radians;
const degrees$1 = 180 / Math.PI;
math.degrees = degrees$1;
Object.defineProperty(lab$3, "__esModule", {
  value: true
});
lab$3.Hcl = Hcl;
lab$3.Lab = Lab;
lab$3.default = lab$2;
lab$3.gray = gray;
lab$3.hcl = hcl$2;
lab$3.lch = lch;
var _define$1 = _interopRequireWildcard$9(define);
var _color$7 = color$2;
var _math$1 = math;
function _getRequireWildcardCache$9(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$9 = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$9(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$9(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
const K = 18, Xn = 0.96422, Yn = 1, Zn = 0.82521, t0$1 = 4 / 29, t1$1 = 6 / 29, t2 = 3 * t1$1 * t1$1, t3 = t1$1 * t1$1 * t1$1;
function labConvert(o) {
  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl) return hcl2lab(o);
  if (!(o instanceof _color$7.Rgb)) o = (0, _color$7.rgbConvert)(o);
  var r = rgb2lrgb(o.r), g = rgb2lrgb(o.g), b = rgb2lrgb(o.b), y2 = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x2, z;
  if (r === g && g === b) x2 = z = y2;
  else {
    x2 = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
    z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
  }
  return new Lab(116 * y2 - 16, 500 * (x2 - y2), 200 * (y2 - z), o.opacity);
}
function gray(l, opacity) {
  return new Lab(l, 0, 0, opacity == null ? 1 : opacity);
}
function lab$2(l, a2, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a2, b, opacity == null ? 1 : opacity);
}
function Lab(l, a2, b, opacity) {
  this.l = +l;
  this.a = +a2;
  this.b = +b;
  this.opacity = +opacity;
}
(0, _define$1.default)(Lab, lab$2, (0, _define$1.extend)(_color$7.Color, {
  brighter(k2) {
    return new Lab(this.l + K * (k2 == null ? 1 : k2), this.a, this.b, this.opacity);
  },
  darker(k2) {
    return new Lab(this.l - K * (k2 == null ? 1 : k2), this.a, this.b, this.opacity);
  },
  rgb() {
    var y2 = (this.l + 16) / 116, x2 = isNaN(this.a) ? y2 : y2 + this.a / 500, z = isNaN(this.b) ? y2 : y2 - this.b / 200;
    x2 = Xn * lab2xyz(x2);
    y2 = Yn * lab2xyz(y2);
    z = Zn * lab2xyz(z);
    return new _color$7.Rgb(lrgb2rgb(3.1338561 * x2 - 1.6168667 * y2 - 0.4906146 * z), lrgb2rgb(-0.9787684 * x2 + 1.9161415 * y2 + 0.033454 * z), lrgb2rgb(0.0719453 * x2 - 0.2289914 * y2 + 1.4052427 * z), this.opacity);
  }
}));
function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0$1;
}
function lab2xyz(t) {
  return t > t1$1 ? t * t * t : t2 * (t - t0$1);
}
function lrgb2rgb(x2) {
  return 255 * (x2 <= 31308e-7 ? 12.92 * x2 : 1.055 * Math.pow(x2, 1 / 2.4) - 0.055);
}
function rgb2lrgb(x2) {
  return (x2 /= 255) <= 0.04045 ? x2 / 12.92 : Math.pow((x2 + 0.055) / 1.055, 2.4);
}
function hclConvert(o) {
  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab)) o = labConvert(o);
  if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
  var h = Math.atan2(o.b, o.a) * _math$1.degrees;
  return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}
function lch(l, c6, h, opacity) {
  return arguments.length === 1 ? hclConvert(l) : new Hcl(h, c6, l, opacity == null ? 1 : opacity);
}
function hcl$2(h, c6, l, opacity) {
  return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c6, l, opacity == null ? 1 : opacity);
}
function Hcl(h, c6, l, opacity) {
  this.h = +h;
  this.c = +c6;
  this.l = +l;
  this.opacity = +opacity;
}
function hcl2lab(o) {
  if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
  var h = o.h * _math$1.radians;
  return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
}
(0, _define$1.default)(Hcl, hcl$2, (0, _define$1.extend)(_color$7.Color, {
  brighter(k2) {
    return new Hcl(this.h, this.c, this.l + K * (k2 == null ? 1 : k2), this.opacity);
  },
  darker(k2) {
    return new Hcl(this.h, this.c, this.l - K * (k2 == null ? 1 : k2), this.opacity);
  },
  rgb() {
    return hcl2lab(this).rgb();
  }
}));
var cubehelix$3 = {};
Object.defineProperty(cubehelix$3, "__esModule", {
  value: true
});
cubehelix$3.Cubehelix = Cubehelix;
cubehelix$3.default = cubehelix$2;
var _define = _interopRequireWildcard$8(define);
var _color$6 = color$2;
var _math = math;
function _getRequireWildcardCache$8(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$8 = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$8(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$8(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
var A = -0.14861, B = 1.78277, C = -0.29227, D = -0.90649, E = 1.97294, ED = E * D, EB = E * B, BC_DA = B * C - D * A;
function cubehelixConvert(o) {
  if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof _color$6.Rgb)) o = (0, _color$6.rgbConvert)(o);
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB), bl = b - l, k2 = (E * (g - l) - C * bl) / D, s2 = Math.sqrt(k2 * k2 + bl * bl) / (E * l * (1 - l)), h = s2 ? Math.atan2(k2, bl) * _math.degrees - 120 : NaN;
  return new Cubehelix(h < 0 ? h + 360 : h, s2, l, o.opacity);
}
function cubehelix$2(h, s2, l, opacity) {
  return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s2, l, opacity == null ? 1 : opacity);
}
function Cubehelix(h, s2, l, opacity) {
  this.h = +h;
  this.s = +s2;
  this.l = +l;
  this.opacity = +opacity;
}
(0, _define.default)(Cubehelix, cubehelix$2, (0, _define.extend)(_color$6.Color, {
  brighter(k2) {
    k2 = k2 == null ? _color$6.brighter : Math.pow(_color$6.brighter, k2);
    return new Cubehelix(this.h, this.s, this.l * k2, this.opacity);
  },
  darker(k2) {
    k2 = k2 == null ? _color$6.darker : Math.pow(_color$6.darker, k2);
    return new Cubehelix(this.h, this.s, this.l * k2, this.opacity);
  },
  rgb() {
    var h = isNaN(this.h) ? 0 : (this.h + 120) * _math.radians, l = +this.l, a2 = isNaN(this.s) ? 0 : this.s * l * (1 - l), cosh2 = Math.cos(h), sinh2 = Math.sin(h);
    return new _color$6.Rgb(255 * (l + a2 * (A * cosh2 + B * sinh2)), 255 * (l + a2 * (C * cosh2 + D * sinh2)), 255 * (l + a2 * (E * cosh2)), this.opacity);
  }
}));
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "color", {
    enumerable: true,
    get: function() {
      return _color2.default;
    }
  });
  Object.defineProperty(exports, "cubehelix", {
    enumerable: true,
    get: function() {
      return _cubehelix.default;
    }
  });
  Object.defineProperty(exports, "gray", {
    enumerable: true,
    get: function() {
      return _lab.gray;
    }
  });
  Object.defineProperty(exports, "hcl", {
    enumerable: true,
    get: function() {
      return _lab.hcl;
    }
  });
  Object.defineProperty(exports, "hsl", {
    enumerable: true,
    get: function() {
      return _color2.hsl;
    }
  });
  Object.defineProperty(exports, "lab", {
    enumerable: true,
    get: function() {
      return _lab.default;
    }
  });
  Object.defineProperty(exports, "lch", {
    enumerable: true,
    get: function() {
      return _lab.lch;
    }
  });
  Object.defineProperty(exports, "rgb", {
    enumerable: true,
    get: function() {
      return _color2.rgb;
    }
  });
  var _color2 = _interopRequireWildcard2(color$2);
  var _lab = _interopRequireWildcard2(lab$3);
  var _cubehelix = _interopRequireDefault2(cubehelix$3);
  function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _getRequireWildcardCache2(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache2 = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard2(obj, nodeInterop) {
    if (obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache2(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
})(src$3);
var rgb$1 = {};
var basis$1 = {};
Object.defineProperty(basis$1, "__esModule", {
  value: true
});
basis$1.basis = basis;
basis$1.default = _default$A;
function basis(t12, v0, v1, v2, v3) {
  var t22 = t12 * t12, t32 = t22 * t12;
  return ((1 - 3 * t12 + 3 * t22 - t32) * v0 + (4 - 6 * t22 + 3 * t32) * v1 + (1 + 3 * t12 + 3 * t22 - 3 * t32) * v2 + t32 * v3) / 6;
}
function _default$A(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}
var basisClosed = {};
Object.defineProperty(basisClosed, "__esModule", {
  value: true
});
basisClosed.default = _default$z;
var _basis$1 = basis$1;
function _default$z(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
    return (0, _basis$1.basis)((t - i / n) * n, v0, v1, v2, v3);
  };
}
var color = {};
var constant$2 = {};
Object.defineProperty(constant$2, "__esModule", {
  value: true
});
constant$2.default = void 0;
var _default$y = (x2) => () => x2;
constant$2.default = _default$y;
Object.defineProperty(color, "__esModule", {
  value: true
});
color.default = nogamma;
color.gamma = gamma;
color.hue = hue$1;
var _constant$2 = _interopRequireDefault$w(constant$2);
function _interopRequireDefault$w(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function linear$1(a2, d) {
  return function(t) {
    return a2 + t * d;
  };
}
function exponential(a2, b, y2) {
  return a2 = Math.pow(a2, y2), b = Math.pow(b, y2) - a2, y2 = 1 / y2, function(t) {
    return Math.pow(a2 + t * b, y2);
  };
}
function hue$1(a2, b) {
  var d = b - a2;
  return d ? linear$1(a2, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : (0, _constant$2.default)(isNaN(a2) ? b : a2);
}
function gamma(y2) {
  return (y2 = +y2) === 1 ? nogamma : function(a2, b) {
    return b - a2 ? exponential(a2, b, y2) : (0, _constant$2.default)(isNaN(a2) ? b : a2);
  };
}
function nogamma(a2, b) {
  var d = b - a2;
  return d ? linear$1(a2, d) : (0, _constant$2.default)(isNaN(a2) ? b : a2);
}
Object.defineProperty(rgb$1, "__esModule", {
  value: true
});
rgb$1.rgbBasisClosed = rgb$1.rgbBasis = rgb$1.default = void 0;
var _index$i = src$3;
var _basis = _interopRequireDefault$v(basis$1);
var _basisClosed = _interopRequireDefault$v(basisClosed);
var _color$5 = _interopRequireWildcard$7(color);
function _getRequireWildcardCache$7(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$7 = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$7(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$7(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function _interopRequireDefault$v(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var _default$x = function rgbGamma(y2) {
  var color2 = (0, _color$5.gamma)(y2);
  function rgb2(start2, end) {
    var r = color2((start2 = (0, _index$i.rgb)(start2)).r, (end = (0, _index$i.rgb)(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = (0, _color$5.default)(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g(t);
      start2.b = b(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  }
  rgb2.gamma = rgbGamma;
  return rgb2;
}(1);
rgb$1.default = _default$x;
function rgbSpline(spline) {
  return function(colors3) {
    var n = colors3.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
    for (i = 0; i < n; ++i) {
      color2 = (0, _index$i.rgb)(colors3[i]);
      r[i] = color2.r || 0;
      g[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g(t);
      color2.b = b(t);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(_basis.default);
rgb$1.rgbBasis = rgbBasis;
var rgbBasisClosed = rgbSpline(_basisClosed.default);
rgb$1.rgbBasisClosed = rgbBasisClosed;
var array = {};
var numberArray = {};
Object.defineProperty(numberArray, "__esModule", {
  value: true
});
numberArray.default = _default$w;
numberArray.isNumberArray = isNumberArray;
function _default$w(a2, b) {
  if (!b) b = [];
  var n = a2 ? Math.min(b.length, a2.length) : 0, c6 = b.slice(), i;
  return function(t) {
    for (i = 0; i < n; ++i) c6[i] = a2[i] * (1 - t) + b[i] * t;
    return c6;
  };
}
function isNumberArray(x2) {
  return ArrayBuffer.isView(x2) && !(x2 instanceof DataView);
}
var hasRequiredArray;
function requireArray() {
  if (hasRequiredArray) return array;
  hasRequiredArray = 1;
  Object.defineProperty(array, "__esModule", {
    value: true
  });
  array.default = _default2;
  array.genericArray = genericArray;
  var _value2 = _interopRequireDefault2(requireValue());
  var _numberArray = _interopRequireWildcard2(numberArray);
  function _getRequireWildcardCache2(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache2 = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard2(obj, nodeInterop) {
    if (obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache2(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
  function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _default2(a2, b) {
    return ((0, _numberArray.isNumberArray)(b) ? _numberArray.default : genericArray)(a2, b);
  }
  function genericArray(a2, b) {
    var nb = b ? b.length : 0, na = a2 ? Math.min(nb, a2.length) : 0, x2 = new Array(na), c6 = new Array(nb), i;
    for (i = 0; i < na; ++i) x2[i] = (0, _value2.default)(a2[i], b[i]);
    for (; i < nb; ++i) c6[i] = b[i];
    return function(t) {
      for (i = 0; i < na; ++i) c6[i] = x2[i](t);
      return c6;
    };
  }
  return array;
}
var date$1 = {};
Object.defineProperty(date$1, "__esModule", {
  value: true
});
date$1.default = _default$v;
function _default$v(a2, b) {
  var d = /* @__PURE__ */ new Date();
  return a2 = +a2, b = +b, function(t) {
    return d.setTime(a2 * (1 - t) + b * t), d;
  };
}
var number$4 = {};
Object.defineProperty(number$4, "__esModule", {
  value: true
});
number$4.default = _default$u;
function _default$u(a2, b) {
  return a2 = +a2, b = +b, function(t) {
    return a2 * (1 - t) + b * t;
  };
}
var object = {};
var hasRequiredObject;
function requireObject() {
  if (hasRequiredObject) return object;
  hasRequiredObject = 1;
  Object.defineProperty(object, "__esModule", {
    value: true
  });
  object.default = _default2;
  var _value2 = _interopRequireDefault2(requireValue());
  function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _default2(a2, b) {
    var i = {}, c6 = {}, k2;
    if (a2 === null || typeof a2 !== "object") a2 = {};
    if (b === null || typeof b !== "object") b = {};
    for (k2 in b) {
      if (k2 in a2) {
        i[k2] = (0, _value2.default)(a2[k2], b[k2]);
      } else {
        c6[k2] = b[k2];
      }
    }
    return function(t) {
      for (k2 in i) c6[k2] = i[k2](t);
      return c6;
    };
  }
  return object;
}
var string = {};
Object.defineProperty(string, "__esModule", {
  value: true
});
string.default = _default$t;
var _number$4 = _interopRequireDefault$u(number$4);
function _interopRequireDefault$u(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, reB = new RegExp(reA.source, "g");
function zero$2(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function _default$t(a2, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s2 = [], q = [];
  a2 = a2 + "", b = b + "";
  while ((am = reA.exec(a2)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s2[i]) s2[i] += bs;
      else s2[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s2[i]) s2[i] += bm;
      else s2[++i] = bm;
    } else {
      s2[++i] = null;
      q.push({
        i,
        x: (0, _number$4.default)(am, bm)
      });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s2[i]) s2[i] += bs;
    else s2[++i] = bs;
  }
  return s2.length < 2 ? q[0] ? one(q[0].x) : zero$2(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2) s2[(o = q[i2]).i] = o.x(t);
    return s2.join("");
  });
}
var hasRequiredValue;
function requireValue() {
  if (hasRequiredValue) return value;
  hasRequiredValue = 1;
  Object.defineProperty(value, "__esModule", {
    value: true
  });
  value.default = _default2;
  var _index3 = src$3;
  var _rgb = _interopRequireDefault2(rgb$1);
  var _array2 = requireArray();
  var _date = _interopRequireDefault2(date$1);
  var _number2 = _interopRequireDefault2(number$4);
  var _object = _interopRequireDefault2(requireObject());
  var _string = _interopRequireDefault2(string);
  var _constant2 = _interopRequireDefault2(constant$2);
  var _numberArray = _interopRequireWildcard2(numberArray);
  function _getRequireWildcardCache2(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache2 = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard2(obj, nodeInterop) {
    if (obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache2(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
  function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _default2(a2, b) {
    var t = typeof b, c6;
    return b == null || t === "boolean" ? (0, _constant2.default)(b) : (t === "number" ? _number2.default : t === "string" ? (c6 = (0, _index3.color)(b)) ? (b = c6, _rgb.default) : _string.default : b instanceof _index3.color ? _rgb.default : b instanceof Date ? _date.default : (0, _numberArray.isNumberArray)(b) ? _numberArray.default : Array.isArray(b) ? _array2.genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? _object.default : _number2.default)(a2, b);
  }
  return value;
}
var discrete = {};
Object.defineProperty(discrete, "__esModule", {
  value: true
});
discrete.default = _default$s;
function _default$s(range2) {
  var n = range2.length;
  return function(t) {
    return range2[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
  };
}
var hue = {};
Object.defineProperty(hue, "__esModule", {
  value: true
});
hue.default = _default$r;
var _color$4 = color;
function _default$r(a2, b) {
  var i = (0, _color$4.hue)(+a2, +b);
  return function(t) {
    var x2 = i(t);
    return x2 - 360 * Math.floor(x2 / 360);
  };
}
var round$1 = {};
Object.defineProperty(round$1, "__esModule", {
  value: true
});
round$1.default = _default$q;
function _default$q(a2, b) {
  return a2 = +a2, b = +b, function(t) {
    return Math.round(a2 * (1 - t) + b * t);
  };
}
var transform = {};
var parse = {};
var decompose = {};
Object.defineProperty(decompose, "__esModule", {
  value: true
});
decompose.default = _default$p;
decompose.identity = void 0;
var degrees = 180 / Math.PI;
var identity$3 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
decompose.identity = identity$3;
function _default$p(a2, b, c6, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a2 * a2 + b * b)) a2 /= scaleX, b /= scaleX;
  if (skewX = a2 * c6 + b * d) c6 -= a2 * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c6 * c6 + d * d)) c6 /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a2 * d < b * c6) a2 = -a2, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a2) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX,
    scaleY
  };
}
Object.defineProperty(parse, "__esModule", {
  value: true
});
parse.parseCss = parseCss;
parse.parseSvg = parseSvg;
var _decompose = _interopRequireWildcard$6(decompose);
function _getRequireWildcardCache$6(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$6 = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$6(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$6(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
var svgNode;
function parseCss(value2) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value2 + "");
  return m.isIdentity ? _decompose.identity : (0, _decompose.default)(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value2) {
  if (value2 == null) return _decompose.identity;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value2);
  if (!(value2 = svgNode.transform.baseVal.consolidate())) return _decompose.identity;
  value2 = value2.matrix;
  return (0, _decompose.default)(value2.a, value2.b, value2.c, value2.d, value2.e, value2.f);
}
Object.defineProperty(transform, "__esModule", {
  value: true
});
transform.interpolateTransformSvg = transform.interpolateTransformCss = void 0;
var _number$3 = _interopRequireDefault$t(number$4);
var _parse = parse;
function _interopRequireDefault$t(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function interpolateTransform(parse2, pxComma, pxParen, degParen) {
  function pop(s2) {
    return s2.length ? s2.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s2, q) {
    if (xa !== xb || ya !== yb) {
      var i = s2.push("translate(", null, pxComma, null, pxParen);
      q.push({
        i: i - 4,
        x: (0, _number$3.default)(xa, xb)
      }, {
        i: i - 2,
        x: (0, _number$3.default)(ya, yb)
      });
    } else if (xb || yb) {
      s2.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a2, b, s2, q) {
    if (a2 !== b) {
      if (a2 - b > 180) b += 360;
      else if (b - a2 > 180) a2 += 360;
      q.push({
        i: s2.push(pop(s2) + "rotate(", null, degParen) - 2,
        x: (0, _number$3.default)(a2, b)
      });
    } else if (b) {
      s2.push(pop(s2) + "rotate(" + b + degParen);
    }
  }
  function skewX(a2, b, s2, q) {
    if (a2 !== b) {
      q.push({
        i: s2.push(pop(s2) + "skewX(", null, degParen) - 2,
        x: (0, _number$3.default)(a2, b)
      });
    } else if (b) {
      s2.push(pop(s2) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s2, q) {
    if (xa !== xb || ya !== yb) {
      var i = s2.push(pop(s2) + "scale(", null, ",", null, ")");
      q.push({
        i: i - 4,
        x: (0, _number$3.default)(xa, xb)
      }, {
        i: i - 2,
        x: (0, _number$3.default)(ya, yb)
      });
    } else if (xb !== 1 || yb !== 1) {
      s2.push(pop(s2) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a2, b) {
    var s2 = [], q = [];
    a2 = parse2(a2), b = parse2(b);
    translate(a2.translateX, a2.translateY, b.translateX, b.translateY, s2, q);
    rotate(a2.rotate, b.rotate, s2, q);
    skewX(a2.skewX, b.skewX, s2, q);
    scale(a2.scaleX, a2.scaleY, b.scaleX, b.scaleY, s2, q);
    a2 = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s2[(o = q[i]).i] = o.x(t);
      return s2.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(_parse.parseCss, "px, ", "px)", "deg)");
transform.interpolateTransformCss = interpolateTransformCss;
var interpolateTransformSvg = interpolateTransform(_parse.parseSvg, ", ", ")", ")");
transform.interpolateTransformSvg = interpolateTransformSvg;
var zoom = {};
Object.defineProperty(zoom, "__esModule", {
  value: true
});
zoom.default = void 0;
var epsilon2 = 1e-12;
function cosh(x2) {
  return ((x2 = Math.exp(x2)) + 1 / x2) / 2;
}
function sinh(x2) {
  return ((x2 = Math.exp(x2)) - 1 / x2) / 2;
}
function tanh(x2) {
  return ((x2 = Math.exp(2 * x2)) - 1) / (x2 + 1);
}
var _default$o = function zoomRho(rho, rho2, rho4) {
  function zoom2(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2], dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, i, S;
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
      };
    } else {
      var d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1), b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s2 = t * S, coshr0 = cosh(r0), u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s2 + r0) - sinh(r0));
        return [ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / cosh(rho * s2 + r0)];
      };
    }
    i.duration = S * 1e3 * rho / Math.SQRT2;
    return i;
  }
  zoom2.rho = function(_) {
    var _1 = Math.max(1e-3, +_), _2 = _1 * _1, _4 = _2 * _2;
    return zoomRho(_1, _2, _4);
  };
  return zoom2;
}(Math.SQRT2, 2, 4);
zoom.default = _default$o;
var hsl$2 = {};
Object.defineProperty(hsl$2, "__esModule", {
  value: true
});
hsl$2.hslLong = hsl$2.default = void 0;
var _index$h = src$3;
var _color$3 = _interopRequireWildcard$5(color);
function _getRequireWildcardCache$5(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$5 = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$5(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$5(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function hsl$1(hue2) {
  return function(start2, end) {
    var h = hue2((start2 = (0, _index$h.hsl)(start2)).h, (end = (0, _index$h.hsl)(end)).h), s2 = (0, _color$3.default)(start2.s, end.s), l = (0, _color$3.default)(start2.l, end.l), opacity = (0, _color$3.default)(start2.opacity, end.opacity);
    return function(t) {
      start2.h = h(t);
      start2.s = s2(t);
      start2.l = l(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  };
}
var _default$n = hsl$1(_color$3.hue);
hsl$2.default = _default$n;
var hslLong = hsl$1(_color$3.default);
hsl$2.hslLong = hslLong;
var lab$1 = {};
Object.defineProperty(lab$1, "__esModule", {
  value: true
});
lab$1.default = lab;
var _index$g = src$3;
var _color$2 = _interopRequireDefault$s(color);
function _interopRequireDefault$s(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function lab(start2, end) {
  var l = (0, _color$2.default)((start2 = (0, _index$g.lab)(start2)).l, (end = (0, _index$g.lab)(end)).l), a2 = (0, _color$2.default)(start2.a, end.a), b = (0, _color$2.default)(start2.b, end.b), opacity = (0, _color$2.default)(start2.opacity, end.opacity);
  return function(t) {
    start2.l = l(t);
    start2.a = a2(t);
    start2.b = b(t);
    start2.opacity = opacity(t);
    return start2 + "";
  };
}
var hcl$1 = {};
Object.defineProperty(hcl$1, "__esModule", {
  value: true
});
hcl$1.hclLong = hcl$1.default = void 0;
var _index$f = src$3;
var _color$1 = _interopRequireWildcard$4(color);
function _getRequireWildcardCache$4(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$4 = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$4(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$4(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function hcl(hue2) {
  return function(start2, end) {
    var h = hue2((start2 = (0, _index$f.hcl)(start2)).h, (end = (0, _index$f.hcl)(end)).h), c6 = (0, _color$1.default)(start2.c, end.c), l = (0, _color$1.default)(start2.l, end.l), opacity = (0, _color$1.default)(start2.opacity, end.opacity);
    return function(t) {
      start2.h = h(t);
      start2.c = c6(t);
      start2.l = l(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  };
}
var _default$m = hcl(_color$1.hue);
hcl$1.default = _default$m;
var hclLong = hcl(_color$1.default);
hcl$1.hclLong = hclLong;
var cubehelix$1 = {};
Object.defineProperty(cubehelix$1, "__esModule", {
  value: true
});
cubehelix$1.default = cubehelix$1.cubehelixLong = void 0;
var _index$e = src$3;
var _color = _interopRequireWildcard$3(color);
function _getRequireWildcardCache$3(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$3 = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$3(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$3(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function cubehelix(hue2) {
  return function cubehelixGamma(y2) {
    y2 = +y2;
    function cubehelix2(start2, end) {
      var h = hue2((start2 = (0, _index$e.cubehelix)(start2)).h, (end = (0, _index$e.cubehelix)(end)).h), s2 = (0, _color.default)(start2.s, end.s), l = (0, _color.default)(start2.l, end.l), opacity = (0, _color.default)(start2.opacity, end.opacity);
      return function(t) {
        start2.h = h(t);
        start2.s = s2(t);
        start2.l = l(Math.pow(t, y2));
        start2.opacity = opacity(t);
        return start2 + "";
      };
    }
    cubehelix2.gamma = cubehelixGamma;
    return cubehelix2;
  }(1);
}
var _default$l = cubehelix(_color.hue);
cubehelix$1.default = _default$l;
var cubehelixLong = cubehelix(_color.default);
cubehelix$1.cubehelixLong = cubehelixLong;
var piecewise$1 = {};
Object.defineProperty(piecewise$1, "__esModule", {
  value: true
});
piecewise$1.default = piecewise;
var _value = _interopRequireDefault$r(requireValue());
function _interopRequireDefault$r(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function piecewise(interpolate2, values) {
  if (values === void 0) values = interpolate2, interpolate2 = _value.default;
  var i = 0, n = values.length - 1, v = values[0], I = new Array(n < 0 ? 0 : n);
  while (i < n) I[i] = interpolate2(v, v = values[++i]);
  return function(t) {
    var i2 = Math.max(0, Math.min(n - 1, Math.floor(t *= n)));
    return I[i2](t - i2);
  };
}
var quantize$2 = {};
Object.defineProperty(quantize$2, "__esModule", {
  value: true
});
quantize$2.default = _default$k;
function _default$k(interpolator, n) {
  var samples = new Array(n);
  for (var i = 0; i < n; ++i) samples[i] = interpolator(i / (n - 1));
  return samples;
}
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "interpolate", {
    enumerable: true,
    get: function() {
      return _value2.default;
    }
  });
  Object.defineProperty(exports, "interpolateArray", {
    enumerable: true,
    get: function() {
      return _array2.default;
    }
  });
  Object.defineProperty(exports, "interpolateBasis", {
    enumerable: true,
    get: function() {
      return _basis2.default;
    }
  });
  Object.defineProperty(exports, "interpolateBasisClosed", {
    enumerable: true,
    get: function() {
      return _basisClosed2.default;
    }
  });
  Object.defineProperty(exports, "interpolateCubehelix", {
    enumerable: true,
    get: function() {
      return _cubehelix.default;
    }
  });
  Object.defineProperty(exports, "interpolateCubehelixLong", {
    enumerable: true,
    get: function() {
      return _cubehelix.cubehelixLong;
    }
  });
  Object.defineProperty(exports, "interpolateDate", {
    enumerable: true,
    get: function() {
      return _date.default;
    }
  });
  Object.defineProperty(exports, "interpolateDiscrete", {
    enumerable: true,
    get: function() {
      return _discrete.default;
    }
  });
  Object.defineProperty(exports, "interpolateHcl", {
    enumerable: true,
    get: function() {
      return _hcl.default;
    }
  });
  Object.defineProperty(exports, "interpolateHclLong", {
    enumerable: true,
    get: function() {
      return _hcl.hclLong;
    }
  });
  Object.defineProperty(exports, "interpolateHsl", {
    enumerable: true,
    get: function() {
      return _hsl.default;
    }
  });
  Object.defineProperty(exports, "interpolateHslLong", {
    enumerable: true,
    get: function() {
      return _hsl.hslLong;
    }
  });
  Object.defineProperty(exports, "interpolateHue", {
    enumerable: true,
    get: function() {
      return _hue.default;
    }
  });
  Object.defineProperty(exports, "interpolateLab", {
    enumerable: true,
    get: function() {
      return _lab.default;
    }
  });
  Object.defineProperty(exports, "interpolateNumber", {
    enumerable: true,
    get: function() {
      return _number2.default;
    }
  });
  Object.defineProperty(exports, "interpolateNumberArray", {
    enumerable: true,
    get: function() {
      return _numberArray.default;
    }
  });
  Object.defineProperty(exports, "interpolateObject", {
    enumerable: true,
    get: function() {
      return _object.default;
    }
  });
  Object.defineProperty(exports, "interpolateRgb", {
    enumerable: true,
    get: function() {
      return _rgb.default;
    }
  });
  Object.defineProperty(exports, "interpolateRgbBasis", {
    enumerable: true,
    get: function() {
      return _rgb.rgbBasis;
    }
  });
  Object.defineProperty(exports, "interpolateRgbBasisClosed", {
    enumerable: true,
    get: function() {
      return _rgb.rgbBasisClosed;
    }
  });
  Object.defineProperty(exports, "interpolateRound", {
    enumerable: true,
    get: function() {
      return _round2.default;
    }
  });
  Object.defineProperty(exports, "interpolateString", {
    enumerable: true,
    get: function() {
      return _string.default;
    }
  });
  Object.defineProperty(exports, "interpolateTransformCss", {
    enumerable: true,
    get: function() {
      return _index3.interpolateTransformCss;
    }
  });
  Object.defineProperty(exports, "interpolateTransformSvg", {
    enumerable: true,
    get: function() {
      return _index3.interpolateTransformSvg;
    }
  });
  Object.defineProperty(exports, "interpolateZoom", {
    enumerable: true,
    get: function() {
      return _zoom.default;
    }
  });
  Object.defineProperty(exports, "piecewise", {
    enumerable: true,
    get: function() {
      return _piecewise.default;
    }
  });
  Object.defineProperty(exports, "quantize", {
    enumerable: true,
    get: function() {
      return _quantize.default;
    }
  });
  var _value2 = _interopRequireDefault2(requireValue());
  var _array2 = _interopRequireDefault2(requireArray());
  var _basis2 = _interopRequireDefault2(basis$1);
  var _basisClosed2 = _interopRequireDefault2(basisClosed);
  var _date = _interopRequireDefault2(date$1);
  var _discrete = _interopRequireDefault2(discrete);
  var _hue = _interopRequireDefault2(hue);
  var _number2 = _interopRequireDefault2(number$4);
  var _numberArray = _interopRequireDefault2(numberArray);
  var _object = _interopRequireDefault2(requireObject());
  var _round2 = _interopRequireDefault2(round$1);
  var _string = _interopRequireDefault2(string);
  var _index3 = transform;
  var _zoom = _interopRequireDefault2(zoom);
  var _rgb = _interopRequireWildcard2(rgb$1);
  var _hsl = _interopRequireWildcard2(hsl$2);
  var _lab = _interopRequireDefault2(lab$1);
  var _hcl = _interopRequireWildcard2(hcl$1);
  var _cubehelix = _interopRequireWildcard2(cubehelix$1);
  var _piecewise = _interopRequireDefault2(piecewise$1);
  var _quantize = _interopRequireDefault2(quantize$2);
  function _getRequireWildcardCache2(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache2 = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard2(obj, nodeInterop) {
    if (obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache2(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
  function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
})(src$4);
var constant$1 = {};
Object.defineProperty(constant$1, "__esModule", {
  value: true
});
constant$1.default = constants;
function constants(x2) {
  return function() {
    return x2;
  };
}
var number$3 = {};
Object.defineProperty(number$3, "__esModule", {
  value: true
});
number$3.default = number$2;
function number$2(x2) {
  return +x2;
}
Object.defineProperty(continuous$1, "__esModule", {
  value: true
});
continuous$1.copy = copy$1;
continuous$1.default = continuous;
continuous$1.identity = identity$2;
continuous$1.transformer = transformer$2;
var _index$d = src$6;
var _index2$4 = src$4;
var _constant$1 = _interopRequireDefault$q(constant$1);
var _number$2 = _interopRequireDefault$q(number$3);
function _interopRequireDefault$q(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var unit = [0, 1];
function identity$2(x2) {
  return x2;
}
function normalize(a2, b) {
  return (b -= a2 = +a2) ? function(x2) {
    return (x2 - a2) / b;
  } : (0, _constant$1.default)(isNaN(b) ? NaN : 0.5);
}
function clamper(a2, b) {
  var t;
  if (a2 > b) t = a2, a2 = b, b = t;
  return function(x2) {
    return Math.max(a2, Math.min(b, x2));
  };
}
function bimap(domain2, range2, interpolate2) {
  var d0 = domain2[0], d1 = domain2[1], r0 = range2[0], r1 = range2[1];
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate2(r1, r0);
  else d0 = normalize(d0, d1), r0 = interpolate2(r0, r1);
  return function(x2) {
    return r0(d0(x2));
  };
}
function polymap(domain2, range2, interpolate2) {
  var j = Math.min(domain2.length, range2.length) - 1, d = new Array(j), r = new Array(j), i = -1;
  if (domain2[j] < domain2[0]) {
    domain2 = domain2.slice().reverse();
    range2 = range2.slice().reverse();
  }
  while (++i < j) {
    d[i] = normalize(domain2[i], domain2[i + 1]);
    r[i] = interpolate2(range2[i], range2[i + 1]);
  }
  return function(x2) {
    var i2 = (0, _index$d.bisect)(domain2, x2, 1, j) - 1;
    return r[i2](d[i2](x2));
  };
}
function copy$1(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer$2() {
  var domain2 = unit, range2 = unit, interpolate2 = _index2$4.interpolate, transform2, untransform, unknown2, clamp2 = identity$2, piecewise2, output, input;
  function rescale() {
    var n = Math.min(domain2.length, range2.length);
    if (clamp2 !== identity$2) clamp2 = clamper(domain2[0], domain2[n - 1]);
    piecewise2 = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }
  function scale(x2) {
    return x2 == null || isNaN(x2 = +x2) ? unknown2 : (output || (output = piecewise2(domain2.map(transform2), range2, interpolate2)))(transform2(clamp2(x2)));
  }
  scale.invert = function(y2) {
    return clamp2(untransform((input || (input = piecewise2(range2, domain2.map(transform2), _index2$4.interpolateNumber)))(y2)));
  };
  scale.domain = function(_) {
    return arguments.length ? (domain2 = Array.from(_, _number$2.default), rescale()) : domain2.slice();
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), rescale()) : range2.slice();
  };
  scale.rangeRound = function(_) {
    return range2 = Array.from(_), interpolate2 = _index2$4.interpolateRound, rescale();
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp2 = _ ? true : identity$2, rescale()) : clamp2 !== identity$2;
  };
  scale.interpolate = function(_) {
    return arguments.length ? (interpolate2 = _, rescale()) : interpolate2;
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown2 = _, scale) : unknown2;
  };
  return function(t, u) {
    transform2 = t, untransform = u;
    return rescale();
  };
}
function continuous() {
  return transformer$2()(identity$2, identity$2);
}
var tickFormat$1 = {};
var src$2 = {};
var defaultLocale$3 = {};
var locale$3 = {};
var exponent$1 = {};
var formatDecimal = {};
Object.defineProperty(formatDecimal, "__esModule", {
  value: true
});
formatDecimal.default = _default$j;
formatDecimal.formatDecimalParts = formatDecimalParts;
function _default$j(x2) {
  return Math.abs(x2 = Math.round(x2)) >= 1e21 ? x2.toLocaleString("en").replace(/,/g, "") : x2.toString(10);
}
function formatDecimalParts(x2, p) {
  if ((i = (x2 = p ? x2.toExponential(p - 1) : x2.toExponential()).indexOf("e")) < 0) return null;
  var i, coefficient = x2.slice(0, i);
  return [coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient, +x2.slice(i + 1)];
}
Object.defineProperty(exponent$1, "__esModule", {
  value: true
});
exponent$1.default = _default$i;
var _formatDecimal$3 = formatDecimal;
function _default$i(x2) {
  return x2 = (0, _formatDecimal$3.formatDecimalParts)(Math.abs(x2)), x2 ? x2[1] : NaN;
}
var formatGroup = {};
Object.defineProperty(formatGroup, "__esModule", {
  value: true
});
formatGroup.default = _default$h;
function _default$h(grouping, thousands) {
  return function(value2, width) {
    var i = value2.length, t = [], j = 0, g = grouping[0], length2 = 0;
    while (i > 0 && g > 0) {
      if (length2 + g + 1 > width) g = Math.max(1, width - length2);
      t.push(value2.substring(i -= g, i + g));
      if ((length2 += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }
    return t.reverse().join(thousands);
  };
}
var formatNumerals = {};
Object.defineProperty(formatNumerals, "__esModule", {
  value: true
});
formatNumerals.default = _default$g;
function _default$g(numerals) {
  return function(value2) {
    return value2.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}
var formatSpecifier$1 = {};
Object.defineProperty(formatSpecifier$1, "__esModule", {
  value: true
});
formatSpecifier$1.FormatSpecifier = FormatSpecifier;
formatSpecifier$1.default = formatSpecifier;
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
  if (!(match2 = re.exec(specifier))) throw new Error("invalid format: " + specifier);
  var match2;
  return new FormatSpecifier({
    fill: match2[1],
    align: match2[2],
    sign: match2[3],
    symbol: match2[4],
    zero: match2[5],
    width: match2[6],
    comma: match2[7],
    precision: match2[8] && match2[8].slice(1),
    trim: match2[9],
    type: match2[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
  this.align = specifier.align === void 0 ? ">" : specifier.align + "";
  this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === void 0 ? void 0 : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};
var formatTrim = {};
Object.defineProperty(formatTrim, "__esModule", {
  value: true
});
formatTrim.default = _default$f;
function _default$f(s2) {
  out: for (var n = s2.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (s2[i]) {
      case ".":
        i0 = i1 = i;
        break;
      case "0":
        if (i0 === 0) i0 = i;
        i1 = i;
        break;
      default:
        if (!+s2[i]) break out;
        if (i0 > 0) i0 = 0;
        break;
    }
  }
  return i0 > 0 ? s2.slice(0, i0) + s2.slice(i1 + 1) : s2;
}
var formatTypes = {};
var formatPrefixAuto = {};
Object.defineProperty(formatPrefixAuto, "__esModule", {
  value: true
});
formatPrefixAuto.default = _default$e;
formatPrefixAuto.prefixExponent = void 0;
var _formatDecimal$2 = formatDecimal;
var prefixExponent;
formatPrefixAuto.prefixExponent = prefixExponent;
function _default$e(x2, p) {
  var d = (0, _formatDecimal$2.formatDecimalParts)(x2, p);
  if (!d) return x2 + "";
  var coefficient = d[0], exponent2 = d[1], i = exponent2 - (formatPrefixAuto.prefixExponent = prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent2 / 3))) * 3) + 1, n = coefficient.length;
  return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + (0, _formatDecimal$2.formatDecimalParts)(x2, Math.max(0, p + i - 1))[0];
}
var formatRounded = {};
Object.defineProperty(formatRounded, "__esModule", {
  value: true
});
formatRounded.default = _default$d;
var _formatDecimal$1 = formatDecimal;
function _default$d(x2, p) {
  var d = (0, _formatDecimal$1.formatDecimalParts)(x2, p);
  if (!d) return x2 + "";
  var coefficient = d[0], exponent2 = d[1];
  return exponent2 < 0 ? "0." + new Array(-exponent2).join("0") + coefficient : coefficient.length > exponent2 + 1 ? coefficient.slice(0, exponent2 + 1) + "." + coefficient.slice(exponent2 + 1) : coefficient + new Array(exponent2 - coefficient.length + 2).join("0");
}
Object.defineProperty(formatTypes, "__esModule", {
  value: true
});
formatTypes.default = void 0;
var _formatDecimal = _interopRequireDefault$p(formatDecimal);
var _formatPrefixAuto$1 = _interopRequireDefault$p(formatPrefixAuto);
var _formatRounded = _interopRequireDefault$p(formatRounded);
function _interopRequireDefault$p(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var _default$c = {
  "%": (x2, p) => (x2 * 100).toFixed(p),
  "b": (x2) => Math.round(x2).toString(2),
  "c": (x2) => x2 + "",
  "d": _formatDecimal.default,
  "e": (x2, p) => x2.toExponential(p),
  "f": (x2, p) => x2.toFixed(p),
  "g": (x2, p) => x2.toPrecision(p),
  "o": (x2) => Math.round(x2).toString(8),
  "p": (x2, p) => (0, _formatRounded.default)(x2 * 100, p),
  "r": _formatRounded.default,
  "s": _formatPrefixAuto$1.default,
  "X": (x2) => Math.round(x2).toString(16).toUpperCase(),
  "x": (x2) => Math.round(x2).toString(16)
};
formatTypes.default = _default$c;
var identity$1 = {};
Object.defineProperty(identity$1, "__esModule", {
  value: true
});
identity$1.default = _default$b;
function _default$b(x2) {
  return x2;
}
Object.defineProperty(locale$3, "__esModule", {
  value: true
});
locale$3.default = _default$a;
var _exponent$4 = _interopRequireDefault$o(exponent$1);
var _formatGroup = _interopRequireDefault$o(formatGroup);
var _formatNumerals = _interopRequireDefault$o(formatNumerals);
var _formatSpecifier = _interopRequireDefault$o(formatSpecifier$1);
var _formatTrim = _interopRequireDefault$o(formatTrim);
var _formatTypes = _interopRequireDefault$o(formatTypes);
var _formatPrefixAuto = formatPrefixAuto;
var _identity = _interopRequireDefault$o(identity$1);
function _interopRequireDefault$o(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var map = Array.prototype.map, prefixes$1 = ["y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function _default$a(locale2) {
  var group2 = locale2.grouping === void 0 || locale2.thousands === void 0 ? _identity.default : (0, _formatGroup.default)(map.call(locale2.grouping, Number), locale2.thousands + ""), currencyPrefix = locale2.currency === void 0 ? "" : locale2.currency[0] + "", currencySuffix = locale2.currency === void 0 ? "" : locale2.currency[1] + "", decimal = locale2.decimal === void 0 ? "." : locale2.decimal + "", numerals = locale2.numerals === void 0 ? _identity.default : (0, _formatNumerals.default)(map.call(locale2.numerals, String)), percent = locale2.percent === void 0 ? "%" : locale2.percent + "", minus = locale2.minus === void 0 ? "−" : locale2.minus + "", nan = locale2.nan === void 0 ? "NaN" : locale2.nan + "";
  function newFormat(specifier) {
    specifier = (0, _formatSpecifier.default)(specifier);
    var fill = specifier.fill, align2 = specifier.align, sign2 = specifier.sign, symbol2 = specifier.symbol, zero2 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type = specifier.type;
    if (type === "n") comma = true, type = "g";
    else if (!_formatTypes.default[type]) precision === void 0 && (precision = 12), trim = true, type = "g";
    if (zero2 || fill === "0" && align2 === "=") zero2 = true, fill = "0", align2 = "=";
    var prefix2 = symbol2 === "$" ? currencyPrefix : symbol2 === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "", suffix = symbol2 === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";
    var formatType = _formatTypes.default[type], maybeSuffix = /[defgprs%]/.test(type);
    precision = precision === void 0 ? 6 : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value2) {
      var valuePrefix = prefix2, valueSuffix = suffix, i, n, c6;
      if (type === "c") {
        valueSuffix = formatType(value2) + valueSuffix;
        value2 = "";
      } else {
        value2 = +value2;
        var valueNegative = value2 < 0 || 1 / value2 < 0;
        value2 = isNaN(value2) ? nan : formatType(Math.abs(value2), precision);
        if (trim) value2 = (0, _formatTrim.default)(value2);
        if (valueNegative && +value2 === 0 && sign2 !== "+") valueNegative = false;
        valuePrefix = (valueNegative ? sign2 === "(" ? sign2 : minus : sign2 === "-" || sign2 === "(" ? "" : sign2) + valuePrefix;
        valueSuffix = (type === "s" ? prefixes$1[8 + _formatPrefixAuto.prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign2 === "(" ? ")" : "");
        if (maybeSuffix) {
          i = -1, n = value2.length;
          while (++i < n) {
            if (c6 = value2.charCodeAt(i), 48 > c6 || c6 > 57) {
              valueSuffix = (c6 === 46 ? decimal + value2.slice(i + 1) : value2.slice(i)) + valueSuffix;
              value2 = value2.slice(0, i);
              break;
            }
          }
        }
      }
      if (comma && !zero2) value2 = group2(value2, Infinity);
      var length2 = valuePrefix.length + value2.length + valueSuffix.length, padding2 = length2 < width ? new Array(width - length2 + 1).join(fill) : "";
      if (comma && zero2) value2 = group2(padding2 + value2, padding2.length ? width - valueSuffix.length : Infinity), padding2 = "";
      switch (align2) {
        case "<":
          value2 = valuePrefix + value2 + valueSuffix + padding2;
          break;
        case "=":
          value2 = valuePrefix + padding2 + value2 + valueSuffix;
          break;
        case "^":
          value2 = padding2.slice(0, length2 = padding2.length >> 1) + valuePrefix + value2 + valueSuffix + padding2.slice(length2);
          break;
        default:
          value2 = padding2 + valuePrefix + value2 + valueSuffix;
          break;
      }
      return numerals(value2);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix2(specifier, value2) {
    var f = newFormat((specifier = (0, _formatSpecifier.default)(specifier), specifier.type = "f", specifier)), e = Math.max(-8, Math.min(8, Math.floor((0, _exponent$4.default)(value2) / 3))) * 3, k2 = Math.pow(10, -e), prefix2 = prefixes$1[8 + e / 3];
    return function(value3) {
      return f(k2 * value3) + prefix2;
    };
  }
  return {
    format: newFormat,
    formatPrefix: formatPrefix2
  };
}
Object.defineProperty(defaultLocale$3, "__esModule", {
  value: true
});
defaultLocale$3.default = defaultLocale$2;
defaultLocale$3.formatPrefix = defaultLocale$3.format = void 0;
var _locale$1 = _interopRequireDefault$n(locale$3);
function _interopRequireDefault$n(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var locale$2;
var format;
defaultLocale$3.format = format;
var formatPrefix;
defaultLocale$3.formatPrefix = formatPrefix;
defaultLocale$2({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function defaultLocale$2(definition) {
  locale$2 = (0, _locale$1.default)(definition);
  defaultLocale$3.format = format = locale$2.format;
  defaultLocale$3.formatPrefix = formatPrefix = locale$2.formatPrefix;
  return locale$2;
}
var precisionFixed = {};
Object.defineProperty(precisionFixed, "__esModule", {
  value: true
});
precisionFixed.default = _default$9;
var _exponent$3 = _interopRequireDefault$m(exponent$1);
function _interopRequireDefault$m(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _default$9(step2) {
  return Math.max(0, -(0, _exponent$3.default)(Math.abs(step2)));
}
var precisionPrefix = {};
Object.defineProperty(precisionPrefix, "__esModule", {
  value: true
});
precisionPrefix.default = _default$8;
var _exponent$2 = _interopRequireDefault$l(exponent$1);
function _interopRequireDefault$l(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _default$8(step2, value2) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor((0, _exponent$2.default)(value2) / 3))) * 3 - (0, _exponent$2.default)(Math.abs(step2)));
}
var precisionRound = {};
Object.defineProperty(precisionRound, "__esModule", {
  value: true
});
precisionRound.default = _default$7;
var _exponent$1 = _interopRequireDefault$k(exponent$1);
function _interopRequireDefault$k(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _default$7(step2, max2) {
  step2 = Math.abs(step2), max2 = Math.abs(max2) - step2;
  return Math.max(0, (0, _exponent$1.default)(max2) - (0, _exponent$1.default)(step2)) + 1;
}
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "FormatSpecifier", {
    enumerable: true,
    get: function() {
      return _formatSpecifier2.FormatSpecifier;
    }
  });
  Object.defineProperty(exports, "format", {
    enumerable: true,
    get: function() {
      return _defaultLocale2.format;
    }
  });
  Object.defineProperty(exports, "formatDefaultLocale", {
    enumerable: true,
    get: function() {
      return _defaultLocale2.default;
    }
  });
  Object.defineProperty(exports, "formatLocale", {
    enumerable: true,
    get: function() {
      return _locale2.default;
    }
  });
  Object.defineProperty(exports, "formatPrefix", {
    enumerable: true,
    get: function() {
      return _defaultLocale2.formatPrefix;
    }
  });
  Object.defineProperty(exports, "formatSpecifier", {
    enumerable: true,
    get: function() {
      return _formatSpecifier2.default;
    }
  });
  Object.defineProperty(exports, "precisionFixed", {
    enumerable: true,
    get: function() {
      return _precisionFixed.default;
    }
  });
  Object.defineProperty(exports, "precisionPrefix", {
    enumerable: true,
    get: function() {
      return _precisionPrefix.default;
    }
  });
  Object.defineProperty(exports, "precisionRound", {
    enumerable: true,
    get: function() {
      return _precisionRound.default;
    }
  });
  var _defaultLocale2 = _interopRequireWildcard2(defaultLocale$3);
  var _locale2 = _interopRequireDefault2(locale$3);
  var _formatSpecifier2 = _interopRequireWildcard2(formatSpecifier$1);
  var _precisionFixed = _interopRequireDefault2(precisionFixed);
  var _precisionPrefix = _interopRequireDefault2(precisionPrefix);
  var _precisionRound = _interopRequireDefault2(precisionRound);
  function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _getRequireWildcardCache2(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache2 = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard2(obj, nodeInterop) {
    if (obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache2(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
})(src$2);
Object.defineProperty(tickFormat$1, "__esModule", {
  value: true
});
tickFormat$1.default = tickFormat;
var _index$c = src$6;
var _index2$3 = src$2;
function tickFormat(start2, stop2, count2, specifier) {
  var step2 = (0, _index$c.tickStep)(start2, stop2, count2), precision;
  specifier = (0, _index2$3.formatSpecifier)(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value2 = Math.max(Math.abs(start2), Math.abs(stop2));
      if (specifier.precision == null && !isNaN(precision = (0, _index2$3.precisionPrefix)(step2, value2))) specifier.precision = precision;
      return (0, _index2$3.formatPrefix)(specifier, value2);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = (0, _index2$3.precisionRound)(step2, Math.max(Math.abs(start2), Math.abs(stop2))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = (0, _index2$3.precisionFixed)(step2))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return (0, _index2$3.format)(specifier);
}
Object.defineProperty(linear$2, "__esModule", {
  value: true
});
linear$2.default = linear;
linear$2.linearish = linearish;
var _index$b = src$6;
var _continuous$8 = _interopRequireWildcard$2(continuous$1);
var _init$c = init;
var _tickFormat = _interopRequireDefault$j(tickFormat$1);
function _interopRequireDefault$j(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _getRequireWildcardCache$2(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$2 = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$2(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$2(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function linearish(scale) {
  var domain2 = scale.domain;
  scale.ticks = function(count2) {
    var d = domain2();
    return (0, _index$b.ticks)(d[0], d[d.length - 1], count2 == null ? 10 : count2);
  };
  scale.tickFormat = function(count2, specifier) {
    var d = domain2();
    return (0, _tickFormat.default)(d[0], d[d.length - 1], count2 == null ? 10 : count2, specifier);
  };
  scale.nice = function(count2) {
    if (count2 == null) count2 = 10;
    var d = domain2();
    var i0 = 0;
    var i1 = d.length - 1;
    var start2 = d[i0];
    var stop2 = d[i1];
    var prestep;
    var step2;
    var maxIter = 10;
    if (stop2 < start2) {
      step2 = start2, start2 = stop2, stop2 = step2;
      step2 = i0, i0 = i1, i1 = step2;
    }
    while (maxIter-- > 0) {
      step2 = (0, _index$b.tickIncrement)(start2, stop2, count2);
      if (step2 === prestep) {
        d[i0] = start2;
        d[i1] = stop2;
        return domain2(d);
      } else if (step2 > 0) {
        start2 = Math.floor(start2 / step2) * step2;
        stop2 = Math.ceil(stop2 / step2) * step2;
      } else if (step2 < 0) {
        start2 = Math.ceil(start2 * step2) / step2;
        stop2 = Math.floor(stop2 * step2) / step2;
      } else {
        break;
      }
      prestep = step2;
    }
    return scale;
  };
  return scale;
}
function linear() {
  var scale = (0, _continuous$8.default)();
  scale.copy = function() {
    return (0, _continuous$8.copy)(scale, linear());
  };
  _init$c.initRange.apply(scale, arguments);
  return linearish(scale);
}
Object.defineProperty(identity$4, "__esModule", {
  value: true
});
identity$4.default = identity;
var _linear$6 = linear$2;
var _number$1 = _interopRequireDefault$i(number$3);
function _interopRequireDefault$i(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function identity(domain2) {
  var unknown2;
  function scale(x2) {
    return x2 == null || isNaN(x2 = +x2) ? unknown2 : x2;
  }
  scale.invert = scale;
  scale.domain = scale.range = function(_) {
    return arguments.length ? (domain2 = Array.from(_, _number$1.default), scale) : domain2.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown2 = _, scale) : unknown2;
  };
  scale.copy = function() {
    return identity(domain2).unknown(unknown2);
  };
  domain2 = arguments.length ? Array.from(domain2, _number$1.default) : [0, 1];
  return (0, _linear$6.linearish)(scale);
}
var log$1 = {};
var nice$2 = {};
Object.defineProperty(nice$2, "__esModule", {
  value: true
});
nice$2.default = nice$1;
function nice$1(domain2, interval2) {
  domain2 = domain2.slice();
  var i0 = 0, i1 = domain2.length - 1, x0 = domain2[i0], x1 = domain2[i1], t;
  if (x1 < x0) {
    t = i0, i0 = i1, i1 = t;
    t = x0, x0 = x1, x1 = t;
  }
  domain2[i0] = interval2.floor(x0);
  domain2[i1] = interval2.ceil(x1);
  return domain2;
}
Object.defineProperty(log$1, "__esModule", {
  value: true
});
log$1.default = log;
log$1.loggish = loggish;
var _index$a = src$6;
var _index2$2 = src$2;
var _nice$2 = _interopRequireDefault$h(nice$2);
var _continuous$7 = continuous$1;
var _init$b = init;
function _interopRequireDefault$h(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function transformLog(x2) {
  return Math.log(x2);
}
function transformExp(x2) {
  return Math.exp(x2);
}
function transformLogn(x2) {
  return -Math.log(-x2);
}
function transformExpn(x2) {
  return -Math.exp(-x2);
}
function pow10(x2) {
  return isFinite(x2) ? +("1e" + x2) : x2 < 0 ? 0 : x2;
}
function powp(base2) {
  return base2 === 10 ? pow10 : base2 === Math.E ? Math.exp : (x2) => Math.pow(base2, x2);
}
function logp(base2) {
  return base2 === Math.E ? Math.log : base2 === 10 && Math.log10 || base2 === 2 && Math.log2 || (base2 = Math.log(base2), (x2) => Math.log(x2) / base2);
}
function reflect(f) {
  return (x2, k2) => -f(-x2, k2);
}
function loggish(transform2) {
  const scale = transform2(transformLog, transformExp);
  const domain2 = scale.domain;
  let base2 = 10;
  let logs;
  let pows;
  function rescale() {
    logs = logp(base2), pows = powp(base2);
    if (domain2()[0] < 0) {
      logs = reflect(logs), pows = reflect(pows);
      transform2(transformLogn, transformExpn);
    } else {
      transform2(transformLog, transformExp);
    }
    return scale;
  }
  scale.base = function(_) {
    return arguments.length ? (base2 = +_, rescale()) : base2;
  };
  scale.domain = function(_) {
    return arguments.length ? (domain2(_), rescale()) : domain2();
  };
  scale.ticks = (count2) => {
    const d = domain2();
    let u = d[0];
    let v = d[d.length - 1];
    const r = v < u;
    if (r) [u, v] = [v, u];
    let i = logs(u);
    let j = logs(v);
    let k2;
    let t;
    const n = count2 == null ? 10 : +count2;
    let z = [];
    if (!(base2 % 1) && j - i < n) {
      i = Math.floor(i), j = Math.ceil(j);
      if (u > 0) for (; i <= j; ++i) {
        for (k2 = 1; k2 < base2; ++k2) {
          t = i < 0 ? k2 / pows(-i) : k2 * pows(i);
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
      else for (; i <= j; ++i) {
        for (k2 = base2 - 1; k2 >= 1; --k2) {
          t = i > 0 ? k2 / pows(-i) : k2 * pows(i);
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
      if (z.length * 2 < n) z = (0, _index$a.ticks)(u, v, n);
    } else {
      z = (0, _index$a.ticks)(i, j, Math.min(j - i, n)).map(pows);
    }
    return r ? z.reverse() : z;
  };
  scale.tickFormat = (count2, specifier) => {
    if (count2 == null) count2 = 10;
    if (specifier == null) specifier = base2 === 10 ? "s" : ",";
    if (typeof specifier !== "function") {
      if (!(base2 % 1) && (specifier = (0, _index2$2.formatSpecifier)(specifier)).precision == null) specifier.trim = true;
      specifier = (0, _index2$2.format)(specifier);
    }
    if (count2 === Infinity) return specifier;
    const k2 = Math.max(1, base2 * count2 / scale.ticks().length);
    return (d) => {
      let i = d / pows(Math.round(logs(d)));
      if (i * base2 < base2 - 0.5) i *= base2;
      return i <= k2 ? specifier(d) : "";
    };
  };
  scale.nice = () => {
    return domain2((0, _nice$2.default)(domain2(), {
      floor: (x2) => pows(Math.floor(logs(x2))),
      ceil: (x2) => pows(Math.ceil(logs(x2)))
    }));
  };
  return scale;
}
function log() {
  const scale = loggish((0, _continuous$7.transformer)()).domain([1, 10]);
  scale.copy = () => (0, _continuous$7.copy)(scale, log()).base(scale.base());
  _init$b.initRange.apply(scale, arguments);
  return scale;
}
var symlog$1 = {};
Object.defineProperty(symlog$1, "__esModule", {
  value: true
});
symlog$1.default = symlog;
symlog$1.symlogish = symlogish;
var _linear$5 = linear$2;
var _continuous$6 = continuous$1;
var _init$a = init;
function transformSymlog(c6) {
  return function(x2) {
    return Math.sign(x2) * Math.log1p(Math.abs(x2 / c6));
  };
}
function transformSymexp(c6) {
  return function(x2) {
    return Math.sign(x2) * Math.expm1(Math.abs(x2)) * c6;
  };
}
function symlogish(transform2) {
  var c6 = 1, scale = transform2(transformSymlog(c6), transformSymexp(c6));
  scale.constant = function(_) {
    return arguments.length ? transform2(transformSymlog(c6 = +_), transformSymexp(c6)) : c6;
  };
  return (0, _linear$5.linearish)(scale);
}
function symlog() {
  var scale = symlogish((0, _continuous$6.transformer)());
  scale.copy = function() {
    return (0, _continuous$6.copy)(scale, symlog()).constant(scale.constant());
  };
  return _init$a.initRange.apply(scale, arguments);
}
var pow$1 = {};
Object.defineProperty(pow$1, "__esModule", {
  value: true
});
pow$1.default = pow;
pow$1.powish = powish;
pow$1.sqrt = sqrt;
var _linear$4 = linear$2;
var _continuous$5 = continuous$1;
var _init$9 = init;
function transformPow(exponent2) {
  return function(x2) {
    return x2 < 0 ? -Math.pow(-x2, exponent2) : Math.pow(x2, exponent2);
  };
}
function transformSqrt(x2) {
  return x2 < 0 ? -Math.sqrt(-x2) : Math.sqrt(x2);
}
function transformSquare(x2) {
  return x2 < 0 ? -x2 * x2 : x2 * x2;
}
function powish(transform2) {
  var scale = transform2(_continuous$5.identity, _continuous$5.identity), exponent2 = 1;
  function rescale() {
    return exponent2 === 1 ? transform2(_continuous$5.identity, _continuous$5.identity) : exponent2 === 0.5 ? transform2(transformSqrt, transformSquare) : transform2(transformPow(exponent2), transformPow(1 / exponent2));
  }
  scale.exponent = function(_) {
    return arguments.length ? (exponent2 = +_, rescale()) : exponent2;
  };
  return (0, _linear$4.linearish)(scale);
}
function pow() {
  var scale = powish((0, _continuous$5.transformer)());
  scale.copy = function() {
    return (0, _continuous$5.copy)(scale, pow()).exponent(scale.exponent());
  };
  _init$9.initRange.apply(scale, arguments);
  return scale;
}
function sqrt() {
  return pow.apply(null, arguments).exponent(0.5);
}
var radial$1 = {};
Object.defineProperty(radial$1, "__esModule", {
  value: true
});
radial$1.default = radial;
var _continuous$4 = _interopRequireDefault$g(continuous$1);
var _init$8 = init;
var _linear$3 = linear$2;
var _number = _interopRequireDefault$g(number$3);
function _interopRequireDefault$g(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function square(x2) {
  return Math.sign(x2) * x2 * x2;
}
function unsquare(x2) {
  return Math.sign(x2) * Math.sqrt(Math.abs(x2));
}
function radial() {
  var squared = (0, _continuous$4.default)(), range2 = [0, 1], round2 = false, unknown2;
  function scale(x2) {
    var y2 = unsquare(squared(x2));
    return isNaN(y2) ? unknown2 : round2 ? Math.round(y2) : y2;
  }
  scale.invert = function(y2) {
    return squared.invert(square(y2));
  };
  scale.domain = function(_) {
    return arguments.length ? (squared.domain(_), scale) : squared.domain();
  };
  scale.range = function(_) {
    return arguments.length ? (squared.range((range2 = Array.from(_, _number.default)).map(square)), scale) : range2.slice();
  };
  scale.rangeRound = function(_) {
    return scale.range(_).round(true);
  };
  scale.round = function(_) {
    return arguments.length ? (round2 = !!_, scale) : round2;
  };
  scale.clamp = function(_) {
    return arguments.length ? (squared.clamp(_), scale) : squared.clamp();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown2 = _, scale) : unknown2;
  };
  scale.copy = function() {
    return radial(squared.domain(), range2).round(round2).clamp(squared.clamp()).unknown(unknown2);
  };
  _init$8.initRange.apply(scale, arguments);
  return (0, _linear$3.linearish)(scale);
}
var quantile$1 = {};
Object.defineProperty(quantile$1, "__esModule", {
  value: true
});
quantile$1.default = quantile;
var _index$9 = src$6;
var _init$7 = init;
function quantile() {
  var domain2 = [], range2 = [], thresholds = [], unknown2;
  function rescale() {
    var i = 0, n = Math.max(1, range2.length);
    thresholds = new Array(n - 1);
    while (++i < n) thresholds[i - 1] = (0, _index$9.quantileSorted)(domain2, i / n);
    return scale;
  }
  function scale(x2) {
    return x2 == null || isNaN(x2 = +x2) ? unknown2 : range2[(0, _index$9.bisect)(thresholds, x2)];
  }
  scale.invertExtent = function(y2) {
    var i = range2.indexOf(y2);
    return i < 0 ? [NaN, NaN] : [i > 0 ? thresholds[i - 1] : domain2[0], i < thresholds.length ? thresholds[i] : domain2[domain2.length - 1]];
  };
  scale.domain = function(_) {
    if (!arguments.length) return domain2.slice();
    domain2 = [];
    for (let d of _) if (d != null && !isNaN(d = +d)) domain2.push(d);
    domain2.sort(_index$9.ascending);
    return rescale();
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), rescale()) : range2.slice();
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown2 = _, scale) : unknown2;
  };
  scale.quantiles = function() {
    return thresholds.slice();
  };
  scale.copy = function() {
    return quantile().domain(domain2).range(range2).unknown(unknown2);
  };
  return _init$7.initRange.apply(scale, arguments);
}
var quantize$1 = {};
Object.defineProperty(quantize$1, "__esModule", {
  value: true
});
quantize$1.default = quantize;
var _index$8 = src$6;
var _linear$2 = linear$2;
var _init$6 = init;
function quantize() {
  var x0 = 0, x1 = 1, n = 1, domain2 = [0.5], range2 = [0, 1], unknown2;
  function scale(x2) {
    return x2 != null && x2 <= x2 ? range2[(0, _index$8.bisect)(domain2, x2, 0, n)] : unknown2;
  }
  function rescale() {
    var i = -1;
    domain2 = new Array(n);
    while (++i < n) domain2[i] = ((i + 1) * x1 - (i - n) * x0) / (n + 1);
    return scale;
  }
  scale.domain = function(_) {
    return arguments.length ? ([x0, x1] = _, x0 = +x0, x1 = +x1, rescale()) : [x0, x1];
  };
  scale.range = function(_) {
    return arguments.length ? (n = (range2 = Array.from(_)).length - 1, rescale()) : range2.slice();
  };
  scale.invertExtent = function(y2) {
    var i = range2.indexOf(y2);
    return i < 0 ? [NaN, NaN] : i < 1 ? [x0, domain2[0]] : i >= n ? [domain2[n - 1], x1] : [domain2[i - 1], domain2[i]];
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown2 = _, scale) : scale;
  };
  scale.thresholds = function() {
    return domain2.slice();
  };
  scale.copy = function() {
    return quantize().domain([x0, x1]).range(range2).unknown(unknown2);
  };
  return _init$6.initRange.apply((0, _linear$2.linearish)(scale), arguments);
}
var threshold$1 = {};
Object.defineProperty(threshold$1, "__esModule", {
  value: true
});
threshold$1.default = threshold;
var _index$7 = src$6;
var _init$5 = init;
function threshold() {
  var domain2 = [0.5], range2 = [0, 1], unknown2, n = 1;
  function scale(x2) {
    return x2 != null && x2 <= x2 ? range2[(0, _index$7.bisect)(domain2, x2, 0, n)] : unknown2;
  }
  scale.domain = function(_) {
    return arguments.length ? (domain2 = Array.from(_), n = Math.min(domain2.length, range2.length - 1), scale) : domain2.slice();
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), n = Math.min(domain2.length, range2.length - 1), scale) : range2.slice();
  };
  scale.invertExtent = function(y2) {
    var i = range2.indexOf(y2);
    return [domain2[i - 1], domain2[i]];
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown2 = _, scale) : unknown2;
  };
  scale.copy = function() {
    return threshold().domain(domain2).range(range2).unknown(unknown2);
  };
  return _init$5.initRange.apply(scale, arguments);
}
var time$1 = {};
var src$1 = {};
var interval = {};
Object.defineProperty(interval, "__esModule", {
  value: true
});
interval.timeInterval = timeInterval;
const t0 = /* @__PURE__ */ new Date(), t1 = /* @__PURE__ */ new Date();
function timeInterval(floori, offseti, count2, field) {
  function interval2(date2) {
    return floori(date2 = arguments.length === 0 ? /* @__PURE__ */ new Date() : /* @__PURE__ */ new Date(+date2)), date2;
  }
  interval2.floor = (date2) => {
    return floori(date2 = /* @__PURE__ */ new Date(+date2)), date2;
  };
  interval2.ceil = (date2) => {
    return floori(date2 = new Date(date2 - 1)), offseti(date2, 1), floori(date2), date2;
  };
  interval2.round = (date2) => {
    const d0 = interval2(date2), d1 = interval2.ceil(date2);
    return date2 - d0 < d1 - date2 ? d0 : d1;
  };
  interval2.offset = (date2, step2) => {
    return offseti(date2 = /* @__PURE__ */ new Date(+date2), step2 == null ? 1 : Math.floor(step2)), date2;
  };
  interval2.range = (start2, stop2, step2) => {
    const range2 = [];
    start2 = interval2.ceil(start2);
    step2 = step2 == null ? 1 : Math.floor(step2);
    if (!(start2 < stop2) || !(step2 > 0)) return range2;
    let previous;
    do
      range2.push(previous = /* @__PURE__ */ new Date(+start2)), offseti(start2, step2), floori(start2);
    while (previous < start2 && start2 < stop2);
    return range2;
  };
  interval2.filter = (test) => {
    return timeInterval((date2) => {
      if (date2 >= date2) while (floori(date2), !test(date2)) date2.setTime(date2 - 1);
    }, (date2, step2) => {
      if (date2 >= date2) {
        if (step2 < 0) while (++step2 <= 0) {
          while (offseti(date2, -1), !test(date2)) {
          }
        }
        else while (--step2 >= 0) {
          while (offseti(date2, 1), !test(date2)) {
          }
        }
      }
    });
  };
  if (count2) {
    interval2.count = (start2, end) => {
      t0.setTime(+start2), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count2(t0, t1));
    };
    interval2.every = (step2) => {
      step2 = Math.floor(step2);
      return !isFinite(step2) || !(step2 > 0) ? null : !(step2 > 1) ? interval2 : interval2.filter(field ? (d) => field(d) % step2 === 0 : (d) => interval2.count(0, d) % step2 === 0);
    };
  }
  return interval2;
}
var millisecond$1 = {};
Object.defineProperty(millisecond$1, "__esModule", {
  value: true
});
millisecond$1.milliseconds = millisecond$1.millisecond = void 0;
var _interval$7 = interval;
const millisecond = (0, _interval$7.timeInterval)(() => {
}, (date2, step2) => {
  date2.setTime(+date2 + step2);
}, (start2, end) => {
  return end - start2;
});
millisecond$1.millisecond = millisecond;
millisecond.every = (k2) => {
  k2 = Math.floor(k2);
  if (!isFinite(k2) || !(k2 > 0)) return null;
  if (!(k2 > 1)) return millisecond;
  return (0, _interval$7.timeInterval)((date2) => {
    date2.setTime(Math.floor(date2 / k2) * k2);
  }, (date2, step2) => {
    date2.setTime(+date2 + step2 * k2);
  }, (start2, end) => {
    return (end - start2) / k2;
  });
};
const milliseconds = millisecond.range;
millisecond$1.milliseconds = milliseconds;
var second$1 = {};
var duration = {};
Object.defineProperty(duration, "__esModule", {
  value: true
});
duration.durationYear = duration.durationWeek = duration.durationSecond = duration.durationMonth = duration.durationMinute = duration.durationHour = duration.durationDay = void 0;
const durationSecond = 1e3;
duration.durationSecond = durationSecond;
const durationMinute = durationSecond * 60;
duration.durationMinute = durationMinute;
const durationHour = durationMinute * 60;
duration.durationHour = durationHour;
const durationDay = durationHour * 24;
duration.durationDay = durationDay;
const durationWeek = durationDay * 7;
duration.durationWeek = durationWeek;
const durationMonth = durationDay * 30;
duration.durationMonth = durationMonth;
const durationYear = durationDay * 365;
duration.durationYear = durationYear;
Object.defineProperty(second$1, "__esModule", {
  value: true
});
second$1.seconds = second$1.second = void 0;
var _interval$6 = interval;
var _duration$5 = duration;
const second = (0, _interval$6.timeInterval)((date2) => {
  date2.setTime(date2 - date2.getMilliseconds());
}, (date2, step2) => {
  date2.setTime(+date2 + step2 * _duration$5.durationSecond);
}, (start2, end) => {
  return (end - start2) / _duration$5.durationSecond;
}, (date2) => {
  return date2.getUTCSeconds();
});
second$1.second = second;
const seconds = second.range;
second$1.seconds = seconds;
var minute = {};
Object.defineProperty(minute, "__esModule", {
  value: true
});
minute.utcMinutes = minute.utcMinute = minute.timeMinutes = minute.timeMinute = void 0;
var _interval$5 = interval;
var _duration$4 = duration;
const timeMinute = (0, _interval$5.timeInterval)((date2) => {
  date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * _duration$4.durationSecond);
}, (date2, step2) => {
  date2.setTime(+date2 + step2 * _duration$4.durationMinute);
}, (start2, end) => {
  return (end - start2) / _duration$4.durationMinute;
}, (date2) => {
  return date2.getMinutes();
});
minute.timeMinute = timeMinute;
const timeMinutes = timeMinute.range;
minute.timeMinutes = timeMinutes;
const utcMinute = (0, _interval$5.timeInterval)((date2) => {
  date2.setUTCSeconds(0, 0);
}, (date2, step2) => {
  date2.setTime(+date2 + step2 * _duration$4.durationMinute);
}, (start2, end) => {
  return (end - start2) / _duration$4.durationMinute;
}, (date2) => {
  return date2.getUTCMinutes();
});
minute.utcMinute = utcMinute;
const utcMinutes = utcMinute.range;
minute.utcMinutes = utcMinutes;
var hour = {};
Object.defineProperty(hour, "__esModule", {
  value: true
});
hour.utcHours = hour.utcHour = hour.timeHours = hour.timeHour = void 0;
var _interval$4 = interval;
var _duration$3 = duration;
const timeHour = (0, _interval$4.timeInterval)((date2) => {
  date2.setTime(date2 - date2.getMilliseconds() - date2.getSeconds() * _duration$3.durationSecond - date2.getMinutes() * _duration$3.durationMinute);
}, (date2, step2) => {
  date2.setTime(+date2 + step2 * _duration$3.durationHour);
}, (start2, end) => {
  return (end - start2) / _duration$3.durationHour;
}, (date2) => {
  return date2.getHours();
});
hour.timeHour = timeHour;
const timeHours = timeHour.range;
hour.timeHours = timeHours;
const utcHour = (0, _interval$4.timeInterval)((date2) => {
  date2.setUTCMinutes(0, 0, 0);
}, (date2, step2) => {
  date2.setTime(+date2 + step2 * _duration$3.durationHour);
}, (start2, end) => {
  return (end - start2) / _duration$3.durationHour;
}, (date2) => {
  return date2.getUTCHours();
});
hour.utcHour = utcHour;
const utcHours = utcHour.range;
hour.utcHours = utcHours;
var day = {};
Object.defineProperty(day, "__esModule", {
  value: true
});
day.utcDays = day.utcDay = day.unixDays = day.unixDay = day.timeDays = day.timeDay = void 0;
var _interval$3 = interval;
var _duration$2 = duration;
const timeDay = (0, _interval$3.timeInterval)((date2) => date2.setHours(0, 0, 0, 0), (date2, step2) => date2.setDate(date2.getDate() + step2), (start2, end) => (end - start2 - (end.getTimezoneOffset() - start2.getTimezoneOffset()) * _duration$2.durationMinute) / _duration$2.durationDay, (date2) => date2.getDate() - 1);
day.timeDay = timeDay;
const timeDays = timeDay.range;
day.timeDays = timeDays;
const utcDay = (0, _interval$3.timeInterval)((date2) => {
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step2) => {
  date2.setUTCDate(date2.getUTCDate() + step2);
}, (start2, end) => {
  return (end - start2) / _duration$2.durationDay;
}, (date2) => {
  return date2.getUTCDate() - 1;
});
day.utcDay = utcDay;
const utcDays = utcDay.range;
day.utcDays = utcDays;
const unixDay = (0, _interval$3.timeInterval)((date2) => {
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step2) => {
  date2.setUTCDate(date2.getUTCDate() + step2);
}, (start2, end) => {
  return (end - start2) / _duration$2.durationDay;
}, (date2) => {
  return Math.floor(date2 / _duration$2.durationDay);
});
day.unixDay = unixDay;
const unixDays = unixDay.range;
day.unixDays = unixDays;
var week = {};
Object.defineProperty(week, "__esModule", {
  value: true
});
week.utcWednesdays = week.utcWednesday = week.utcTuesdays = week.utcTuesday = week.utcThursdays = week.utcThursday = week.utcSundays = week.utcSunday = week.utcSaturdays = week.utcSaturday = week.utcMondays = week.utcMonday = week.utcFridays = week.utcFriday = week.timeWednesdays = week.timeWednesday = week.timeTuesdays = week.timeTuesday = week.timeThursdays = week.timeThursday = week.timeSundays = week.timeSunday = week.timeSaturdays = week.timeSaturday = week.timeMondays = week.timeMonday = week.timeFridays = week.timeFriday = void 0;
var _interval$2 = interval;
var _duration$1 = duration;
function timeWeekday(i) {
  return (0, _interval$2.timeInterval)((date2) => {
    date2.setDate(date2.getDate() - (date2.getDay() + 7 - i) % 7);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step2) => {
    date2.setDate(date2.getDate() + step2 * 7);
  }, (start2, end) => {
    return (end - start2 - (end.getTimezoneOffset() - start2.getTimezoneOffset()) * _duration$1.durationMinute) / _duration$1.durationWeek;
  });
}
const timeSunday = timeWeekday(0);
week.timeSunday = timeSunday;
const timeMonday = timeWeekday(1);
week.timeMonday = timeMonday;
const timeTuesday = timeWeekday(2);
week.timeTuesday = timeTuesday;
const timeWednesday = timeWeekday(3);
week.timeWednesday = timeWednesday;
const timeThursday = timeWeekday(4);
week.timeThursday = timeThursday;
const timeFriday = timeWeekday(5);
week.timeFriday = timeFriday;
const timeSaturday = timeWeekday(6);
week.timeSaturday = timeSaturday;
const timeSundays = timeSunday.range;
week.timeSundays = timeSundays;
const timeMondays = timeMonday.range;
week.timeMondays = timeMondays;
const timeTuesdays = timeTuesday.range;
week.timeTuesdays = timeTuesdays;
const timeWednesdays = timeWednesday.range;
week.timeWednesdays = timeWednesdays;
const timeThursdays = timeThursday.range;
week.timeThursdays = timeThursdays;
const timeFridays = timeFriday.range;
week.timeFridays = timeFridays;
const timeSaturdays = timeSaturday.range;
week.timeSaturdays = timeSaturdays;
function utcWeekday(i) {
  return (0, _interval$2.timeInterval)((date2) => {
    date2.setUTCDate(date2.getUTCDate() - (date2.getUTCDay() + 7 - i) % 7);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step2) => {
    date2.setUTCDate(date2.getUTCDate() + step2 * 7);
  }, (start2, end) => {
    return (end - start2) / _duration$1.durationWeek;
  });
}
const utcSunday = utcWeekday(0);
week.utcSunday = utcSunday;
const utcMonday = utcWeekday(1);
week.utcMonday = utcMonday;
const utcTuesday = utcWeekday(2);
week.utcTuesday = utcTuesday;
const utcWednesday = utcWeekday(3);
week.utcWednesday = utcWednesday;
const utcThursday = utcWeekday(4);
week.utcThursday = utcThursday;
const utcFriday = utcWeekday(5);
week.utcFriday = utcFriday;
const utcSaturday = utcWeekday(6);
week.utcSaturday = utcSaturday;
const utcSundays = utcSunday.range;
week.utcSundays = utcSundays;
const utcMondays = utcMonday.range;
week.utcMondays = utcMondays;
const utcTuesdays = utcTuesday.range;
week.utcTuesdays = utcTuesdays;
const utcWednesdays = utcWednesday.range;
week.utcWednesdays = utcWednesdays;
const utcThursdays = utcThursday.range;
week.utcThursdays = utcThursdays;
const utcFridays = utcFriday.range;
week.utcFridays = utcFridays;
const utcSaturdays = utcSaturday.range;
week.utcSaturdays = utcSaturdays;
var month = {};
Object.defineProperty(month, "__esModule", {
  value: true
});
month.utcMonths = month.utcMonth = month.timeMonths = month.timeMonth = void 0;
var _interval$1 = interval;
const timeMonth = (0, _interval$1.timeInterval)((date2) => {
  date2.setDate(1);
  date2.setHours(0, 0, 0, 0);
}, (date2, step2) => {
  date2.setMonth(date2.getMonth() + step2);
}, (start2, end) => {
  return end.getMonth() - start2.getMonth() + (end.getFullYear() - start2.getFullYear()) * 12;
}, (date2) => {
  return date2.getMonth();
});
month.timeMonth = timeMonth;
const timeMonths = timeMonth.range;
month.timeMonths = timeMonths;
const utcMonth = (0, _interval$1.timeInterval)((date2) => {
  date2.setUTCDate(1);
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step2) => {
  date2.setUTCMonth(date2.getUTCMonth() + step2);
}, (start2, end) => {
  return end.getUTCMonth() - start2.getUTCMonth() + (end.getUTCFullYear() - start2.getUTCFullYear()) * 12;
}, (date2) => {
  return date2.getUTCMonth();
});
month.utcMonth = utcMonth;
const utcMonths = utcMonth.range;
month.utcMonths = utcMonths;
var year = {};
Object.defineProperty(year, "__esModule", {
  value: true
});
year.utcYears = year.utcYear = year.timeYears = year.timeYear = void 0;
var _interval = interval;
const timeYear = (0, _interval.timeInterval)((date2) => {
  date2.setMonth(0, 1);
  date2.setHours(0, 0, 0, 0);
}, (date2, step2) => {
  date2.setFullYear(date2.getFullYear() + step2);
}, (start2, end) => {
  return end.getFullYear() - start2.getFullYear();
}, (date2) => {
  return date2.getFullYear();
});
year.timeYear = timeYear;
timeYear.every = (k2) => {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : (0, _interval.timeInterval)((date2) => {
    date2.setFullYear(Math.floor(date2.getFullYear() / k2) * k2);
    date2.setMonth(0, 1);
    date2.setHours(0, 0, 0, 0);
  }, (date2, step2) => {
    date2.setFullYear(date2.getFullYear() + step2 * k2);
  });
};
const timeYears = timeYear.range;
year.timeYears = timeYears;
const utcYear = (0, _interval.timeInterval)((date2) => {
  date2.setUTCMonth(0, 1);
  date2.setUTCHours(0, 0, 0, 0);
}, (date2, step2) => {
  date2.setUTCFullYear(date2.getUTCFullYear() + step2);
}, (start2, end) => {
  return end.getUTCFullYear() - start2.getUTCFullYear();
}, (date2) => {
  return date2.getUTCFullYear();
});
year.utcYear = utcYear;
utcYear.every = (k2) => {
  return !isFinite(k2 = Math.floor(k2)) || !(k2 > 0) ? null : (0, _interval.timeInterval)((date2) => {
    date2.setUTCFullYear(Math.floor(date2.getUTCFullYear() / k2) * k2);
    date2.setUTCMonth(0, 1);
    date2.setUTCHours(0, 0, 0, 0);
  }, (date2, step2) => {
    date2.setUTCFullYear(date2.getUTCFullYear() + step2 * k2);
  });
};
const utcYears = utcYear.range;
year.utcYears = utcYears;
var ticks = {};
Object.defineProperty(ticks, "__esModule", {
  value: true
});
ticks.utcTicks = ticks.utcTickInterval = ticks.timeTicks = ticks.timeTickInterval = void 0;
var _index$6 = src$6;
var _duration = duration;
var _millisecond = millisecond$1;
var _second = second$1;
var _minute = minute;
var _hour = hour;
var _day = day;
var _week = week;
var _month = month;
var _year = year;
function ticker(year2, month2, week2, day2, hour2, minute2) {
  const tickIntervals = [[_second.second, 1, _duration.durationSecond], [_second.second, 5, 5 * _duration.durationSecond], [_second.second, 15, 15 * _duration.durationSecond], [_second.second, 30, 30 * _duration.durationSecond], [minute2, 1, _duration.durationMinute], [minute2, 5, 5 * _duration.durationMinute], [minute2, 15, 15 * _duration.durationMinute], [minute2, 30, 30 * _duration.durationMinute], [hour2, 1, _duration.durationHour], [hour2, 3, 3 * _duration.durationHour], [hour2, 6, 6 * _duration.durationHour], [hour2, 12, 12 * _duration.durationHour], [day2, 1, _duration.durationDay], [day2, 2, 2 * _duration.durationDay], [week2, 1, _duration.durationWeek], [month2, 1, _duration.durationMonth], [month2, 3, 3 * _duration.durationMonth], [year2, 1, _duration.durationYear]];
  function ticks2(start2, stop2, count2) {
    const reverse2 = stop2 < start2;
    if (reverse2) [start2, stop2] = [stop2, start2];
    const interval2 = count2 && typeof count2.range === "function" ? count2 : tickInterval(start2, stop2, count2);
    const ticks3 = interval2 ? interval2.range(start2, +stop2 + 1) : [];
    return reverse2 ? ticks3.reverse() : ticks3;
  }
  function tickInterval(start2, stop2, count2) {
    const target = Math.abs(stop2 - start2) / count2;
    const i = (0, _index$6.bisector)(([, , step3]) => step3).right(tickIntervals, target);
    if (i === tickIntervals.length) return year2.every((0, _index$6.tickStep)(start2 / _duration.durationYear, stop2 / _duration.durationYear, count2));
    if (i === 0) return _millisecond.millisecond.every(Math.max((0, _index$6.tickStep)(start2, stop2, count2), 1));
    const [t, step2] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
    return t.every(step2);
  }
  return [ticks2, tickInterval];
}
const [utcTicks, utcTickInterval] = ticker(_year.utcYear, _month.utcMonth, _week.utcSunday, _day.unixDay, _hour.utcHour, _minute.utcMinute);
ticks.utcTickInterval = utcTickInterval;
ticks.utcTicks = utcTicks;
const [timeTicks, timeTickInterval] = ticker(_year.timeYear, _month.timeMonth, _week.timeSunday, _day.timeDay, _hour.timeHour, _minute.timeMinute);
ticks.timeTickInterval = timeTickInterval;
ticks.timeTicks = timeTicks;
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "timeDay", {
    enumerable: true,
    get: function() {
      return _day2.timeDay;
    }
  });
  Object.defineProperty(exports, "timeDays", {
    enumerable: true,
    get: function() {
      return _day2.timeDays;
    }
  });
  Object.defineProperty(exports, "timeFriday", {
    enumerable: true,
    get: function() {
      return _week2.timeFriday;
    }
  });
  Object.defineProperty(exports, "timeFridays", {
    enumerable: true,
    get: function() {
      return _week2.timeFridays;
    }
  });
  Object.defineProperty(exports, "timeHour", {
    enumerable: true,
    get: function() {
      return _hour2.timeHour;
    }
  });
  Object.defineProperty(exports, "timeHours", {
    enumerable: true,
    get: function() {
      return _hour2.timeHours;
    }
  });
  Object.defineProperty(exports, "timeInterval", {
    enumerable: true,
    get: function() {
      return _interval2.timeInterval;
    }
  });
  Object.defineProperty(exports, "timeMillisecond", {
    enumerable: true,
    get: function() {
      return _millisecond2.millisecond;
    }
  });
  Object.defineProperty(exports, "timeMilliseconds", {
    enumerable: true,
    get: function() {
      return _millisecond2.milliseconds;
    }
  });
  Object.defineProperty(exports, "timeMinute", {
    enumerable: true,
    get: function() {
      return _minute2.timeMinute;
    }
  });
  Object.defineProperty(exports, "timeMinutes", {
    enumerable: true,
    get: function() {
      return _minute2.timeMinutes;
    }
  });
  Object.defineProperty(exports, "timeMonday", {
    enumerable: true,
    get: function() {
      return _week2.timeMonday;
    }
  });
  Object.defineProperty(exports, "timeMondays", {
    enumerable: true,
    get: function() {
      return _week2.timeMondays;
    }
  });
  Object.defineProperty(exports, "timeMonth", {
    enumerable: true,
    get: function() {
      return _month2.timeMonth;
    }
  });
  Object.defineProperty(exports, "timeMonths", {
    enumerable: true,
    get: function() {
      return _month2.timeMonths;
    }
  });
  Object.defineProperty(exports, "timeSaturday", {
    enumerable: true,
    get: function() {
      return _week2.timeSaturday;
    }
  });
  Object.defineProperty(exports, "timeSaturdays", {
    enumerable: true,
    get: function() {
      return _week2.timeSaturdays;
    }
  });
  Object.defineProperty(exports, "timeSecond", {
    enumerable: true,
    get: function() {
      return _second2.second;
    }
  });
  Object.defineProperty(exports, "timeSeconds", {
    enumerable: true,
    get: function() {
      return _second2.seconds;
    }
  });
  Object.defineProperty(exports, "timeSunday", {
    enumerable: true,
    get: function() {
      return _week2.timeSunday;
    }
  });
  Object.defineProperty(exports, "timeSundays", {
    enumerable: true,
    get: function() {
      return _week2.timeSundays;
    }
  });
  Object.defineProperty(exports, "timeThursday", {
    enumerable: true,
    get: function() {
      return _week2.timeThursday;
    }
  });
  Object.defineProperty(exports, "timeThursdays", {
    enumerable: true,
    get: function() {
      return _week2.timeThursdays;
    }
  });
  Object.defineProperty(exports, "timeTickInterval", {
    enumerable: true,
    get: function() {
      return _ticks2.timeTickInterval;
    }
  });
  Object.defineProperty(exports, "timeTicks", {
    enumerable: true,
    get: function() {
      return _ticks2.timeTicks;
    }
  });
  Object.defineProperty(exports, "timeTuesday", {
    enumerable: true,
    get: function() {
      return _week2.timeTuesday;
    }
  });
  Object.defineProperty(exports, "timeTuesdays", {
    enumerable: true,
    get: function() {
      return _week2.timeTuesdays;
    }
  });
  Object.defineProperty(exports, "timeWednesday", {
    enumerable: true,
    get: function() {
      return _week2.timeWednesday;
    }
  });
  Object.defineProperty(exports, "timeWednesdays", {
    enumerable: true,
    get: function() {
      return _week2.timeWednesdays;
    }
  });
  Object.defineProperty(exports, "timeWeek", {
    enumerable: true,
    get: function() {
      return _week2.timeSunday;
    }
  });
  Object.defineProperty(exports, "timeWeeks", {
    enumerable: true,
    get: function() {
      return _week2.timeSundays;
    }
  });
  Object.defineProperty(exports, "timeYear", {
    enumerable: true,
    get: function() {
      return _year2.timeYear;
    }
  });
  Object.defineProperty(exports, "timeYears", {
    enumerable: true,
    get: function() {
      return _year2.timeYears;
    }
  });
  Object.defineProperty(exports, "unixDay", {
    enumerable: true,
    get: function() {
      return _day2.unixDay;
    }
  });
  Object.defineProperty(exports, "unixDays", {
    enumerable: true,
    get: function() {
      return _day2.unixDays;
    }
  });
  Object.defineProperty(exports, "utcDay", {
    enumerable: true,
    get: function() {
      return _day2.utcDay;
    }
  });
  Object.defineProperty(exports, "utcDays", {
    enumerable: true,
    get: function() {
      return _day2.utcDays;
    }
  });
  Object.defineProperty(exports, "utcFriday", {
    enumerable: true,
    get: function() {
      return _week2.utcFriday;
    }
  });
  Object.defineProperty(exports, "utcFridays", {
    enumerable: true,
    get: function() {
      return _week2.utcFridays;
    }
  });
  Object.defineProperty(exports, "utcHour", {
    enumerable: true,
    get: function() {
      return _hour2.utcHour;
    }
  });
  Object.defineProperty(exports, "utcHours", {
    enumerable: true,
    get: function() {
      return _hour2.utcHours;
    }
  });
  Object.defineProperty(exports, "utcMillisecond", {
    enumerable: true,
    get: function() {
      return _millisecond2.millisecond;
    }
  });
  Object.defineProperty(exports, "utcMilliseconds", {
    enumerable: true,
    get: function() {
      return _millisecond2.milliseconds;
    }
  });
  Object.defineProperty(exports, "utcMinute", {
    enumerable: true,
    get: function() {
      return _minute2.utcMinute;
    }
  });
  Object.defineProperty(exports, "utcMinutes", {
    enumerable: true,
    get: function() {
      return _minute2.utcMinutes;
    }
  });
  Object.defineProperty(exports, "utcMonday", {
    enumerable: true,
    get: function() {
      return _week2.utcMonday;
    }
  });
  Object.defineProperty(exports, "utcMondays", {
    enumerable: true,
    get: function() {
      return _week2.utcMondays;
    }
  });
  Object.defineProperty(exports, "utcMonth", {
    enumerable: true,
    get: function() {
      return _month2.utcMonth;
    }
  });
  Object.defineProperty(exports, "utcMonths", {
    enumerable: true,
    get: function() {
      return _month2.utcMonths;
    }
  });
  Object.defineProperty(exports, "utcSaturday", {
    enumerable: true,
    get: function() {
      return _week2.utcSaturday;
    }
  });
  Object.defineProperty(exports, "utcSaturdays", {
    enumerable: true,
    get: function() {
      return _week2.utcSaturdays;
    }
  });
  Object.defineProperty(exports, "utcSecond", {
    enumerable: true,
    get: function() {
      return _second2.second;
    }
  });
  Object.defineProperty(exports, "utcSeconds", {
    enumerable: true,
    get: function() {
      return _second2.seconds;
    }
  });
  Object.defineProperty(exports, "utcSunday", {
    enumerable: true,
    get: function() {
      return _week2.utcSunday;
    }
  });
  Object.defineProperty(exports, "utcSundays", {
    enumerable: true,
    get: function() {
      return _week2.utcSundays;
    }
  });
  Object.defineProperty(exports, "utcThursday", {
    enumerable: true,
    get: function() {
      return _week2.utcThursday;
    }
  });
  Object.defineProperty(exports, "utcThursdays", {
    enumerable: true,
    get: function() {
      return _week2.utcThursdays;
    }
  });
  Object.defineProperty(exports, "utcTickInterval", {
    enumerable: true,
    get: function() {
      return _ticks2.utcTickInterval;
    }
  });
  Object.defineProperty(exports, "utcTicks", {
    enumerable: true,
    get: function() {
      return _ticks2.utcTicks;
    }
  });
  Object.defineProperty(exports, "utcTuesday", {
    enumerable: true,
    get: function() {
      return _week2.utcTuesday;
    }
  });
  Object.defineProperty(exports, "utcTuesdays", {
    enumerable: true,
    get: function() {
      return _week2.utcTuesdays;
    }
  });
  Object.defineProperty(exports, "utcWednesday", {
    enumerable: true,
    get: function() {
      return _week2.utcWednesday;
    }
  });
  Object.defineProperty(exports, "utcWednesdays", {
    enumerable: true,
    get: function() {
      return _week2.utcWednesdays;
    }
  });
  Object.defineProperty(exports, "utcWeek", {
    enumerable: true,
    get: function() {
      return _week2.utcSunday;
    }
  });
  Object.defineProperty(exports, "utcWeeks", {
    enumerable: true,
    get: function() {
      return _week2.utcSundays;
    }
  });
  Object.defineProperty(exports, "utcYear", {
    enumerable: true,
    get: function() {
      return _year2.utcYear;
    }
  });
  Object.defineProperty(exports, "utcYears", {
    enumerable: true,
    get: function() {
      return _year2.utcYears;
    }
  });
  var _interval2 = interval;
  var _millisecond2 = millisecond$1;
  var _second2 = second$1;
  var _minute2 = minute;
  var _hour2 = hour;
  var _day2 = day;
  var _week2 = week;
  var _month2 = month;
  var _year2 = year;
  var _ticks2 = ticks;
})(src$1);
var src = {};
var defaultLocale$1 = {};
var locale$1 = {};
Object.defineProperty(locale$1, "__esModule", {
  value: true
});
locale$1.default = formatLocale;
var _index$5 = src$1;
function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date2 = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date2.setFullYear(d.y);
    return date2;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}
function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date2 = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date2.setUTCFullYear(d.y);
    return date2;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}
function newDate(y2, m, d) {
  return {
    y: y2,
    m,
    d,
    H: 0,
    M: 0,
    S: 0,
    L: 0
  };
}
function formatLocale(locale2) {
  var locale_dateTime = locale2.dateTime, locale_date = locale2.date, locale_time = locale2.time, locale_periods = locale2.periods, locale_weekdays = locale2.days, locale_shortWeekdays = locale2.shortDays, locale_months = locale2.months, locale_shortMonths = locale2.shortMonths;
  var periodRe = formatRe(locale_periods), periodLookup = formatLookup(locale_periods), weekdayRe = formatRe(locale_weekdays), weekdayLookup = formatLookup(locale_weekdays), shortWeekdayRe = formatRe(locale_shortWeekdays), shortWeekdayLookup = formatLookup(locale_shortWeekdays), monthRe = formatRe(locale_months), monthLookup = formatLookup(locale_months), shortMonthRe = formatRe(locale_shortMonths), shortMonthLookup = formatLookup(locale_shortMonths);
  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "f": formatMicroseconds,
    "g": formatYearISO,
    "G": formatFullYearISO,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "q": formatQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatSeconds,
    "u": formatWeekdayNumberMonday,
    "U": formatWeekNumberSunday,
    "V": formatWeekNumberISO,
    "w": formatWeekdayNumberSunday,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };
  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "f": formatUTCMicroseconds,
    "g": formatUTCYearISO,
    "G": formatUTCFullYearISO,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "q": formatUTCQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatUTCSeconds,
    "u": formatUTCWeekdayNumberMonday,
    "U": formatUTCWeekNumberSunday,
    "V": formatUTCWeekNumberISO,
    "w": formatUTCWeekdayNumberSunday,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };
  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "f": parseMicroseconds,
    "g": parseYear,
    "G": parseFullYear,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "q": parseQuarter,
    "Q": parseUnixTimestamp,
    "s": parseUnixTimestampSeconds,
    "S": parseSeconds,
    "u": parseWeekdayNumberMonday,
    "U": parseWeekNumberSunday,
    "V": parseWeekNumberISO,
    "w": parseWeekdayNumberSunday,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);
  function newFormat(specifier, formats2) {
    return function(date2) {
      var string2 = [], i = -1, j = 0, n = specifier.length, c6, pad2, format2;
      if (!(date2 instanceof Date)) date2 = /* @__PURE__ */ new Date(+date2);
      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string2.push(specifier.slice(j, i));
          if ((pad2 = pads[c6 = specifier.charAt(++i)]) != null) c6 = specifier.charAt(++i);
          else pad2 = c6 === "e" ? " " : "0";
          if (format2 = formats2[c6]) c6 = format2(date2, pad2);
          string2.push(c6);
          j = i + 1;
        }
      }
      string2.push(specifier.slice(j, i));
      return string2.join("");
    };
  }
  function newParse(specifier, Z) {
    return function(string2) {
      var d = newDate(1900, void 0, 1), i = parseSpecifier(d, specifier, string2 += "", 0), week2, day2;
      if (i != string2.length) return null;
      if ("Q" in d) return new Date(d.Q);
      if ("s" in d) return new Date(d.s * 1e3 + ("L" in d ? d.L : 0));
      if (Z && !("Z" in d)) d.Z = 0;
      if ("p" in d) d.H = d.H % 12 + d.p * 12;
      if (d.m === void 0) d.m = "q" in d ? d.q : 0;
      if ("V" in d) {
        if (d.V < 1 || d.V > 53) return null;
        if (!("w" in d)) d.w = 1;
        if ("Z" in d) {
          week2 = utcDate(newDate(d.y, 0, 1)), day2 = week2.getUTCDay();
          week2 = day2 > 4 || day2 === 0 ? _index$5.utcMonday.ceil(week2) : (0, _index$5.utcMonday)(week2);
          week2 = _index$5.utcDay.offset(week2, (d.V - 1) * 7);
          d.y = week2.getUTCFullYear();
          d.m = week2.getUTCMonth();
          d.d = week2.getUTCDate() + (d.w + 6) % 7;
        } else {
          week2 = localDate(newDate(d.y, 0, 1)), day2 = week2.getDay();
          week2 = day2 > 4 || day2 === 0 ? _index$5.timeMonday.ceil(week2) : (0, _index$5.timeMonday)(week2);
          week2 = _index$5.timeDay.offset(week2, (d.V - 1) * 7);
          d.y = week2.getFullYear();
          d.m = week2.getMonth();
          d.d = week2.getDate() + (d.w + 6) % 7;
        }
      } else if ("W" in d || "U" in d) {
        if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
        day2 = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day2 + 5) % 7 : d.w + d.U * 7 - (day2 + 6) % 7;
      }
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }
      return localDate(d);
    };
  }
  function parseSpecifier(d, specifier, string2, j) {
    var i = 0, n = specifier.length, m = string2.length, c6, parse2;
    while (i < n) {
      if (j >= m) return -1;
      c6 = specifier.charCodeAt(i++);
      if (c6 === 37) {
        c6 = specifier.charAt(i++);
        parse2 = parses[c6 in pads ? specifier.charAt(i++) : c6];
        if (!parse2 || (j = parse2(d, string2, j)) < 0) return -1;
      } else if (c6 != string2.charCodeAt(j++)) {
        return -1;
      }
    }
    return j;
  }
  function parsePeriod(d, string2, i) {
    var n = periodRe.exec(string2.slice(i));
    return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortWeekday(d, string2, i) {
    var n = shortWeekdayRe.exec(string2.slice(i));
    return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseWeekday(d, string2, i) {
    var n = weekdayRe.exec(string2.slice(i));
    return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortMonth(d, string2, i) {
    var n = shortMonthRe.exec(string2.slice(i));
    return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseMonth(d, string2, i) {
    var n = monthRe.exec(string2.slice(i));
    return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseLocaleDateTime(d, string2, i) {
    return parseSpecifier(d, locale_dateTime, string2, i);
  }
  function parseLocaleDate(d, string2, i) {
    return parseSpecifier(d, locale_date, string2, i);
  }
  function parseLocaleTime(d, string2, i) {
    return parseSpecifier(d, locale_time, string2, i);
  }
  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }
  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }
  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }
  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }
  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }
  function formatQuarter(d) {
    return 1 + ~~(d.getMonth() / 3);
  }
  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }
  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }
  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }
  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }
  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }
  function formatUTCQuarter(d) {
    return 1 + ~~(d.getUTCMonth() / 3);
  }
  return {
    format: function(specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    parse: function(specifier) {
      var p = newParse(specifier += "", false);
      p.toString = function() {
        return specifier;
      };
      return p;
    },
    utcFormat: function(specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function() {
        return specifier;
      };
      return f;
    },
    utcParse: function(specifier) {
      var p = newParse(specifier += "", true);
      p.toString = function() {
        return specifier;
      };
      return p;
    }
  };
}
var pads = {
  "-": "",
  "_": " ",
  "0": "0"
}, numberRe = /^\s*\d+/, percentRe = /^%/, requoteRe = /[\\^$*+?|[\]().{}]/g;
function pad(value2, fill, width) {
  var sign2 = value2 < 0 ? "-" : "", string2 = (sign2 ? -value2 : value2) + "", length2 = string2.length;
  return sign2 + (length2 < width ? new Array(width - length2 + 1).join(fill) + string2 : string2);
}
function requote(s2) {
  return s2.replace(requoteRe, "\\$&");
}
function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}
function formatLookup(names) {
  return new Map(names.map((name, i) => [name.toLowerCase(), i]));
}
function parseWeekdayNumberSunday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}
function parseWeekdayNumberMonday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 1));
  return n ? (d.u = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberSunday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberISO(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.V = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberMonday(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}
function parseFullYear(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}
function parseYear(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2e3), i + n[0].length) : -1;
}
function parseZone(d, string2, i) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string2.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}
function parseQuarter(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 1));
  return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
}
function parseMonthNumber(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}
function parseDayOfMonth(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}
function parseDayOfYear(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}
function parseHour24(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}
function parseMinutes(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}
function parseSeconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}
function parseMilliseconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}
function parseMicroseconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i, i + 6));
  return n ? (d.L = Math.floor(n[0] / 1e3), i + n[0].length) : -1;
}
function parseLiteralPercent(d, string2, i) {
  var n = percentRe.exec(string2.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}
function parseUnixTimestamp(d, string2, i) {
  var n = numberRe.exec(string2.slice(i));
  return n ? (d.Q = +n[0], i + n[0].length) : -1;
}
function parseUnixTimestampSeconds(d, string2, i) {
  var n = numberRe.exec(string2.slice(i));
  return n ? (d.s = +n[0], i + n[0].length) : -1;
}
function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}
function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}
function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}
function formatDayOfYear(d, p) {
  return pad(1 + _index$5.timeDay.count((0, _index$5.timeYear)(d), d), p, 3);
}
function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}
function formatMicroseconds(d, p) {
  return formatMilliseconds(d, p) + "000";
}
function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}
function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}
function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}
function formatWeekdayNumberMonday(d) {
  var day2 = d.getDay();
  return day2 === 0 ? 7 : day2;
}
function formatWeekNumberSunday(d, p) {
  return pad(_index$5.timeSunday.count((0, _index$5.timeYear)(d) - 1, d), p, 2);
}
function dISO(d) {
  var day2 = d.getDay();
  return day2 >= 4 || day2 === 0 ? (0, _index$5.timeThursday)(d) : _index$5.timeThursday.ceil(d);
}
function formatWeekNumberISO(d, p) {
  d = dISO(d);
  return pad(_index$5.timeThursday.count((0, _index$5.timeYear)(d), d) + ((0, _index$5.timeYear)(d).getDay() === 4), p, 2);
}
function formatWeekdayNumberSunday(d) {
  return d.getDay();
}
function formatWeekNumberMonday(d, p) {
  return pad(_index$5.timeMonday.count((0, _index$5.timeYear)(d) - 1, d), p, 2);
}
function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}
function formatYearISO(d, p) {
  d = dISO(d);
  return pad(d.getFullYear() % 100, p, 2);
}
function formatFullYear(d, p) {
  return pad(d.getFullYear() % 1e4, p, 4);
}
function formatFullYearISO(d, p) {
  var day2 = d.getDay();
  d = day2 >= 4 || day2 === 0 ? (0, _index$5.timeThursday)(d) : _index$5.timeThursday.ceil(d);
  return pad(d.getFullYear() % 1e4, p, 4);
}
function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+")) + pad(z / 60 | 0, "0", 2) + pad(z % 60, "0", 2);
}
function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}
function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}
function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}
function formatUTCDayOfYear(d, p) {
  return pad(1 + _index$5.utcDay.count((0, _index$5.utcYear)(d), d), p, 3);
}
function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}
function formatUTCMicroseconds(d, p) {
  return formatUTCMilliseconds(d, p) + "000";
}
function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}
function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}
function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}
function formatUTCWeekdayNumberMonday(d) {
  var dow = d.getUTCDay();
  return dow === 0 ? 7 : dow;
}
function formatUTCWeekNumberSunday(d, p) {
  return pad(_index$5.utcSunday.count((0, _index$5.utcYear)(d) - 1, d), p, 2);
}
function UTCdISO(d) {
  var day2 = d.getUTCDay();
  return day2 >= 4 || day2 === 0 ? (0, _index$5.utcThursday)(d) : _index$5.utcThursday.ceil(d);
}
function formatUTCWeekNumberISO(d, p) {
  d = UTCdISO(d);
  return pad(_index$5.utcThursday.count((0, _index$5.utcYear)(d), d) + ((0, _index$5.utcYear)(d).getUTCDay() === 4), p, 2);
}
function formatUTCWeekdayNumberSunday(d) {
  return d.getUTCDay();
}
function formatUTCWeekNumberMonday(d, p) {
  return pad(_index$5.utcMonday.count((0, _index$5.utcYear)(d) - 1, d), p, 2);
}
function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCYearISO(d, p) {
  d = UTCdISO(d);
  return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCFullYearISO(d, p) {
  var day2 = d.getUTCDay();
  d = day2 >= 4 || day2 === 0 ? (0, _index$5.utcThursday)(d) : _index$5.utcThursday.ceil(d);
  return pad(d.getUTCFullYear() % 1e4, p, 4);
}
function formatUTCZone() {
  return "+0000";
}
function formatLiteralPercent() {
  return "%";
}
function formatUnixTimestamp(d) {
  return +d;
}
function formatUnixTimestampSeconds(d) {
  return Math.floor(+d / 1e3);
}
Object.defineProperty(defaultLocale$1, "__esModule", {
  value: true
});
defaultLocale$1.default = defaultLocale;
defaultLocale$1.utcParse = defaultLocale$1.utcFormat = defaultLocale$1.timeParse = defaultLocale$1.timeFormat = void 0;
var _locale = _interopRequireDefault$f(locale$1);
function _interopRequireDefault$f(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var locale;
var timeFormat;
defaultLocale$1.timeFormat = timeFormat;
var timeParse;
defaultLocale$1.timeParse = timeParse;
var utcFormat;
defaultLocale$1.utcFormat = utcFormat;
var utcParse;
defaultLocale$1.utcParse = utcParse;
defaultLocale({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function defaultLocale(definition) {
  locale = (0, _locale.default)(definition);
  defaultLocale$1.timeFormat = timeFormat = locale.format;
  defaultLocale$1.timeParse = timeParse = locale.parse;
  defaultLocale$1.utcFormat = utcFormat = locale.utcFormat;
  defaultLocale$1.utcParse = utcParse = locale.utcParse;
  return locale;
}
var isoFormat = {};
Object.defineProperty(isoFormat, "__esModule", {
  value: true
});
isoFormat.isoSpecifier = isoFormat.default = void 0;
var _defaultLocale$1 = defaultLocale$1;
var isoSpecifier = "%Y-%m-%dT%H:%M:%S.%LZ";
isoFormat.isoSpecifier = isoSpecifier;
function formatIsoNative(date2) {
  return date2.toISOString();
}
var formatIso = Date.prototype.toISOString ? formatIsoNative : (0, _defaultLocale$1.utcFormat)(isoSpecifier);
var _default$6 = formatIso;
isoFormat.default = _default$6;
var isoParse = {};
Object.defineProperty(isoParse, "__esModule", {
  value: true
});
isoParse.default = void 0;
var _isoFormat = isoFormat;
var _defaultLocale = defaultLocale$1;
function parseIsoNative(string2) {
  var date2 = new Date(string2);
  return isNaN(date2) ? null : date2;
}
var parseIso = +/* @__PURE__ */ new Date("2000-01-01T00:00:00.000Z") ? parseIsoNative : (0, _defaultLocale.utcParse)(_isoFormat.isoSpecifier);
var _default$5 = parseIso;
isoParse.default = _default$5;
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "isoFormat", {
    enumerable: true,
    get: function() {
      return _isoFormat2.default;
    }
  });
  Object.defineProperty(exports, "isoParse", {
    enumerable: true,
    get: function() {
      return _isoParse.default;
    }
  });
  Object.defineProperty(exports, "timeFormat", {
    enumerable: true,
    get: function() {
      return _defaultLocale2.timeFormat;
    }
  });
  Object.defineProperty(exports, "timeFormatDefaultLocale", {
    enumerable: true,
    get: function() {
      return _defaultLocale2.default;
    }
  });
  Object.defineProperty(exports, "timeFormatLocale", {
    enumerable: true,
    get: function() {
      return _locale2.default;
    }
  });
  Object.defineProperty(exports, "timeParse", {
    enumerable: true,
    get: function() {
      return _defaultLocale2.timeParse;
    }
  });
  Object.defineProperty(exports, "utcFormat", {
    enumerable: true,
    get: function() {
      return _defaultLocale2.utcFormat;
    }
  });
  Object.defineProperty(exports, "utcParse", {
    enumerable: true,
    get: function() {
      return _defaultLocale2.utcParse;
    }
  });
  var _defaultLocale2 = _interopRequireWildcard2(defaultLocale$1);
  var _locale2 = _interopRequireDefault2(locale$1);
  var _isoFormat2 = _interopRequireDefault2(isoFormat);
  var _isoParse = _interopRequireDefault2(isoParse);
  function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _getRequireWildcardCache2(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache2 = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard2(obj, nodeInterop) {
    if (obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache2(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
})(src);
Object.defineProperty(time$1, "__esModule", {
  value: true
});
time$1.calendar = calendar;
time$1.default = time;
var _index$4 = src$1;
var _index2$1 = src;
var _continuous$3 = _interopRequireWildcard$1(continuous$1);
var _init$4 = init;
var _nice$1 = _interopRequireDefault$e(nice$2);
function _interopRequireDefault$e(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _getRequireWildcardCache$1(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache$1 = function(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard$1(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache$1(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function date(t) {
  return new Date(t);
}
function number$1(t) {
  return t instanceof Date ? +t : +/* @__PURE__ */ new Date(+t);
}
function calendar(ticks2, tickInterval, year2, month2, week2, day2, hour2, minute2, second2, format2) {
  var scale = (0, _continuous$3.default)(), invert = scale.invert, domain2 = scale.domain;
  var formatMillisecond = format2(".%L"), formatSecond = format2(":%S"), formatMinute = format2("%I:%M"), formatHour = format2("%I %p"), formatDay = format2("%a %d"), formatWeek = format2("%b %d"), formatMonth = format2("%B"), formatYear2 = format2("%Y");
  function tickFormat2(date2) {
    return (second2(date2) < date2 ? formatMillisecond : minute2(date2) < date2 ? formatSecond : hour2(date2) < date2 ? formatMinute : day2(date2) < date2 ? formatHour : month2(date2) < date2 ? week2(date2) < date2 ? formatDay : formatWeek : year2(date2) < date2 ? formatMonth : formatYear2)(date2);
  }
  scale.invert = function(y2) {
    return new Date(invert(y2));
  };
  scale.domain = function(_) {
    return arguments.length ? domain2(Array.from(_, number$1)) : domain2().map(date);
  };
  scale.ticks = function(interval2) {
    var d = domain2();
    return ticks2(d[0], d[d.length - 1], interval2 == null ? 10 : interval2);
  };
  scale.tickFormat = function(count2, specifier) {
    return specifier == null ? tickFormat2 : format2(specifier);
  };
  scale.nice = function(interval2) {
    var d = domain2();
    if (!interval2 || typeof interval2.range !== "function") interval2 = tickInterval(d[0], d[d.length - 1], interval2 == null ? 10 : interval2);
    return interval2 ? domain2((0, _nice$1.default)(d, interval2)) : scale;
  };
  scale.copy = function() {
    return (0, _continuous$3.copy)(scale, calendar(ticks2, tickInterval, year2, month2, week2, day2, hour2, minute2, second2, format2));
  };
  return scale;
}
function time() {
  return _init$4.initRange.apply(calendar(_index$4.timeTicks, _index$4.timeTickInterval, _index$4.timeYear, _index$4.timeMonth, _index$4.timeWeek, _index$4.timeDay, _index$4.timeHour, _index$4.timeMinute, _index$4.timeSecond, _index2$1.timeFormat).domain([new Date(2e3, 0, 1), new Date(2e3, 0, 2)]), arguments);
}
var utcTime$1 = {};
Object.defineProperty(utcTime$1, "__esModule", {
  value: true
});
utcTime$1.default = utcTime;
var _index$3 = src$1;
var _index2 = src;
var _time = time$1;
var _init$3 = init;
function utcTime() {
  return _init$3.initRange.apply((0, _time.calendar)(_index$3.utcTicks, _index$3.utcTickInterval, _index$3.utcYear, _index$3.utcMonth, _index$3.utcWeek, _index$3.utcDay, _index$3.utcHour, _index$3.utcMinute, _index$3.utcSecond, _index2.utcFormat).domain([Date.UTC(2e3, 0, 1), Date.UTC(2e3, 0, 2)]), arguments);
}
var sequential$1 = {};
Object.defineProperty(sequential$1, "__esModule", {
  value: true
});
sequential$1.copy = copy;
sequential$1.default = sequential;
sequential$1.sequentialLog = sequentialLog;
sequential$1.sequentialPow = sequentialPow;
sequential$1.sequentialSqrt = sequentialSqrt;
sequential$1.sequentialSymlog = sequentialSymlog;
var _index$2 = src$4;
var _continuous$2 = continuous$1;
var _init$2 = init;
var _linear$1 = linear$2;
var _log$1 = log$1;
var _symlog$1 = symlog$1;
var _pow$1 = pow$1;
function transformer$1() {
  var x0 = 0, x1 = 1, t02, t12, k10, transform2, interpolator = _continuous$2.identity, clamp2 = false, unknown2;
  function scale(x2) {
    return x2 == null || isNaN(x2 = +x2) ? unknown2 : interpolator(k10 === 0 ? 0.5 : (x2 = (transform2(x2) - t02) * k10, clamp2 ? Math.max(0, Math.min(1, x2)) : x2));
  }
  scale.domain = function(_) {
    return arguments.length ? ([x0, x1] = _, t02 = transform2(x0 = +x0), t12 = transform2(x1 = +x1), k10 = t02 === t12 ? 0 : 1 / (t12 - t02), scale) : [x0, x1];
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp2 = !!_, scale) : clamp2;
  };
  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };
  function range2(interpolate2) {
    return function(_) {
      var r0, r1;
      return arguments.length ? ([r0, r1] = _, interpolator = interpolate2(r0, r1), scale) : [interpolator(0), interpolator(1)];
    };
  }
  scale.range = range2(_index$2.interpolate);
  scale.rangeRound = range2(_index$2.interpolateRound);
  scale.unknown = function(_) {
    return arguments.length ? (unknown2 = _, scale) : unknown2;
  };
  return function(t) {
    transform2 = t, t02 = t(x0), t12 = t(x1), k10 = t02 === t12 ? 0 : 1 / (t12 - t02);
    return scale;
  };
}
function copy(source, target) {
  return target.domain(source.domain()).interpolator(source.interpolator()).clamp(source.clamp()).unknown(source.unknown());
}
function sequential() {
  var scale = (0, _linear$1.linearish)(transformer$1()(_continuous$2.identity));
  scale.copy = function() {
    return copy(scale, sequential());
  };
  return _init$2.initInterpolator.apply(scale, arguments);
}
function sequentialLog() {
  var scale = (0, _log$1.loggish)(transformer$1()).domain([1, 10]);
  scale.copy = function() {
    return copy(scale, sequentialLog()).base(scale.base());
  };
  return _init$2.initInterpolator.apply(scale, arguments);
}
function sequentialSymlog() {
  var scale = (0, _symlog$1.symlogish)(transformer$1());
  scale.copy = function() {
    return copy(scale, sequentialSymlog()).constant(scale.constant());
  };
  return _init$2.initInterpolator.apply(scale, arguments);
}
function sequentialPow() {
  var scale = (0, _pow$1.powish)(transformer$1());
  scale.copy = function() {
    return copy(scale, sequentialPow()).exponent(scale.exponent());
  };
  return _init$2.initInterpolator.apply(scale, arguments);
}
function sequentialSqrt() {
  return sequentialPow.apply(null, arguments).exponent(0.5);
}
var sequentialQuantile$1 = {};
Object.defineProperty(sequentialQuantile$1, "__esModule", {
  value: true
});
sequentialQuantile$1.default = sequentialQuantile;
var _index$1 = src$6;
var _continuous$1 = continuous$1;
var _init$1 = init;
function sequentialQuantile() {
  var domain2 = [], interpolator = _continuous$1.identity;
  function scale(x2) {
    if (x2 != null && !isNaN(x2 = +x2)) return interpolator(((0, _index$1.bisect)(domain2, x2, 1) - 1) / (domain2.length - 1));
  }
  scale.domain = function(_) {
    if (!arguments.length) return domain2.slice();
    domain2 = [];
    for (let d of _) if (d != null && !isNaN(d = +d)) domain2.push(d);
    domain2.sort(_index$1.ascending);
    return scale;
  };
  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };
  scale.range = function() {
    return domain2.map((d, i) => interpolator(i / (domain2.length - 1)));
  };
  scale.quantiles = function(n) {
    return Array.from({
      length: n + 1
    }, (_, i) => (0, _index$1.quantile)(domain2, i / n));
  };
  scale.copy = function() {
    return sequentialQuantile(interpolator).domain(domain2);
  };
  return _init$1.initInterpolator.apply(scale, arguments);
}
var diverging$1 = {};
Object.defineProperty(diverging$1, "__esModule", {
  value: true
});
diverging$1.default = diverging;
diverging$1.divergingLog = divergingLog;
diverging$1.divergingPow = divergingPow;
diverging$1.divergingSqrt = divergingSqrt;
diverging$1.divergingSymlog = divergingSymlog;
var _index = src$4;
var _continuous = continuous$1;
var _init = init;
var _linear = linear$2;
var _log = log$1;
var _sequential = sequential$1;
var _symlog = symlog$1;
var _pow = pow$1;
function transformer() {
  var x0 = 0, x1 = 0.5, x2 = 1, s2 = 1, t02, t12, t22, k10, k21, interpolator = _continuous.identity, transform2, clamp2 = false, unknown2;
  function scale(x3) {
    return isNaN(x3 = +x3) ? unknown2 : (x3 = 0.5 + ((x3 = +transform2(x3)) - t12) * (s2 * x3 < s2 * t12 ? k10 : k21), interpolator(clamp2 ? Math.max(0, Math.min(1, x3)) : x3));
  }
  scale.domain = function(_) {
    return arguments.length ? ([x0, x1, x2] = _, t02 = transform2(x0 = +x0), t12 = transform2(x1 = +x1), t22 = transform2(x2 = +x2), k10 = t02 === t12 ? 0 : 0.5 / (t12 - t02), k21 = t12 === t22 ? 0 : 0.5 / (t22 - t12), s2 = t12 < t02 ? -1 : 1, scale) : [x0, x1, x2];
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp2 = !!_, scale) : clamp2;
  };
  scale.interpolator = function(_) {
    return arguments.length ? (interpolator = _, scale) : interpolator;
  };
  function range2(interpolate2) {
    return function(_) {
      var r0, r1, r2;
      return arguments.length ? ([r0, r1, r2] = _, interpolator = (0, _index.piecewise)(interpolate2, [r0, r1, r2]), scale) : [interpolator(0), interpolator(0.5), interpolator(1)];
    };
  }
  scale.range = range2(_index.interpolate);
  scale.rangeRound = range2(_index.interpolateRound);
  scale.unknown = function(_) {
    return arguments.length ? (unknown2 = _, scale) : unknown2;
  };
  return function(t) {
    transform2 = t, t02 = t(x0), t12 = t(x1), t22 = t(x2), k10 = t02 === t12 ? 0 : 0.5 / (t12 - t02), k21 = t12 === t22 ? 0 : 0.5 / (t22 - t12), s2 = t12 < t02 ? -1 : 1;
    return scale;
  };
}
function diverging() {
  var scale = (0, _linear.linearish)(transformer()(_continuous.identity));
  scale.copy = function() {
    return (0, _sequential.copy)(scale, diverging());
  };
  return _init.initInterpolator.apply(scale, arguments);
}
function divergingLog() {
  var scale = (0, _log.loggish)(transformer()).domain([0.1, 1, 10]);
  scale.copy = function() {
    return (0, _sequential.copy)(scale, divergingLog()).base(scale.base());
  };
  return _init.initInterpolator.apply(scale, arguments);
}
function divergingSymlog() {
  var scale = (0, _symlog.symlogish)(transformer());
  scale.copy = function() {
    return (0, _sequential.copy)(scale, divergingSymlog()).constant(scale.constant());
  };
  return _init.initInterpolator.apply(scale, arguments);
}
function divergingPow() {
  var scale = (0, _pow.powish)(transformer());
  scale.copy = function() {
    return (0, _sequential.copy)(scale, divergingPow()).exponent(scale.exponent());
  };
  return _init.initInterpolator.apply(scale, arguments);
}
function divergingSqrt() {
  return divergingPow.apply(null, arguments).exponent(0.5);
}
(function(exports) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  Object.defineProperty(exports, "scaleBand", {
    enumerable: true,
    get: function() {
      return _band.default;
    }
  });
  Object.defineProperty(exports, "scaleDiverging", {
    enumerable: true,
    get: function() {
      return _diverging.default;
    }
  });
  Object.defineProperty(exports, "scaleDivergingLog", {
    enumerable: true,
    get: function() {
      return _diverging.divergingLog;
    }
  });
  Object.defineProperty(exports, "scaleDivergingPow", {
    enumerable: true,
    get: function() {
      return _diverging.divergingPow;
    }
  });
  Object.defineProperty(exports, "scaleDivergingSqrt", {
    enumerable: true,
    get: function() {
      return _diverging.divergingSqrt;
    }
  });
  Object.defineProperty(exports, "scaleDivergingSymlog", {
    enumerable: true,
    get: function() {
      return _diverging.divergingSymlog;
    }
  });
  Object.defineProperty(exports, "scaleIdentity", {
    enumerable: true,
    get: function() {
      return _identity2.default;
    }
  });
  Object.defineProperty(exports, "scaleImplicit", {
    enumerable: true,
    get: function() {
      return _ordinal2.implicit;
    }
  });
  Object.defineProperty(exports, "scaleLinear", {
    enumerable: true,
    get: function() {
      return _linear2.default;
    }
  });
  Object.defineProperty(exports, "scaleLog", {
    enumerable: true,
    get: function() {
      return _log2.default;
    }
  });
  Object.defineProperty(exports, "scaleOrdinal", {
    enumerable: true,
    get: function() {
      return _ordinal2.default;
    }
  });
  Object.defineProperty(exports, "scalePoint", {
    enumerable: true,
    get: function() {
      return _band.point;
    }
  });
  Object.defineProperty(exports, "scalePow", {
    enumerable: true,
    get: function() {
      return _pow2.default;
    }
  });
  Object.defineProperty(exports, "scaleQuantile", {
    enumerable: true,
    get: function() {
      return _quantile2.default;
    }
  });
  Object.defineProperty(exports, "scaleQuantize", {
    enumerable: true,
    get: function() {
      return _quantize.default;
    }
  });
  Object.defineProperty(exports, "scaleRadial", {
    enumerable: true,
    get: function() {
      return _radial.default;
    }
  });
  Object.defineProperty(exports, "scaleSequential", {
    enumerable: true,
    get: function() {
      return _sequential2.default;
    }
  });
  Object.defineProperty(exports, "scaleSequentialLog", {
    enumerable: true,
    get: function() {
      return _sequential2.sequentialLog;
    }
  });
  Object.defineProperty(exports, "scaleSequentialPow", {
    enumerable: true,
    get: function() {
      return _sequential2.sequentialPow;
    }
  });
  Object.defineProperty(exports, "scaleSequentialQuantile", {
    enumerable: true,
    get: function() {
      return _sequentialQuantile.default;
    }
  });
  Object.defineProperty(exports, "scaleSequentialSqrt", {
    enumerable: true,
    get: function() {
      return _sequential2.sequentialSqrt;
    }
  });
  Object.defineProperty(exports, "scaleSequentialSymlog", {
    enumerable: true,
    get: function() {
      return _sequential2.sequentialSymlog;
    }
  });
  Object.defineProperty(exports, "scaleSqrt", {
    enumerable: true,
    get: function() {
      return _pow2.sqrt;
    }
  });
  Object.defineProperty(exports, "scaleSymlog", {
    enumerable: true,
    get: function() {
      return _symlog2.default;
    }
  });
  Object.defineProperty(exports, "scaleThreshold", {
    enumerable: true,
    get: function() {
      return _threshold.default;
    }
  });
  Object.defineProperty(exports, "scaleTime", {
    enumerable: true,
    get: function() {
      return _time2.default;
    }
  });
  Object.defineProperty(exports, "scaleUtc", {
    enumerable: true,
    get: function() {
      return _utcTime.default;
    }
  });
  Object.defineProperty(exports, "tickFormat", {
    enumerable: true,
    get: function() {
      return _tickFormat2.default;
    }
  });
  var _band = _interopRequireWildcard2(band$1);
  var _identity2 = _interopRequireDefault2(identity$4);
  var _linear2 = _interopRequireDefault2(linear$2);
  var _log2 = _interopRequireDefault2(log$1);
  var _symlog2 = _interopRequireDefault2(symlog$1);
  var _ordinal2 = _interopRequireWildcard2(ordinal$1);
  var _pow2 = _interopRequireWildcard2(pow$1);
  var _radial = _interopRequireDefault2(radial$1);
  var _quantile2 = _interopRequireDefault2(quantile$1);
  var _quantize = _interopRequireDefault2(quantize$1);
  var _threshold = _interopRequireDefault2(threshold$1);
  var _time2 = _interopRequireDefault2(time$1);
  var _utcTime = _interopRequireDefault2(utcTime$1);
  var _sequential2 = _interopRequireWildcard2(sequential$1);
  var _sequentialQuantile = _interopRequireDefault2(sequentialQuantile$1);
  var _diverging = _interopRequireWildcard2(diverging$1);
  var _tickFormat2 = _interopRequireDefault2(tickFormat$1);
  function _interopRequireDefault2(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
  }
  function _getRequireWildcardCache2(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
    var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
    return (_getRequireWildcardCache2 = function(nodeInterop2) {
      return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
    })(nodeInterop);
  }
  function _interopRequireWildcard2(obj, nodeInterop) {
    if (obj && obj.__esModule) {
      return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
      return { default: obj };
    }
    var cache = _getRequireWildcardCache2(nodeInterop);
    if (cache && cache.has(obj)) {
      return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
      if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
        var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
        if (desc && (desc.get || desc.set)) {
          Object.defineProperty(newObj, key, desc);
        } else {
          newObj[key] = obj[key];
        }
      }
    }
    newObj.default = obj;
    if (cache) {
      cache.set(obj, newObj);
    }
    return newObj;
  }
})(src$7);
var d3Scale = src$7;
function applyDomain$1(scale, config2) {
  if (config2.domain) {
    if ("nice" in scale || "quantiles" in scale) {
      scale.domain(config2.domain);
    } else if ("padding" in scale) {
      scale.domain(config2.domain);
    } else {
      scale.domain(config2.domain);
    }
  }
}
function applyRange$1(scale, config2) {
  if (config2.range) {
    if ("padding" in scale) {
      scale.range(config2.range);
    } else {
      scale.range(config2.range);
    }
  }
}
function applyAlign$1(scale, config2) {
  if ("align" in scale && "align" in config2 && typeof config2.align !== "undefined") {
    scale.align(config2.align);
  }
}
function applyBase$1(scale, config2) {
  if ("base" in scale && "base" in config2 && typeof config2.base !== "undefined") {
    scale.base(config2.base);
  }
}
function applyClamp$1(scale, config2) {
  if ("clamp" in scale && "clamp" in config2 && typeof config2.clamp !== "undefined") {
    scale.clamp(config2.clamp);
  }
}
function applyConstant$1(scale, config2) {
  if ("constant" in scale && "constant" in config2 && typeof config2.constant !== "undefined") {
    scale.constant(config2.constant);
  }
}
function applyExponent$1(scale, config2) {
  if ("exponent" in scale && "exponent" in config2 && typeof config2.exponent !== "undefined") {
    scale.exponent(config2.exponent);
  }
}
var d3Interpolate = src$4;
var interpolatorMap$1 = {
  lab: d3Interpolate.interpolateLab,
  hcl: d3Interpolate.interpolateHcl,
  "hcl-long": d3Interpolate.interpolateHclLong,
  hsl: d3Interpolate.interpolateHsl,
  "hsl-long": d3Interpolate.interpolateHslLong,
  cubehelix: d3Interpolate.interpolateCubehelix,
  "cubehelix-long": d3Interpolate.interpolateCubehelixLong,
  rgb: d3Interpolate.interpolateRgb
};
function createColorInterpolator$2(interpolate2) {
  switch (interpolate2) {
    case "lab":
    case "hcl":
    case "hcl-long":
    case "hsl":
    case "hsl-long":
    case "cubehelix":
    case "cubehelix-long":
    case "rgb":
      return interpolatorMap$1[interpolate2];
  }
  var type = interpolate2.type, gamma2 = interpolate2.gamma;
  var interpolator = interpolatorMap$1[type];
  return typeof gamma2 === "undefined" ? interpolator : interpolator.gamma(gamma2);
}
function applyInterpolate$1(scale, config2) {
  if ("interpolate" in config2 && "interpolate" in scale && typeof config2.interpolate !== "undefined") {
    var interpolator = createColorInterpolator$2(config2.interpolate);
    scale.interpolate(interpolator);
  }
}
var d3Time = src$1;
var TEST_TIME$1 = new Date(Date.UTC(2020, 1, 2, 3, 4, 5));
var TEST_FORMAT$1 = "%Y-%m-%d %H:%M";
function isUtcScale$2(scale) {
  var output = scale.tickFormat(1, TEST_FORMAT$1)(TEST_TIME$1);
  return output === "2020-02-02 03:04";
}
var localTimeIntervals$1 = {
  day: d3Time.timeDay,
  hour: d3Time.timeHour,
  minute: d3Time.timeMinute,
  month: d3Time.timeMonth,
  second: d3Time.timeSecond,
  week: d3Time.timeWeek,
  year: d3Time.timeYear
};
var utcIntervals$1 = {
  day: d3Time.utcDay,
  hour: d3Time.utcHour,
  minute: d3Time.utcMinute,
  month: d3Time.utcMonth,
  second: d3Time.utcSecond,
  week: d3Time.utcWeek,
  year: d3Time.utcYear
};
function applyNice$1(scale, config2) {
  if ("nice" in config2 && typeof config2.nice !== "undefined" && "nice" in scale) {
    var nice2 = config2.nice;
    if (typeof nice2 === "boolean") {
      if (nice2) {
        scale.nice();
      }
    } else if (typeof nice2 === "number") {
      scale.nice(nice2);
    } else {
      var timeScale = scale;
      var isUtc = isUtcScale$2(timeScale);
      if (typeof nice2 === "string") {
        timeScale.nice(isUtc ? utcIntervals$1[nice2] : localTimeIntervals$1[nice2]);
      } else {
        var interval2 = nice2.interval, step2 = nice2.step;
        var parsedInterval = (isUtc ? utcIntervals$1[interval2] : localTimeIntervals$1[interval2]).every(step2);
        if (parsedInterval != null) {
          timeScale.nice(parsedInterval);
        }
      }
    }
  }
}
function applyPadding$1(scale, config2) {
  if ("padding" in scale && "padding" in config2 && typeof config2.padding !== "undefined") {
    scale.padding(config2.padding);
  }
  if ("paddingInner" in scale && "paddingInner" in config2 && typeof config2.paddingInner !== "undefined") {
    scale.paddingInner(config2.paddingInner);
  }
  if ("paddingOuter" in scale && "paddingOuter" in config2 && typeof config2.paddingOuter !== "undefined") {
    scale.paddingOuter(config2.paddingOuter);
  }
}
function applyReverse$1(scale, config2) {
  if (config2.reverse) {
    var reversedRange = scale.range().slice().reverse();
    if ("padding" in scale) {
      scale.range(reversedRange);
    } else {
      scale.range(reversedRange);
    }
  }
}
function applyRound$1(scale, config2) {
  if ("round" in config2 && typeof config2.round !== "undefined") {
    if (config2.round && "interpolate" in config2 && typeof config2.interpolate !== "undefined") {
      console.warn("[visx/scale/applyRound] ignoring round: scale config contains round and interpolate. only applying interpolate. config:", config2);
    } else if ("round" in scale) {
      scale.round(config2.round);
    } else if ("interpolate" in scale && config2.round) {
      scale.interpolate(d3Interpolate.interpolateRound);
    }
  }
}
function applyUnknown$1(scale, config2) {
  if ("unknown" in scale && "unknown" in config2 && typeof config2.unknown !== "undefined") {
    scale.unknown(config2.unknown);
  }
}
function applyZero$1(scale, config2) {
  if ("zero" in config2 && config2.zero === true) {
    var domain2 = scale.domain();
    var a2 = domain2[0], b = domain2[1];
    var isDescending = b < a2;
    var _ref = isDescending ? [b, a2] : [a2, b], min2 = _ref[0], max2 = _ref[1];
    var domainWithZero = [Math.min(0, min2), Math.max(0, max2)];
    scale.domain(isDescending ? domainWithZero.reverse() : domainWithZero);
  }
}
var ALL_OPERATORS$1 = [
  // domain => nice => zero
  "domain",
  "nice",
  "zero",
  // interpolate before round
  "interpolate",
  "round",
  // set range then reverse
  "range",
  "reverse",
  // Order does not matter for these operators
  "align",
  "base",
  "clamp",
  "constant",
  "exponent",
  "padding",
  "unknown"
];
var operators$1 = {
  domain: applyDomain$1,
  nice: applyNice$1,
  zero: applyZero$1,
  interpolate: applyInterpolate$1,
  round: applyRound$1,
  align: applyAlign$1,
  base: applyBase$1,
  clamp: applyClamp$1,
  constant: applyConstant$1,
  exponent: applyExponent$1,
  padding: applyPadding$1,
  range: applyRange$1,
  reverse: applyReverse$1,
  unknown: applyUnknown$1
};
function scaleOperator$2() {
  for (var _len = arguments.length, ops = new Array(_len), _key = 0; _key < _len; _key++) {
    ops[_key] = arguments[_key];
  }
  var selection = new Set(ops);
  var selectedOps = ALL_OPERATORS$1.filter(function(o) {
    return selection.has(o);
  });
  return function applyOperators(scale, config2) {
    if (typeof config2 !== "undefined") {
      selectedOps.forEach(function(op) {
        operators$1[op](scale, config2);
      });
    }
    return scale;
  };
}
var updateBandScale = scaleOperator$2("domain", "range", "reverse", "align", "padding", "round");
function createBandScale(config2) {
  return updateBandScale(d3Scale.scaleBand(), config2);
}
var updatePointScale = scaleOperator$2("domain", "range", "reverse", "align", "padding", "round");
function createPointScale(config2) {
  return updatePointScale(d3Scale.scalePoint(), config2);
}
var updateLinearScale = scaleOperator$2("domain", "range", "reverse", "clamp", "interpolate", "nice", "round", "zero");
function createLinearScale(config2) {
  return updateLinearScale(d3Scale.scaleLinear(), config2);
}
var updateRadialScale = scaleOperator$2("domain", "range", "clamp", "nice", "round", "unknown");
function createRadialScale(config2) {
  return updateRadialScale(d3Scale.scaleRadial(), config2);
}
var updateTimeScale = scaleOperator$2("domain", "range", "reverse", "clamp", "interpolate", "nice", "round");
function createTimeScale(config2) {
  return updateTimeScale(d3Scale.scaleTime(), config2);
}
var updateUtcScale = scaleOperator$2("domain", "range", "reverse", "clamp", "interpolate", "nice", "round");
function createUtcScale(config2) {
  return updateUtcScale(d3Scale.scaleUtc(), config2);
}
var updateLogScale = scaleOperator$2("domain", "range", "reverse", "base", "clamp", "interpolate", "nice", "round");
function createLogScale(config2) {
  return updateLogScale(d3Scale.scaleLog(), config2);
}
var updatePowScale = scaleOperator$2("domain", "range", "reverse", "clamp", "exponent", "interpolate", "nice", "round", "zero");
function createPowScale(config2) {
  return updatePowScale(d3Scale.scalePow(), config2);
}
var updateOrdinalScale$1 = scaleOperator$2("domain", "range", "reverse", "unknown");
function createOrdinalScale$1(config2) {
  return updateOrdinalScale$1(d3Scale.scaleOrdinal(), config2);
}
var updateQuantizeScale = scaleOperator$2("domain", "range", "reverse", "nice", "zero");
function createQuantizeScale(config2) {
  return updateQuantizeScale(d3Scale.scaleQuantize(), config2);
}
var updateQuantileScale = scaleOperator$2("domain", "range", "reverse");
function createQuantileScale(config2) {
  return updateQuantileScale(d3Scale.scaleQuantile(), config2);
}
var updateSymlogScale = scaleOperator$2("domain", "range", "reverse", "clamp", "constant", "nice", "zero", "round");
function createSymlogScale(config2) {
  return updateSymlogScale(d3Scale.scaleSymlog(), config2);
}
var updateThresholdScale = scaleOperator$2("domain", "range", "reverse");
function createThresholdScale(config2) {
  return updateThresholdScale(d3Scale.scaleThreshold(), config2);
}
var updateSqrtScale = scaleOperator$2("domain", "range", "reverse", "clamp", "interpolate", "nice", "round", "zero");
function createSqrtScale(config2) {
  return updateSqrtScale(d3Scale.scaleSqrt(), config2);
}
function createScale(config2) {
  if (typeof config2 !== "undefined" && "type" in config2) {
    switch (config2.type) {
      case "linear":
        return createLinearScale(config2);
      case "log":
        return createLogScale(config2);
      case "pow":
        return createPowScale(config2);
      case "sqrt":
        return createSqrtScale(config2);
      case "symlog":
        return createSymlogScale(config2);
      case "time":
        return createTimeScale(config2);
      case "utc":
        return createUtcScale(config2);
      case "quantile":
        return createQuantileScale(config2);
      case "quantize":
        return createQuantizeScale(config2);
      case "threshold":
        return createThresholdScale(config2);
      case "ordinal":
        return createOrdinalScale$1(config2);
      case "point":
        return createPointScale(config2);
      case "band":
        return createBandScale(config2);
    }
  }
  return createLinearScale(config2);
}
var applyAllOperators = scaleOperator$2.apply(void 0, ALL_OPERATORS$1);
function updateScale(scale, config2) {
  return applyAllOperators(scale.copy(), config2);
}
function inferScaleType(scale) {
  if ("paddingInner" in scale) {
    return "band";
  }
  if ("padding" in scale) {
    return "point";
  }
  if ("quantiles" in scale) {
    return "quantile";
  }
  if ("base" in scale) {
    return "log";
  }
  if ("exponent" in scale) {
    return scale.exponent() === 0.5 ? "sqrt" : "pow";
  }
  if ("constant" in scale) {
    return "symlog";
  }
  if ("clamp" in scale) {
    if (scale.ticks()[0] instanceof Date) {
      return isUtcScale$2(scale) ? "utc" : "time";
    }
    return "linear";
  }
  if ("nice" in scale) {
    return "quantize";
  }
  if ("invertExtent" in scale) {
    return "threshold";
  }
  return "ordinal";
}
function coerceNumber(val) {
  if ((typeof val === "function" || typeof val === "object" && !!val) && "valueOf" in val) {
    var num = val.valueOf();
    if (typeof num === "number") return num;
  }
  return val;
}
function getTicks(scale, numTicks) {
  var s2 = scale;
  if ("ticks" in s2) {
    return s2.ticks(numTicks);
  }
  return s2.domain().filter(function(_, index2, arr) {
    return numTicks == null || arr.length <= numTicks || index2 % Math.round((arr.length - 1) / numTicks) === 0;
  });
}
function toString(x2) {
  return x2 == null ? void 0 : x2.toString();
}
var zeroableScaleTypes = /* @__PURE__ */ new Set(["linear", "pow", "quantize", "sqrt", "symlog"]);
function scaleCanBeZeroed(scaleConfig) {
  return zeroableScaleTypes.has(scaleConfig.type);
}
const esm$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  coerceNumber,
  createScale,
  getTicks,
  inferScaleType,
  scaleBand: createBandScale,
  scaleCanBeZeroed,
  scaleLinear: createLinearScale,
  scaleLog: createLogScale,
  scaleOrdinal: createOrdinalScale$1,
  scalePoint: createPointScale,
  scalePower: createPowScale,
  scaleQuantile: createQuantileScale,
  scaleQuantize: createQuantizeScale,
  scaleRadial: createRadialScale,
  scaleSqrt: createSqrtScale,
  scaleSymlog: createSymlogScale,
  scaleThreshold: createThresholdScale,
  scaleTime: createTimeScale,
  scaleUtc: createUtcScale,
  toString,
  updateScale
}, Symbol.toStringTag, { value: "Module" }));
var DataContext = /* @__PURE__ */ React.createContext({});
function getScaleBandwidth(scale) {
  var _s$bandwidth;
  var s2 = scale;
  return s2 && "bandwidth" in s2 ? (_s$bandwidth = s2 == null ? void 0 : s2.bandwidth()) != null ? _s$bandwidth : 0 : 0;
}
function isValidNumber(_) {
  return _ != null && typeof _ === "number" && !Number.isNaN(_) && Number.isFinite(_);
}
var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var globals_exports = {};
__export(globals_exports, {
  assign: () => assign,
  colors: () => colors,
  createStringInterpolator: () => createStringInterpolator,
  skipAnimation: () => skipAnimation,
  to: () => to$1,
  willAdvance: () => willAdvance
});
var updateQueue = makeQueue();
var raf = (fn) => schedule(fn, updateQueue);
var writeQueue = makeQueue();
raf.write = (fn) => schedule(fn, writeQueue);
var onStartQueue = makeQueue();
raf.onStart = (fn) => schedule(fn, onStartQueue);
var onFrameQueue = makeQueue();
raf.onFrame = (fn) => schedule(fn, onFrameQueue);
var onFinishQueue = makeQueue();
raf.onFinish = (fn) => schedule(fn, onFinishQueue);
var timeouts = [];
raf.setTimeout = (handler, ms) => {
  const time2 = raf.now() + ms;
  const cancel = () => {
    const i = timeouts.findIndex((t) => t.cancel == cancel);
    if (~i)
      timeouts.splice(i, 1);
    pendingCount -= ~i ? 1 : 0;
  };
  const timeout = { time: time2, handler, cancel };
  timeouts.splice(findTimeout(time2), 0, timeout);
  pendingCount += 1;
  start();
  return timeout;
};
var findTimeout = (time2) => ~(~timeouts.findIndex((t) => t.time > time2) || ~timeouts.length);
raf.cancel = (fn) => {
  onStartQueue.delete(fn);
  onFrameQueue.delete(fn);
  onFinishQueue.delete(fn);
  updateQueue.delete(fn);
  writeQueue.delete(fn);
};
raf.sync = (fn) => {
  sync = true;
  raf.batchedUpdates(fn);
  sync = false;
};
raf.throttle = (fn) => {
  let lastArgs;
  function queuedFn() {
    try {
      fn(...lastArgs);
    } finally {
      lastArgs = null;
    }
  }
  function throttled(...args) {
    lastArgs = args;
    raf.onStart(queuedFn);
  }
  throttled.handler = fn;
  throttled.cancel = () => {
    onStartQueue.delete(queuedFn);
    lastArgs = null;
  };
  return throttled;
};
var nativeRaf = typeof window != "undefined" ? window.requestAnimationFrame : (
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  () => {
  }
);
raf.use = (impl) => nativeRaf = impl;
raf.now = typeof performance != "undefined" ? () => performance.now() : Date.now;
raf.batchedUpdates = (fn) => fn();
raf.catch = console.error;
raf.frameLoop = "always";
raf.advance = () => {
  if (raf.frameLoop !== "demand") {
    console.warn(
      "Cannot call the manual advancement of rafz whilst frameLoop is not set as demand"
    );
  } else {
    update$1();
  }
};
var ts = -1;
var pendingCount = 0;
var sync = false;
function schedule(fn, queue) {
  if (sync) {
    queue.delete(fn);
    fn(0);
  } else {
    queue.add(fn);
    start();
  }
}
function start() {
  if (ts < 0) {
    ts = 0;
    if (raf.frameLoop !== "demand") {
      nativeRaf(loop);
    }
  }
}
function stop() {
  ts = -1;
}
function loop() {
  if (~ts) {
    nativeRaf(loop);
    raf.batchedUpdates(update$1);
  }
}
function update$1() {
  const prevTs = ts;
  ts = raf.now();
  const count2 = findTimeout(ts);
  if (count2) {
    eachSafely(timeouts.splice(0, count2), (t) => t.handler());
    pendingCount -= count2;
  }
  if (!pendingCount) {
    stop();
    return;
  }
  onStartQueue.flush();
  updateQueue.flush(prevTs ? Math.min(64, ts - prevTs) : 16.667);
  onFrameQueue.flush();
  writeQueue.flush();
  onFinishQueue.flush();
}
function makeQueue() {
  let next = /* @__PURE__ */ new Set();
  let current = next;
  return {
    add(fn) {
      pendingCount += current == next && !next.has(fn) ? 1 : 0;
      next.add(fn);
    },
    delete(fn) {
      pendingCount -= current == next && next.has(fn) ? 1 : 0;
      return next.delete(fn);
    },
    flush(arg) {
      if (current.size) {
        next = /* @__PURE__ */ new Set();
        pendingCount -= current.size;
        eachSafely(current, (fn) => fn(arg) && next.add(fn));
        pendingCount += next.size;
        current = next;
      }
    }
  };
}
function eachSafely(values, each2) {
  values.forEach((value2) => {
    try {
      each2(value2);
    } catch (e) {
      raf.catch(e);
    }
  });
}
function noop() {
}
var defineHidden = (obj, key, value2) => Object.defineProperty(obj, key, { value: value2, writable: true, configurable: true });
var is = {
  arr: Array.isArray,
  obj: (a2) => !!a2 && a2.constructor.name === "Object",
  fun: (a2) => typeof a2 === "function",
  str: (a2) => typeof a2 === "string",
  num: (a2) => typeof a2 === "number",
  und: (a2) => a2 === void 0
};
function isEqual(a2, b) {
  if (is.arr(a2)) {
    if (!is.arr(b) || a2.length !== b.length)
      return false;
    for (let i = 0; i < a2.length; i++) {
      if (a2[i] !== b[i])
        return false;
    }
    return true;
  }
  return a2 === b;
}
var each = (obj, fn) => obj.forEach(fn);
function eachProp(obj, fn, ctx2) {
  if (is.arr(obj)) {
    for (let i = 0; i < obj.length; i++) {
      fn.call(ctx2, obj[i], `${i}`);
    }
    return;
  }
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn.call(ctx2, obj[key], key);
    }
  }
}
var toArray = (a2) => is.und(a2) ? [] : is.arr(a2) ? a2 : [a2];
function flush(queue, iterator) {
  if (queue.size) {
    const items = Array.from(queue);
    queue.clear();
    each(items, iterator);
  }
}
var flushCalls = (queue, ...args) => flush(queue, (fn) => fn(...args));
var isSSR = () => typeof window === "undefined" || !window.navigator || /ServerSideRendering|^Deno\//.test(window.navigator.userAgent);
var createStringInterpolator;
var to$1;
var colors = null;
var skipAnimation = false;
var willAdvance = noop;
var assign = (globals) => {
  if (globals.to)
    to$1 = globals.to;
  if (globals.now)
    raf.now = globals.now;
  if (globals.colors !== void 0)
    colors = globals.colors;
  if (globals.skipAnimation != null)
    skipAnimation = globals.skipAnimation;
  if (globals.createStringInterpolator)
    createStringInterpolator = globals.createStringInterpolator;
  if (globals.requestAnimationFrame)
    raf.use(globals.requestAnimationFrame);
  if (globals.batchedUpdates)
    raf.batchedUpdates = globals.batchedUpdates;
  if (globals.willAdvance)
    willAdvance = globals.willAdvance;
  if (globals.frameLoop)
    raf.frameLoop = globals.frameLoop;
};
var startQueue = /* @__PURE__ */ new Set();
var currentFrame = [];
var prevFrame = [];
var priority = 0;
var frameLoop = {
  get idle() {
    return !startQueue.size && !currentFrame.length;
  },
  /** Advance the given animation on every frame until idle. */
  start(animation) {
    if (priority > animation.priority) {
      startQueue.add(animation);
      raf.onStart(flushStartQueue);
    } else {
      startSafely(animation);
      raf(advance);
    }
  },
  /** Advance all animations by the given time. */
  advance,
  /** Call this when an animation's priority changes. */
  sort(animation) {
    if (priority) {
      raf.onFrame(() => frameLoop.sort(animation));
    } else {
      const prevIndex = currentFrame.indexOf(animation);
      if (~prevIndex) {
        currentFrame.splice(prevIndex, 1);
        startUnsafely(animation);
      }
    }
  },
  /**
   * Clear all animations. For testing purposes.
   *
   * ☠️ Never call this from within the frameloop.
   */
  clear() {
    currentFrame = [];
    startQueue.clear();
  }
};
function flushStartQueue() {
  startQueue.forEach(startSafely);
  startQueue.clear();
  raf(advance);
}
function startSafely(animation) {
  if (!currentFrame.includes(animation))
    startUnsafely(animation);
}
function startUnsafely(animation) {
  currentFrame.splice(
    findIndex(currentFrame, (other) => other.priority > animation.priority),
    0,
    animation
  );
}
function advance(dt) {
  const nextFrame = prevFrame;
  for (let i = 0; i < currentFrame.length; i++) {
    const animation = currentFrame[i];
    priority = animation.priority;
    if (!animation.idle) {
      willAdvance(animation);
      animation.advance(dt);
      if (!animation.idle) {
        nextFrame.push(animation);
      }
    }
  }
  priority = 0;
  prevFrame = currentFrame;
  prevFrame.length = 0;
  currentFrame = nextFrame;
  return currentFrame.length > 0;
}
function findIndex(arr, test) {
  const index2 = arr.findIndex(test);
  return index2 < 0 ? arr.length : index2;
}
var clamp$1 = (min2, max2, v) => Math.min(Math.max(v, min2), max2);
var colors2 = {
  transparent: 0,
  aliceblue: 4042850303,
  antiquewhite: 4209760255,
  aqua: 16777215,
  aquamarine: 2147472639,
  azure: 4043309055,
  beige: 4126530815,
  bisque: 4293182719,
  black: 255,
  blanchedalmond: 4293643775,
  blue: 65535,
  blueviolet: 2318131967,
  brown: 2771004159,
  burlywood: 3736635391,
  burntsienna: 3934150143,
  cadetblue: 1604231423,
  chartreuse: 2147418367,
  chocolate: 3530104575,
  coral: 4286533887,
  cornflowerblue: 1687547391,
  cornsilk: 4294499583,
  crimson: 3692313855,
  cyan: 16777215,
  darkblue: 35839,
  darkcyan: 9145343,
  darkgoldenrod: 3095792639,
  darkgray: 2846468607,
  darkgreen: 6553855,
  darkgrey: 2846468607,
  darkkhaki: 3182914559,
  darkmagenta: 2332068863,
  darkolivegreen: 1433087999,
  darkorange: 4287365375,
  darkorchid: 2570243327,
  darkred: 2332033279,
  darksalmon: 3918953215,
  darkseagreen: 2411499519,
  darkslateblue: 1211993087,
  darkslategray: 793726975,
  darkslategrey: 793726975,
  darkturquoise: 13554175,
  darkviolet: 2483082239,
  deeppink: 4279538687,
  deepskyblue: 12582911,
  dimgray: 1768516095,
  dimgrey: 1768516095,
  dodgerblue: 512819199,
  firebrick: 2988581631,
  floralwhite: 4294635775,
  forestgreen: 579543807,
  fuchsia: 4278255615,
  gainsboro: 3705462015,
  ghostwhite: 4177068031,
  gold: 4292280575,
  goldenrod: 3668254975,
  gray: 2155905279,
  green: 8388863,
  greenyellow: 2919182335,
  grey: 2155905279,
  honeydew: 4043305215,
  hotpink: 4285117695,
  indianred: 3445382399,
  indigo: 1258324735,
  ivory: 4294963455,
  khaki: 4041641215,
  lavender: 3873897215,
  lavenderblush: 4293981695,
  lawngreen: 2096890111,
  lemonchiffon: 4294626815,
  lightblue: 2916673279,
  lightcoral: 4034953471,
  lightcyan: 3774873599,
  lightgoldenrodyellow: 4210742015,
  lightgray: 3553874943,
  lightgreen: 2431553791,
  lightgrey: 3553874943,
  lightpink: 4290167295,
  lightsalmon: 4288707327,
  lightseagreen: 548580095,
  lightskyblue: 2278488831,
  lightslategray: 2005441023,
  lightslategrey: 2005441023,
  lightsteelblue: 2965692159,
  lightyellow: 4294959359,
  lime: 16711935,
  limegreen: 852308735,
  linen: 4210091775,
  magenta: 4278255615,
  maroon: 2147483903,
  mediumaquamarine: 1724754687,
  mediumblue: 52735,
  mediumorchid: 3126187007,
  mediumpurple: 2473647103,
  mediumseagreen: 1018393087,
  mediumslateblue: 2070474495,
  mediumspringgreen: 16423679,
  mediumturquoise: 1221709055,
  mediumvioletred: 3340076543,
  midnightblue: 421097727,
  mintcream: 4127193855,
  mistyrose: 4293190143,
  moccasin: 4293178879,
  navajowhite: 4292783615,
  navy: 33023,
  oldlace: 4260751103,
  olive: 2155872511,
  olivedrab: 1804477439,
  orange: 4289003775,
  orangered: 4282712319,
  orchid: 3664828159,
  palegoldenrod: 4008225535,
  palegreen: 2566625535,
  paleturquoise: 2951671551,
  palevioletred: 3681588223,
  papayawhip: 4293907967,
  peachpuff: 4292524543,
  peru: 3448061951,
  pink: 4290825215,
  plum: 3718307327,
  powderblue: 2967529215,
  purple: 2147516671,
  rebeccapurple: 1714657791,
  red: 4278190335,
  rosybrown: 3163525119,
  royalblue: 1097458175,
  saddlebrown: 2336560127,
  salmon: 4202722047,
  sandybrown: 4104413439,
  seagreen: 780883967,
  seashell: 4294307583,
  sienna: 2689740287,
  silver: 3233857791,
  skyblue: 2278484991,
  slateblue: 1784335871,
  slategray: 1887473919,
  slategrey: 1887473919,
  snow: 4294638335,
  springgreen: 16744447,
  steelblue: 1182971135,
  tan: 3535047935,
  teal: 8421631,
  thistle: 3636451583,
  tomato: 4284696575,
  turquoise: 1088475391,
  violet: 4001558271,
  wheat: 4125012991,
  white: 4294967295,
  whitesmoke: 4126537215,
  yellow: 4294902015,
  yellowgreen: 2597139199
};
var NUMBER = "[-+]?\\d*\\.?\\d+";
var PERCENTAGE = NUMBER + "%";
function call(...parts) {
  return "\\(\\s*(" + parts.join(")\\s*,\\s*(") + ")\\s*\\)";
}
var rgb = new RegExp("rgb" + call(NUMBER, NUMBER, NUMBER));
var rgba = new RegExp("rgba" + call(NUMBER, NUMBER, NUMBER, NUMBER));
var hsl = new RegExp("hsl" + call(NUMBER, PERCENTAGE, PERCENTAGE));
var hsla = new RegExp(
  "hsla" + call(NUMBER, PERCENTAGE, PERCENTAGE, NUMBER)
);
var hex3 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
var hex4 = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/;
var hex6 = /^#([0-9a-fA-F]{6})$/;
var hex8 = /^#([0-9a-fA-F]{8})$/;
function normalizeColor(color2) {
  let match2;
  if (typeof color2 === "number") {
    return color2 >>> 0 === color2 && color2 >= 0 && color2 <= 4294967295 ? color2 : null;
  }
  if (match2 = hex6.exec(color2))
    return parseInt(match2[1] + "ff", 16) >>> 0;
  if (colors && colors[color2] !== void 0) {
    return colors[color2];
  }
  if (match2 = rgb.exec(color2)) {
    return (parse255(match2[1]) << 24 | // r
    parse255(match2[2]) << 16 | // g
    parse255(match2[3]) << 8 | // b
    255) >>> // a
    0;
  }
  if (match2 = rgba.exec(color2)) {
    return (parse255(match2[1]) << 24 | // r
    parse255(match2[2]) << 16 | // g
    parse255(match2[3]) << 8 | // b
    parse1(match2[4])) >>> // a
    0;
  }
  if (match2 = hex3.exec(color2)) {
    return parseInt(
      match2[1] + match2[1] + // r
      match2[2] + match2[2] + // g
      match2[3] + match2[3] + // b
      "ff",
      // a
      16
    ) >>> 0;
  }
  if (match2 = hex8.exec(color2))
    return parseInt(match2[1], 16) >>> 0;
  if (match2 = hex4.exec(color2)) {
    return parseInt(
      match2[1] + match2[1] + // r
      match2[2] + match2[2] + // g
      match2[3] + match2[3] + // b
      match2[4] + match2[4],
      // a
      16
    ) >>> 0;
  }
  if (match2 = hsl.exec(color2)) {
    return (hslToRgb(
      parse360(match2[1]),
      // h
      parsePercentage(match2[2]),
      // s
      parsePercentage(match2[3])
      // l
    ) | 255) >>> // a
    0;
  }
  if (match2 = hsla.exec(color2)) {
    return (hslToRgb(
      parse360(match2[1]),
      // h
      parsePercentage(match2[2]),
      // s
      parsePercentage(match2[3])
      // l
    ) | parse1(match2[4])) >>> // a
    0;
  }
  return null;
}
function hue2rgb(p, q, t) {
  if (t < 0)
    t += 1;
  if (t > 1)
    t -= 1;
  if (t < 1 / 6)
    return p + (q - p) * 6 * t;
  if (t < 1 / 2)
    return q;
  if (t < 2 / 3)
    return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}
function hslToRgb(h, s2, l) {
  const q = l < 0.5 ? l * (1 + s2) : l + s2 - l * s2;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return Math.round(r * 255) << 24 | Math.round(g * 255) << 16 | Math.round(b * 255) << 8;
}
function parse255(str) {
  const int = parseInt(str, 10);
  if (int < 0)
    return 0;
  if (int > 255)
    return 255;
  return int;
}
function parse360(str) {
  const int = parseFloat(str);
  return (int % 360 + 360) % 360 / 360;
}
function parse1(str) {
  const num = parseFloat(str);
  if (num < 0)
    return 0;
  if (num > 1)
    return 255;
  return Math.round(num * 255);
}
function parsePercentage(str) {
  const int = parseFloat(str);
  if (int < 0)
    return 0;
  if (int > 100)
    return 1;
  return int / 100;
}
function colorToRgba(input) {
  let int32Color = normalizeColor(input);
  if (int32Color === null)
    return input;
  int32Color = int32Color || 0;
  const r = (int32Color & 4278190080) >>> 24;
  const g = (int32Color & 16711680) >>> 16;
  const b = (int32Color & 65280) >>> 8;
  const a2 = (int32Color & 255) / 255;
  return `rgba(${r}, ${g}, ${b}, ${a2})`;
}
var createInterpolator = (range2, output, extrapolate) => {
  if (is.fun(range2)) {
    return range2;
  }
  if (is.arr(range2)) {
    return createInterpolator({
      range: range2,
      output,
      extrapolate
    });
  }
  if (is.str(range2.output[0])) {
    return createStringInterpolator(range2);
  }
  const config2 = range2;
  const outputRange = config2.output;
  const inputRange = config2.range || [0, 1];
  const extrapolateLeft = config2.extrapolateLeft || config2.extrapolate || "extend";
  const extrapolateRight = config2.extrapolateRight || config2.extrapolate || "extend";
  const easing = config2.easing || ((t) => t);
  return (input) => {
    const range22 = findRange(input, inputRange);
    return interpolate$2(
      input,
      inputRange[range22],
      inputRange[range22 + 1],
      outputRange[range22],
      outputRange[range22 + 1],
      easing,
      extrapolateLeft,
      extrapolateRight,
      config2.map
    );
  };
};
function interpolate$2(input, inputMin, inputMax, outputMin, outputMax, easing, extrapolateLeft, extrapolateRight, map2) {
  let result = map2 ? map2(input) : input;
  if (result < inputMin) {
    if (extrapolateLeft === "identity")
      return result;
    else if (extrapolateLeft === "clamp")
      result = inputMin;
  }
  if (result > inputMax) {
    if (extrapolateRight === "identity")
      return result;
    else if (extrapolateRight === "clamp")
      result = inputMax;
  }
  if (outputMin === outputMax)
    return outputMin;
  if (inputMin === inputMax)
    return input <= inputMin ? outputMin : outputMax;
  if (inputMin === -Infinity)
    result = -result;
  else if (inputMax === Infinity)
    result = result - inputMin;
  else
    result = (result - inputMin) / (inputMax - inputMin);
  result = easing(result);
  if (outputMin === -Infinity)
    result = -result;
  else if (outputMax === Infinity)
    result = result + outputMin;
  else
    result = result * (outputMax - outputMin) + outputMin;
  return result;
}
function findRange(input, inputRange) {
  for (var i = 1; i < inputRange.length - 1; ++i)
    if (inputRange[i] >= input)
      break;
  return i - 1;
}
var steps = (steps2, direction = "end") => (progress2) => {
  progress2 = direction === "end" ? Math.min(progress2, 0.999) : Math.max(progress2, 1e-3);
  const expanded = progress2 * steps2;
  const rounded = direction === "end" ? Math.floor(expanded) : Math.ceil(expanded);
  return clamp$1(0, 1, rounded / steps2);
};
var c1 = 1.70158;
var c2 = c1 * 1.525;
var c3 = c1 + 1;
var c4 = 2 * Math.PI / 3;
var c5 = 2 * Math.PI / 4.5;
var bounceOut = (x2) => {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (x2 < 1 / d1) {
    return n1 * x2 * x2;
  } else if (x2 < 2 / d1) {
    return n1 * (x2 -= 1.5 / d1) * x2 + 0.75;
  } else if (x2 < 2.5 / d1) {
    return n1 * (x2 -= 2.25 / d1) * x2 + 0.9375;
  } else {
    return n1 * (x2 -= 2.625 / d1) * x2 + 0.984375;
  }
};
var easings = {
  linear: (x2) => x2,
  easeInQuad: (x2) => x2 * x2,
  easeOutQuad: (x2) => 1 - (1 - x2) * (1 - x2),
  easeInOutQuad: (x2) => x2 < 0.5 ? 2 * x2 * x2 : 1 - Math.pow(-2 * x2 + 2, 2) / 2,
  easeInCubic: (x2) => x2 * x2 * x2,
  easeOutCubic: (x2) => 1 - Math.pow(1 - x2, 3),
  easeInOutCubic: (x2) => x2 < 0.5 ? 4 * x2 * x2 * x2 : 1 - Math.pow(-2 * x2 + 2, 3) / 2,
  easeInQuart: (x2) => x2 * x2 * x2 * x2,
  easeOutQuart: (x2) => 1 - Math.pow(1 - x2, 4),
  easeInOutQuart: (x2) => x2 < 0.5 ? 8 * x2 * x2 * x2 * x2 : 1 - Math.pow(-2 * x2 + 2, 4) / 2,
  easeInQuint: (x2) => x2 * x2 * x2 * x2 * x2,
  easeOutQuint: (x2) => 1 - Math.pow(1 - x2, 5),
  easeInOutQuint: (x2) => x2 < 0.5 ? 16 * x2 * x2 * x2 * x2 * x2 : 1 - Math.pow(-2 * x2 + 2, 5) / 2,
  easeInSine: (x2) => 1 - Math.cos(x2 * Math.PI / 2),
  easeOutSine: (x2) => Math.sin(x2 * Math.PI / 2),
  easeInOutSine: (x2) => -(Math.cos(Math.PI * x2) - 1) / 2,
  easeInExpo: (x2) => x2 === 0 ? 0 : Math.pow(2, 10 * x2 - 10),
  easeOutExpo: (x2) => x2 === 1 ? 1 : 1 - Math.pow(2, -10 * x2),
  easeInOutExpo: (x2) => x2 === 0 ? 0 : x2 === 1 ? 1 : x2 < 0.5 ? Math.pow(2, 20 * x2 - 10) / 2 : (2 - Math.pow(2, -20 * x2 + 10)) / 2,
  easeInCirc: (x2) => 1 - Math.sqrt(1 - Math.pow(x2, 2)),
  easeOutCirc: (x2) => Math.sqrt(1 - Math.pow(x2 - 1, 2)),
  easeInOutCirc: (x2) => x2 < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * x2, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * x2 + 2, 2)) + 1) / 2,
  easeInBack: (x2) => c3 * x2 * x2 * x2 - c1 * x2 * x2,
  easeOutBack: (x2) => 1 + c3 * Math.pow(x2 - 1, 3) + c1 * Math.pow(x2 - 1, 2),
  easeInOutBack: (x2) => x2 < 0.5 ? Math.pow(2 * x2, 2) * ((c2 + 1) * 2 * x2 - c2) / 2 : (Math.pow(2 * x2 - 2, 2) * ((c2 + 1) * (x2 * 2 - 2) + c2) + 2) / 2,
  easeInElastic: (x2) => x2 === 0 ? 0 : x2 === 1 ? 1 : -Math.pow(2, 10 * x2 - 10) * Math.sin((x2 * 10 - 10.75) * c4),
  easeOutElastic: (x2) => x2 === 0 ? 0 : x2 === 1 ? 1 : Math.pow(2, -10 * x2) * Math.sin((x2 * 10 - 0.75) * c4) + 1,
  easeInOutElastic: (x2) => x2 === 0 ? 0 : x2 === 1 ? 1 : x2 < 0.5 ? -(Math.pow(2, 20 * x2 - 10) * Math.sin((20 * x2 - 11.125) * c5)) / 2 : Math.pow(2, -20 * x2 + 10) * Math.sin((20 * x2 - 11.125) * c5) / 2 + 1,
  easeInBounce: (x2) => 1 - bounceOut(1 - x2),
  easeOutBounce: bounceOut,
  easeInOutBounce: (x2) => x2 < 0.5 ? (1 - bounceOut(1 - 2 * x2)) / 2 : (1 + bounceOut(2 * x2 - 1)) / 2,
  steps
};
var $get = Symbol.for("FluidValue.get");
var $observers = Symbol.for("FluidValue.observers");
var hasFluidValue = (arg) => Boolean(arg && arg[$get]);
var getFluidValue = (arg) => arg && arg[$get] ? arg[$get]() : arg;
var getFluidObservers = (target) => target[$observers] || null;
function callFluidObserver(observer2, event) {
  if (observer2.eventObserved) {
    observer2.eventObserved(event);
  } else {
    observer2(event);
  }
}
function callFluidObservers(target, event) {
  const observers = target[$observers];
  if (observers) {
    observers.forEach((observer2) => {
      callFluidObserver(observer2, event);
    });
  }
}
var FluidValue = class {
  constructor(get) {
    if (!get && !(get = this.get)) {
      throw Error("Unknown getter");
    }
    setFluidGetter(this, get);
  }
};
var setFluidGetter = (target, get) => setHidden(target, $get, get);
function addFluidObserver(target, observer2) {
  if (target[$get]) {
    let observers = target[$observers];
    if (!observers) {
      setHidden(target, $observers, observers = /* @__PURE__ */ new Set());
    }
    if (!observers.has(observer2)) {
      observers.add(observer2);
      if (target.observerAdded) {
        target.observerAdded(observers.size, observer2);
      }
    }
  }
  return observer2;
}
function removeFluidObserver(target, observer2) {
  const observers = target[$observers];
  if (observers && observers.has(observer2)) {
    const count2 = observers.size - 1;
    if (count2) {
      observers.delete(observer2);
    } else {
      target[$observers] = null;
    }
    if (target.observerRemoved) {
      target.observerRemoved(count2, observer2);
    }
  }
}
var setHidden = (target, key, value2) => Object.defineProperty(target, key, {
  value: value2,
  writable: true,
  configurable: true
});
var numberRegex = /[+\-]?(?:0|[1-9]\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
var colorRegex = /(#(?:[0-9a-f]{2}){2,4}|(#[0-9a-f]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi;
var unitRegex = new RegExp(`(${numberRegex.source})(%|[a-z]+)`, "i");
var rgbaRegex = /rgba\(([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+), ([0-9\.-]+)\)/gi;
var cssVariableRegex = /var\((--[a-zA-Z0-9-_]+),? ?([a-zA-Z0-9 ()%#.,-]+)?\)/;
var variableToRgba = (input) => {
  const [token, fallback] = parseCSSVariable(input);
  if (!token || isSSR()) {
    return input;
  }
  const value2 = window.getComputedStyle(document.documentElement).getPropertyValue(token);
  if (value2) {
    return value2.trim();
  } else if (fallback && fallback.startsWith("--")) {
    const value22 = window.getComputedStyle(document.documentElement).getPropertyValue(fallback);
    if (value22) {
      return value22;
    } else {
      return input;
    }
  } else if (fallback && cssVariableRegex.test(fallback)) {
    return variableToRgba(fallback);
  } else if (fallback) {
    return fallback;
  }
  return input;
};
var parseCSSVariable = (current) => {
  const match2 = cssVariableRegex.exec(current);
  if (!match2)
    return [,];
  const [, token, fallback] = match2;
  return [token, fallback];
};
var namedColorRegex;
var rgbaRound = (_, p1, p2, p3, p4) => `rgba(${Math.round(p1)}, ${Math.round(p2)}, ${Math.round(p3)}, ${p4})`;
var createStringInterpolator2 = (config2) => {
  if (!namedColorRegex)
    namedColorRegex = colors ? (
      // match color names, ignore partial matches
      new RegExp(`(${Object.keys(colors).join("|")})(?!\\w)`, "g")
    ) : (
      // never match
      /^\b$/
    );
  const output = config2.output.map((value2) => {
    return getFluidValue(value2).replace(cssVariableRegex, variableToRgba).replace(colorRegex, colorToRgba).replace(namedColorRegex, colorToRgba);
  });
  const keyframes = output.map((value2) => value2.match(numberRegex).map(Number));
  const outputRanges = keyframes[0].map(
    (_, i) => keyframes.map((values) => {
      if (!(i in values)) {
        throw Error('The arity of each "output" value must be equal');
      }
      return values[i];
    })
  );
  const interpolators = outputRanges.map(
    (output2) => createInterpolator({ ...config2, output: output2 })
  );
  return (input) => {
    var _a;
    const missingUnit = !unitRegex.test(output[0]) && ((_a = output.find((value2) => unitRegex.test(value2))) == null ? void 0 : _a.replace(numberRegex, ""));
    let i = 0;
    return output[0].replace(
      numberRegex,
      () => `${interpolators[i++](input)}${missingUnit || ""}`
    ).replace(rgbaRegex, rgbaRound);
  };
};
var prefix = "react-spring: ";
var once = (fn) => {
  const func = fn;
  let called = false;
  if (typeof func != "function") {
    throw new TypeError(`${prefix}once requires a function parameter`);
  }
  return (...args) => {
    if (!called) {
      func(...args);
      called = true;
    }
  };
};
var warnInterpolate = once(console.warn);
function deprecateInterpolate() {
  warnInterpolate(
    `${prefix}The "interpolate" function is deprecated in v9 (use "to" instead)`
  );
}
var warnDirectCall = once(console.warn);
function deprecateDirectCall() {
  warnDirectCall(
    `${prefix}Directly calling start instead of using the api object is deprecated in v9 (use ".start" instead), this will be removed in later 0.X.0 versions`
  );
}
function isAnimatedString(value2) {
  return is.str(value2) && (value2[0] == "#" || /\d/.test(value2) || // Do not identify a CSS variable as an AnimatedString if its SSR
  !isSSR() && cssVariableRegex.test(value2) || value2 in (colors || {}));
}
var observer;
var resizeHandlers = /* @__PURE__ */ new WeakMap();
var handleObservation = (entries) => entries.forEach(({ target, contentRect }) => {
  var _a;
  return (_a = resizeHandlers.get(target)) == null ? void 0 : _a.forEach((handler) => handler(contentRect));
});
function resizeElement(handler, target) {
  if (!observer) {
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(handleObservation);
    }
  }
  let elementHandlers = resizeHandlers.get(target);
  if (!elementHandlers) {
    elementHandlers = /* @__PURE__ */ new Set();
    resizeHandlers.set(target, elementHandlers);
  }
  elementHandlers.add(handler);
  if (observer) {
    observer.observe(target);
  }
  return () => {
    const elementHandlers2 = resizeHandlers.get(target);
    if (!elementHandlers2)
      return;
    elementHandlers2.delete(handler);
    if (!elementHandlers2.size && observer) {
      observer.unobserve(target);
    }
  };
}
var listeners = /* @__PURE__ */ new Set();
var cleanupWindowResizeHandler;
var createResizeHandler = () => {
  const handleResize = () => {
    listeners.forEach(
      (callback) => callback({
        width: window.innerWidth,
        height: window.innerHeight
      })
    );
  };
  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
  };
};
var resizeWindow = (callback) => {
  listeners.add(callback);
  if (!cleanupWindowResizeHandler) {
    cleanupWindowResizeHandler = createResizeHandler();
  }
  return () => {
    listeners.delete(callback);
    if (!listeners.size && cleanupWindowResizeHandler) {
      cleanupWindowResizeHandler();
      cleanupWindowResizeHandler = void 0;
    }
  };
};
var onResize = (callback, { container = document.documentElement } = {}) => {
  if (container === document.documentElement) {
    return resizeWindow(callback);
  } else {
    return resizeElement(callback, container);
  }
};
var progress = (min2, max2, value2) => max2 - min2 === 0 ? 1 : (value2 - min2) / (max2 - min2);
var SCROLL_KEYS = {
  x: {
    length: "Width",
    position: "Left"
  },
  y: {
    length: "Height",
    position: "Top"
  }
};
var ScrollHandler = class {
  constructor(callback, container) {
    this.createAxis = () => ({
      current: 0,
      progress: 0,
      scrollLength: 0
    });
    this.updateAxis = (axisName) => {
      const axis = this.info[axisName];
      const { length: length2, position } = SCROLL_KEYS[axisName];
      axis.current = this.container[`scroll${position}`];
      axis.scrollLength = this.container["scroll" + length2] - this.container["client" + length2];
      axis.progress = progress(0, axis.scrollLength, axis.current);
    };
    this.update = () => {
      this.updateAxis("x");
      this.updateAxis("y");
    };
    this.sendEvent = () => {
      this.callback(this.info);
    };
    this.advance = () => {
      this.update();
      this.sendEvent();
    };
    this.callback = callback;
    this.container = container;
    this.info = {
      time: 0,
      x: this.createAxis(),
      y: this.createAxis()
    };
  }
};
var scrollListeners = /* @__PURE__ */ new WeakMap();
var resizeListeners = /* @__PURE__ */ new WeakMap();
var onScrollHandlers = /* @__PURE__ */ new WeakMap();
var getTarget$1 = (container) => container === document.documentElement ? window : container;
var onScroll = (callback, { container = document.documentElement } = {}) => {
  let containerHandlers = onScrollHandlers.get(container);
  if (!containerHandlers) {
    containerHandlers = /* @__PURE__ */ new Set();
    onScrollHandlers.set(container, containerHandlers);
  }
  const containerHandler = new ScrollHandler(callback, container);
  containerHandlers.add(containerHandler);
  if (!scrollListeners.has(container)) {
    const listener = () => {
      containerHandlers == null ? void 0 : containerHandlers.forEach((handler) => handler.advance());
      return true;
    };
    scrollListeners.set(container, listener);
    const target = getTarget$1(container);
    window.addEventListener("resize", listener, { passive: true });
    if (container !== document.documentElement) {
      resizeListeners.set(container, onResize(listener, { container }));
    }
    target.addEventListener("scroll", listener, { passive: true });
  }
  const animateScroll = scrollListeners.get(container);
  raf(animateScroll);
  return () => {
    var _a;
    raf.cancel(animateScroll);
    const containerHandlers2 = onScrollHandlers.get(container);
    if (!containerHandlers2)
      return;
    containerHandlers2.delete(containerHandler);
    if (containerHandlers2.size)
      return;
    const listener = scrollListeners.get(container);
    scrollListeners.delete(container);
    if (listener) {
      getTarget$1(container).removeEventListener("scroll", listener);
      window.removeEventListener("resize", listener);
      (_a = resizeListeners.get(container)) == null ? void 0 : _a();
    }
  };
};
function useConstant(init2) {
  const ref = reactExports.useRef(null);
  if (ref.current === null) {
    ref.current = init2();
  }
  return ref.current;
}
var useIsomorphicLayoutEffect = isSSR() ? reactExports.useEffect : reactExports.useLayoutEffect;
var useIsMounted = () => {
  const isMounted = reactExports.useRef(false);
  useIsomorphicLayoutEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  return isMounted;
};
function useForceUpdate() {
  const update2 = reactExports.useState()[1];
  const isMounted = useIsMounted();
  return () => {
    if (isMounted.current) {
      update2(Math.random());
    }
  };
}
function useMemoOne(getResult, inputs) {
  const [initial] = reactExports.useState(
    () => ({
      inputs,
      result: getResult()
    })
  );
  const committed = reactExports.useRef();
  const prevCache = committed.current;
  let cache = prevCache;
  if (cache) {
    const useCache = Boolean(
      inputs && cache.inputs && areInputsEqual(inputs, cache.inputs)
    );
    if (!useCache) {
      cache = {
        inputs,
        result: getResult()
      };
    }
  } else {
    cache = initial;
  }
  reactExports.useEffect(() => {
    committed.current = cache;
    if (prevCache == initial) {
      initial.inputs = initial.result = void 0;
    }
  }, [cache]);
  return cache.result;
}
function areInputsEqual(next, prev) {
  if (next.length !== prev.length) {
    return false;
  }
  for (let i = 0; i < next.length; i++) {
    if (next[i] !== prev[i]) {
      return false;
    }
  }
  return true;
}
var useOnce = (effect) => reactExports.useEffect(effect, emptyDeps);
var emptyDeps = [];
function usePrev(value2) {
  const prevRef = reactExports.useRef();
  reactExports.useEffect(() => {
    prevRef.current = value2;
  });
  return prevRef.current;
}
var useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = reactExports.useState(null);
  useIsomorphicLayoutEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion)");
    const handleMediaChange = (e) => {
      setReducedMotion(e.matches);
      assign({
        skipAnimation: e.matches
      });
    };
    handleMediaChange(mql);
    mql.addEventListener("change", handleMediaChange);
    return () => {
      mql.removeEventListener("change", handleMediaChange);
    };
  }, []);
  return reducedMotion;
};
const reactSpring_shared_modern = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  FluidValue,
  Globals: globals_exports,
  addFluidObserver,
  callFluidObserver,
  callFluidObservers,
  clamp: clamp$1,
  colorToRgba,
  colors: colors2,
  createInterpolator,
  createStringInterpolator: createStringInterpolator2,
  defineHidden,
  deprecateDirectCall,
  deprecateInterpolate,
  each,
  eachProp,
  easings,
  flush,
  flushCalls,
  frameLoop,
  getFluidObservers,
  getFluidValue,
  hasFluidValue,
  hex3,
  hex4,
  hex6,
  hex8,
  hsl,
  hsla,
  is,
  isAnimatedString,
  isEqual,
  isSSR,
  noop,
  onResize,
  onScroll,
  once,
  prefix,
  raf,
  removeFluidObserver,
  rgb,
  rgba,
  setFluidGetter,
  toArray,
  useConstant,
  useForceUpdate,
  useIsomorphicLayoutEffect,
  useMemoOne,
  useOnce,
  usePrev,
  useReducedMotion
}, Symbol.toStringTag, { value: "Module" }));
var $node = Symbol.for("Animated:node");
var isAnimated = (value2) => !!value2 && value2[$node] === value2;
var getAnimated = (owner) => owner && owner[$node];
var setAnimated = (owner, node) => defineHidden(owner, $node, node);
var getPayload = (owner) => owner && owner[$node] && owner[$node].getPayload();
var Animated = class {
  constructor() {
    setAnimated(this, this);
  }
  /** Get every `AnimatedValue` used by this node. */
  getPayload() {
    return this.payload || [];
  }
};
var AnimatedValue = class extends Animated {
  constructor(_value2) {
    super();
    this._value = _value2;
    this.done = true;
    this.durationProgress = 0;
    if (is.num(this._value)) {
      this.lastPosition = this._value;
    }
  }
  /** @internal */
  static create(value2) {
    return new AnimatedValue(value2);
  }
  getPayload() {
    return [this];
  }
  getValue() {
    return this._value;
  }
  setValue(value2, step2) {
    if (is.num(value2)) {
      this.lastPosition = value2;
      if (step2) {
        value2 = Math.round(value2 / step2) * step2;
        if (this.done) {
          this.lastPosition = value2;
        }
      }
    }
    if (this._value === value2) {
      return false;
    }
    this._value = value2;
    return true;
  }
  reset() {
    const { done } = this;
    this.done = false;
    if (is.num(this._value)) {
      this.elapsedTime = 0;
      this.durationProgress = 0;
      this.lastPosition = this._value;
      if (done)
        this.lastVelocity = null;
      this.v0 = null;
    }
  }
};
var AnimatedString = class extends AnimatedValue {
  constructor(value2) {
    super(0);
    this._string = null;
    this._toString = createInterpolator({
      output: [value2, value2]
    });
  }
  /** @internal */
  static create(value2) {
    return new AnimatedString(value2);
  }
  getValue() {
    const value2 = this._string;
    return value2 == null ? this._string = this._toString(this._value) : value2;
  }
  setValue(value2) {
    if (is.str(value2)) {
      if (value2 == this._string) {
        return false;
      }
      this._string = value2;
      this._value = 1;
    } else if (super.setValue(value2)) {
      this._string = null;
    } else {
      return false;
    }
    return true;
  }
  reset(goal) {
    if (goal) {
      this._toString = createInterpolator({
        output: [this.getValue(), goal]
      });
    }
    this._value = 0;
    super.reset();
  }
};
var TreeContext = { dependencies: null };
var AnimatedObject = class extends Animated {
  constructor(source) {
    super();
    this.source = source;
    this.setValue(source);
  }
  getValue(animated2) {
    const values = {};
    eachProp(this.source, (source, key) => {
      if (isAnimated(source)) {
        values[key] = source.getValue(animated2);
      } else if (hasFluidValue(source)) {
        values[key] = getFluidValue(source);
      } else if (!animated2) {
        values[key] = source;
      }
    });
    return values;
  }
  /** Replace the raw object data */
  setValue(source) {
    this.source = source;
    this.payload = this._makePayload(source);
  }
  reset() {
    if (this.payload) {
      each(this.payload, (node) => node.reset());
    }
  }
  /** Create a payload set. */
  _makePayload(source) {
    if (source) {
      const payload = /* @__PURE__ */ new Set();
      eachProp(source, this._addToPayload, payload);
      return Array.from(payload);
    }
  }
  /** Add to a payload set. */
  _addToPayload(source) {
    if (TreeContext.dependencies && hasFluidValue(source)) {
      TreeContext.dependencies.add(source);
    }
    const payload = getPayload(source);
    if (payload) {
      each(payload, (node) => this.add(node));
    }
  }
};
var AnimatedArray = class extends AnimatedObject {
  constructor(source) {
    super(source);
  }
  /** @internal */
  static create(source) {
    return new AnimatedArray(source);
  }
  getValue() {
    return this.source.map((node) => node.getValue());
  }
  setValue(source) {
    const payload = this.getPayload();
    if (source.length == payload.length) {
      return payload.map((node, i) => node.setValue(source[i])).some(Boolean);
    }
    super.setValue(source.map(makeAnimated));
    return true;
  }
};
function makeAnimated(value2) {
  const nodeType = isAnimatedString(value2) ? AnimatedString : AnimatedValue;
  return nodeType.create(value2);
}
function getAnimatedType(value2) {
  const parentNode = getAnimated(value2);
  return parentNode ? parentNode.constructor : is.arr(value2) ? AnimatedArray : isAnimatedString(value2) ? AnimatedString : AnimatedValue;
}
var withAnimated = (Component, host2) => {
  const hasInstance = (
    // Function components must use "forwardRef" to avoid being
    // re-rendered on every animation frame.
    !is.fun(Component) || Component.prototype && Component.prototype.isReactComponent
  );
  return reactExports.forwardRef((givenProps, givenRef) => {
    const instanceRef = reactExports.useRef(null);
    const ref = hasInstance && // eslint-disable-next-line react-hooks/rules-of-hooks
    reactExports.useCallback(
      (value2) => {
        instanceRef.current = updateRef(givenRef, value2);
      },
      [givenRef]
    );
    const [props, deps] = getAnimatedState(givenProps, host2);
    const forceUpdate = useForceUpdate();
    const callback = () => {
      const instance = instanceRef.current;
      if (hasInstance && !instance) {
        return;
      }
      const didUpdate = instance ? host2.applyAnimatedValues(instance, props.getValue(true)) : false;
      if (didUpdate === false) {
        forceUpdate();
      }
    };
    const observer2 = new PropsObserver(callback, deps);
    const observerRef = reactExports.useRef();
    useIsomorphicLayoutEffect(() => {
      observerRef.current = observer2;
      each(deps, (dep) => addFluidObserver(dep, observer2));
      return () => {
        if (observerRef.current) {
          each(
            observerRef.current.deps,
            (dep) => removeFluidObserver(dep, observerRef.current)
          );
          raf.cancel(observerRef.current.update);
        }
      };
    });
    reactExports.useEffect(callback, []);
    useOnce(() => () => {
      const observer22 = observerRef.current;
      each(observer22.deps, (dep) => removeFluidObserver(dep, observer22));
    });
    const usedProps = host2.getComponentProps(props.getValue());
    return /* @__PURE__ */ reactExports.createElement(Component, { ...usedProps, ref });
  });
};
var PropsObserver = class {
  constructor(update2, deps) {
    this.update = update2;
    this.deps = deps;
  }
  eventObserved(event) {
    if (event.type == "change") {
      raf.write(this.update);
    }
  }
};
function getAnimatedState(props, host2) {
  const dependencies = /* @__PURE__ */ new Set();
  TreeContext.dependencies = dependencies;
  if (props.style)
    props = {
      ...props,
      style: host2.createAnimatedStyle(props.style)
    };
  props = new AnimatedObject(props);
  TreeContext.dependencies = null;
  return [props, dependencies];
}
function updateRef(ref, value2) {
  if (ref) {
    if (is.fun(ref))
      ref(value2);
    else
      ref.current = value2;
  }
  return value2;
}
var cacheKey = Symbol.for("AnimatedComponent");
var createHost = (components, {
  applyAnimatedValues: applyAnimatedValues2 = () => false,
  createAnimatedStyle = (style) => new AnimatedObject(style),
  getComponentProps = (props) => props
} = {}) => {
  const hostConfig = {
    applyAnimatedValues: applyAnimatedValues2,
    createAnimatedStyle,
    getComponentProps
  };
  const animated2 = (Component) => {
    const displayName = getDisplayName(Component) || "Anonymous";
    if (is.str(Component)) {
      Component = animated2[Component] || (animated2[Component] = withAnimated(Component, hostConfig));
    } else {
      Component = Component[cacheKey] || (Component[cacheKey] = withAnimated(Component, hostConfig));
    }
    Component.displayName = `Animated(${displayName})`;
    return Component;
  };
  eachProp(components, (Component, key) => {
    if (is.arr(components)) {
      key = getDisplayName(Component);
    }
    animated2[key] = animated2(Component);
  });
  return {
    animated: animated2
  };
};
var getDisplayName = (arg) => is.str(arg) ? arg : arg && is.str(arg.displayName) ? arg.displayName : is.fun(arg) && arg.name || null;
const reactSpring_animated_modern = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Animated,
  AnimatedArray,
  AnimatedObject,
  AnimatedString,
  AnimatedValue,
  createHost,
  getAnimated,
  getAnimatedType,
  getPayload,
  isAnimated,
  setAnimated
}, Symbol.toStringTag, { value: "Module" }));
var Any = class {
};
function callProp(value2, ...args) {
  return is.fun(value2) ? value2(...args) : value2;
}
var matchProp = (value2, key) => value2 === true || !!(key && value2 && (is.fun(value2) ? value2(key) : toArray(value2).includes(key)));
var resolveProp = (prop, key) => is.obj(prop) ? key && prop[key] : prop;
var getDefaultProp = (props, key) => props.default === true ? props[key] : props.default ? props.default[key] : void 0;
var noopTransform = (value2) => value2;
var getDefaultProps = (props, transform2 = noopTransform) => {
  let keys = DEFAULT_PROPS;
  if (props.default && props.default !== true) {
    props = props.default;
    keys = Object.keys(props);
  }
  const defaults2 = {};
  for (const key of keys) {
    const value2 = transform2(props[key], key);
    if (!is.und(value2)) {
      defaults2[key] = value2;
    }
  }
  return defaults2;
};
var DEFAULT_PROPS = [
  "config",
  "onProps",
  "onStart",
  "onChange",
  "onPause",
  "onResume",
  "onRest"
];
var RESERVED_PROPS = {
  config: 1,
  from: 1,
  to: 1,
  ref: 1,
  loop: 1,
  reset: 1,
  pause: 1,
  cancel: 1,
  reverse: 1,
  immediate: 1,
  default: 1,
  delay: 1,
  onProps: 1,
  onStart: 1,
  onChange: 1,
  onPause: 1,
  onResume: 1,
  onRest: 1,
  onResolve: 1,
  // Transition props
  items: 1,
  trail: 1,
  sort: 1,
  expires: 1,
  initial: 1,
  enter: 1,
  update: 1,
  leave: 1,
  children: 1,
  onDestroyed: 1,
  // Internal props
  keys: 1,
  callId: 1,
  parentId: 1
};
function getForwardProps(props) {
  const forward = {};
  let count2 = 0;
  eachProp(props, (value2, prop) => {
    if (!RESERVED_PROPS[prop]) {
      forward[prop] = value2;
      count2++;
    }
  });
  if (count2) {
    return forward;
  }
}
function inferTo(props) {
  const to2 = getForwardProps(props);
  if (to2) {
    const out = { to: to2 };
    eachProp(props, (val, key) => key in to2 || (out[key] = val));
    return out;
  }
  return { ...props };
}
function computeGoal(value2) {
  value2 = getFluidValue(value2);
  return is.arr(value2) ? value2.map(computeGoal) : isAnimatedString(value2) ? globals_exports.createStringInterpolator({
    range: [0, 1],
    output: [value2, value2]
  })(1) : value2;
}
function hasProps(props) {
  for (const _ in props)
    return true;
  return false;
}
function isAsyncTo(to2) {
  return is.fun(to2) || is.arr(to2) && is.obj(to2[0]);
}
function detachRefs(ctrl, ref) {
  var _a;
  (_a = ctrl.ref) == null ? void 0 : _a.delete(ctrl);
  ref == null ? void 0 : ref.delete(ctrl);
}
function replaceRef(ctrl, ref) {
  var _a;
  if (ref && ctrl.ref !== ref) {
    (_a = ctrl.ref) == null ? void 0 : _a.delete(ctrl);
    ref.add(ctrl);
    ctrl.ref = ref;
  }
}
function useChain(refs, timeSteps, timeFrame = 1e3) {
  useIsomorphicLayoutEffect(() => {
    if (timeSteps) {
      let prevDelay = 0;
      each(refs, (ref, i) => {
        const controllers = ref.current;
        if (controllers.length) {
          let delay = timeFrame * timeSteps[i];
          if (isNaN(delay))
            delay = prevDelay;
          else
            prevDelay = delay;
          each(controllers, (ctrl) => {
            each(ctrl.queue, (props) => {
              const memoizedDelayProp = props.delay;
              props.delay = (key) => delay + callProp(memoizedDelayProp || 0, key);
            });
          });
          ref.start();
        }
      });
    } else {
      let p = Promise.resolve();
      each(refs, (ref) => {
        const controllers = ref.current;
        if (controllers.length) {
          const queues = controllers.map((ctrl) => {
            const q = ctrl.queue;
            ctrl.queue = [];
            return q;
          });
          p = p.then(() => {
            each(
              controllers,
              (ctrl, i) => each(queues[i] || [], (update2) => ctrl.queue.push(update2))
            );
            return Promise.all(ref.start());
          });
        }
      });
    }
  });
}
var config = {
  default: { tension: 170, friction: 26 },
  gentle: { tension: 120, friction: 14 },
  wobbly: { tension: 180, friction: 12 },
  stiff: { tension: 210, friction: 20 },
  slow: { tension: 280, friction: 60 },
  molasses: { tension: 280, friction: 120 }
};
var defaults = {
  ...config.default,
  mass: 1,
  damping: 1,
  easing: easings.linear,
  clamp: false
};
var AnimationConfig = class {
  constructor() {
    this.velocity = 0;
    Object.assign(this, defaults);
  }
};
function mergeConfig(config2, newConfig, defaultConfig) {
  if (defaultConfig) {
    defaultConfig = { ...defaultConfig };
    sanitizeConfig(defaultConfig, newConfig);
    newConfig = { ...defaultConfig, ...newConfig };
  }
  sanitizeConfig(config2, newConfig);
  Object.assign(config2, newConfig);
  for (const key in defaults) {
    if (config2[key] == null) {
      config2[key] = defaults[key];
    }
  }
  let { frequency, damping } = config2;
  const { mass } = config2;
  if (!is.und(frequency)) {
    if (frequency < 0.01)
      frequency = 0.01;
    if (damping < 0)
      damping = 0;
    config2.tension = Math.pow(2 * Math.PI / frequency, 2) * mass;
    config2.friction = 4 * Math.PI * damping * mass / frequency;
  }
  return config2;
}
function sanitizeConfig(config2, props) {
  if (!is.und(props.decay)) {
    config2.duration = void 0;
  } else {
    const isTensionConfig = !is.und(props.tension) || !is.und(props.friction);
    if (isTensionConfig || !is.und(props.frequency) || !is.und(props.damping) || !is.und(props.mass)) {
      config2.duration = void 0;
      config2.decay = void 0;
    }
    if (isTensionConfig) {
      config2.frequency = void 0;
    }
  }
}
var emptyArray = [];
var Animation = class {
  constructor() {
    this.changed = false;
    this.values = emptyArray;
    this.toValues = null;
    this.fromValues = emptyArray;
    this.config = new AnimationConfig();
    this.immediate = false;
  }
};
function scheduleProps(callId, { key, props, defaultProps, state, actions }) {
  return new Promise((resolve, reject) => {
    let delay;
    let timeout;
    let cancel = matchProp(props.cancel ?? (defaultProps == null ? void 0 : defaultProps.cancel), key);
    if (cancel) {
      onStart();
    } else {
      if (!is.und(props.pause)) {
        state.paused = matchProp(props.pause, key);
      }
      let pause = defaultProps == null ? void 0 : defaultProps.pause;
      if (pause !== true) {
        pause = state.paused || matchProp(pause, key);
      }
      delay = callProp(props.delay || 0, key);
      if (pause) {
        state.resumeQueue.add(onResume);
        actions.pause();
      } else {
        actions.resume();
        onResume();
      }
    }
    function onPause() {
      state.resumeQueue.add(onResume);
      state.timeouts.delete(timeout);
      timeout.cancel();
      delay = timeout.time - raf.now();
    }
    function onResume() {
      if (delay > 0 && !globals_exports.skipAnimation) {
        state.delayed = true;
        timeout = raf.setTimeout(onStart, delay);
        state.pauseQueue.add(onPause);
        state.timeouts.add(timeout);
      } else {
        onStart();
      }
    }
    function onStart() {
      if (state.delayed) {
        state.delayed = false;
      }
      state.pauseQueue.delete(onPause);
      state.timeouts.delete(timeout);
      if (callId <= (state.cancelId || 0)) {
        cancel = true;
      }
      try {
        actions.start({ ...props, callId, cancel }, resolve);
      } catch (err) {
        reject(err);
      }
    }
  });
}
var getCombinedResult = (target, results) => results.length == 1 ? results[0] : results.some((result) => result.cancelled) ? getCancelledResult(target.get()) : results.every((result) => result.noop) ? getNoopResult(target.get()) : getFinishedResult(
  target.get(),
  results.every((result) => result.finished)
);
var getNoopResult = (value2) => ({
  value: value2,
  noop: true,
  finished: true,
  cancelled: false
});
var getFinishedResult = (value2, finished, cancelled = false) => ({
  value: value2,
  finished,
  cancelled
});
var getCancelledResult = (value2) => ({
  value: value2,
  cancelled: true,
  finished: false
});
function runAsync(to2, props, state, target) {
  const { callId, parentId, onRest } = props;
  const { asyncTo: prevTo, promise: prevPromise } = state;
  if (!parentId && to2 === prevTo && !props.reset) {
    return prevPromise;
  }
  return state.promise = (async () => {
    state.asyncId = callId;
    state.asyncTo = to2;
    const defaultProps = getDefaultProps(
      props,
      (value2, key) => (
        // The `onRest` prop is only called when the `runAsync` promise is resolved.
        key === "onRest" ? void 0 : value2
      )
    );
    let preventBail;
    let bail;
    const bailPromise = new Promise(
      (resolve, reject) => (preventBail = resolve, bail = reject)
    );
    const bailIfEnded = (bailSignal) => {
      const bailResult = (
        // The `cancel` prop or `stop` method was used.
        callId <= (state.cancelId || 0) && getCancelledResult(target) || // The async `to` prop was replaced.
        callId !== state.asyncId && getFinishedResult(target, false)
      );
      if (bailResult) {
        bailSignal.result = bailResult;
        bail(bailSignal);
        throw bailSignal;
      }
    };
    const animate = (arg1, arg2) => {
      const bailSignal = new BailSignal();
      const skipAnimationSignal = new SkipAnimationSignal();
      return (async () => {
        if (globals_exports.skipAnimation) {
          stopAsync(state);
          skipAnimationSignal.result = getFinishedResult(target, false);
          bail(skipAnimationSignal);
          throw skipAnimationSignal;
        }
        bailIfEnded(bailSignal);
        const props2 = is.obj(arg1) ? { ...arg1 } : { ...arg2, to: arg1 };
        props2.parentId = callId;
        eachProp(defaultProps, (value2, key) => {
          if (is.und(props2[key])) {
            props2[key] = value2;
          }
        });
        const result2 = await target.start(props2);
        bailIfEnded(bailSignal);
        if (state.paused) {
          await new Promise((resume) => {
            state.resumeQueue.add(resume);
          });
        }
        return result2;
      })();
    };
    let result;
    if (globals_exports.skipAnimation) {
      stopAsync(state);
      return getFinishedResult(target, false);
    }
    try {
      let animating;
      if (is.arr(to2)) {
        animating = (async (queue) => {
          for (const props2 of queue) {
            await animate(props2);
          }
        })(to2);
      } else {
        animating = Promise.resolve(to2(animate, target.stop.bind(target)));
      }
      await Promise.all([animating.then(preventBail), bailPromise]);
      result = getFinishedResult(target.get(), true, false);
    } catch (err) {
      if (err instanceof BailSignal) {
        result = err.result;
      } else if (err instanceof SkipAnimationSignal) {
        result = err.result;
      } else {
        throw err;
      }
    } finally {
      if (callId == state.asyncId) {
        state.asyncId = parentId;
        state.asyncTo = parentId ? prevTo : void 0;
        state.promise = parentId ? prevPromise : void 0;
      }
    }
    if (is.fun(onRest)) {
      raf.batchedUpdates(() => {
        onRest(result, target, target.item);
      });
    }
    return result;
  })();
}
function stopAsync(state, cancelId) {
  flush(state.timeouts, (t) => t.cancel());
  state.pauseQueue.clear();
  state.resumeQueue.clear();
  state.asyncId = state.asyncTo = state.promise = void 0;
  if (cancelId)
    state.cancelId = cancelId;
}
var BailSignal = class extends Error {
  constructor() {
    super(
      "An async animation has been interrupted. You see this error because you forgot to use `await` or `.catch(...)` on its returned promise."
    );
  }
};
var SkipAnimationSignal = class extends Error {
  constructor() {
    super("SkipAnimationSignal");
  }
};
var isFrameValue = (value2) => value2 instanceof FrameValue;
var nextId = 1;
var FrameValue = class extends FluidValue {
  constructor() {
    super(...arguments);
    this.id = nextId++;
    this._priority = 0;
  }
  get priority() {
    return this._priority;
  }
  set priority(priority2) {
    if (this._priority != priority2) {
      this._priority = priority2;
      this._onPriorityChange(priority2);
    }
  }
  /** Get the current value */
  get() {
    const node = getAnimated(this);
    return node && node.getValue();
  }
  /** Create a spring that maps our value to another value */
  to(...args) {
    return globals_exports.to(this, args);
  }
  /** @deprecated Use the `to` method instead. */
  interpolate(...args) {
    deprecateInterpolate();
    return globals_exports.to(this, args);
  }
  toJSON() {
    return this.get();
  }
  observerAdded(count2) {
    if (count2 == 1)
      this._attach();
  }
  observerRemoved(count2) {
    if (count2 == 0)
      this._detach();
  }
  /** Called when the first child is added. */
  _attach() {
  }
  /** Called when the last child is removed. */
  _detach() {
  }
  /** Tell our children about our new value */
  _onChange(value2, idle = false) {
    callFluidObservers(this, {
      type: "change",
      parent: this,
      value: value2,
      idle
    });
  }
  /** Tell our children about our new priority */
  _onPriorityChange(priority2) {
    if (!this.idle) {
      frameLoop.sort(this);
    }
    callFluidObservers(this, {
      type: "priority",
      parent: this,
      priority: priority2
    });
  }
};
var $P = Symbol.for("SpringPhase");
var HAS_ANIMATED = 1;
var IS_ANIMATING = 2;
var IS_PAUSED = 4;
var hasAnimated = (target) => (target[$P] & HAS_ANIMATED) > 0;
var isAnimating = (target) => (target[$P] & IS_ANIMATING) > 0;
var isPaused = (target) => (target[$P] & IS_PAUSED) > 0;
var setActiveBit = (target, active) => active ? target[$P] |= IS_ANIMATING | HAS_ANIMATED : target[$P] &= ~IS_ANIMATING;
var setPausedBit = (target, paused) => paused ? target[$P] |= IS_PAUSED : target[$P] &= ~IS_PAUSED;
var SpringValue = class extends FrameValue {
  constructor(arg1, arg2) {
    super();
    this.animation = new Animation();
    this.defaultProps = {};
    this._state = {
      paused: false,
      delayed: false,
      pauseQueue: /* @__PURE__ */ new Set(),
      resumeQueue: /* @__PURE__ */ new Set(),
      timeouts: /* @__PURE__ */ new Set()
    };
    this._pendingCalls = /* @__PURE__ */ new Set();
    this._lastCallId = 0;
    this._lastToId = 0;
    this._memoizedDuration = 0;
    if (!is.und(arg1) || !is.und(arg2)) {
      const props = is.obj(arg1) ? { ...arg1 } : { ...arg2, from: arg1 };
      if (is.und(props.default)) {
        props.default = true;
      }
      this.start(props);
    }
  }
  /** Equals true when not advancing on each frame. */
  get idle() {
    return !(isAnimating(this) || this._state.asyncTo) || isPaused(this);
  }
  get goal() {
    return getFluidValue(this.animation.to);
  }
  get velocity() {
    const node = getAnimated(this);
    return node instanceof AnimatedValue ? node.lastVelocity || 0 : node.getPayload().map((node2) => node2.lastVelocity || 0);
  }
  /**
   * When true, this value has been animated at least once.
   */
  get hasAnimated() {
    return hasAnimated(this);
  }
  /**
   * When true, this value has an unfinished animation,
   * which is either active or paused.
   */
  get isAnimating() {
    return isAnimating(this);
  }
  /**
   * When true, all current and future animations are paused.
   */
  get isPaused() {
    return isPaused(this);
  }
  /**
   *
   *
   */
  get isDelayed() {
    return this._state.delayed;
  }
  /** Advance the current animation by a number of milliseconds */
  advance(dt) {
    let idle = true;
    let changed = false;
    const anim = this.animation;
    let { toValues } = anim;
    const { config: config2 } = anim;
    const payload = getPayload(anim.to);
    if (!payload && hasFluidValue(anim.to)) {
      toValues = toArray(getFluidValue(anim.to));
    }
    anim.values.forEach((node2, i) => {
      if (node2.done)
        return;
      const to2 = (
        // Animated strings always go from 0 to 1.
        node2.constructor == AnimatedString ? 1 : payload ? payload[i].lastPosition : toValues[i]
      );
      let finished = anim.immediate;
      let position = to2;
      if (!finished) {
        position = node2.lastPosition;
        if (config2.tension <= 0) {
          node2.done = true;
          return;
        }
        let elapsed = node2.elapsedTime += dt;
        const from = anim.fromValues[i];
        const v0 = node2.v0 != null ? node2.v0 : node2.v0 = is.arr(config2.velocity) ? config2.velocity[i] : config2.velocity;
        let velocity;
        const precision = config2.precision || (from == to2 ? 5e-3 : Math.min(1, Math.abs(to2 - from) * 1e-3));
        if (!is.und(config2.duration)) {
          let p = 1;
          if (config2.duration > 0) {
            if (this._memoizedDuration !== config2.duration) {
              this._memoizedDuration = config2.duration;
              if (node2.durationProgress > 0) {
                node2.elapsedTime = config2.duration * node2.durationProgress;
                elapsed = node2.elapsedTime += dt;
              }
            }
            p = (config2.progress || 0) + elapsed / this._memoizedDuration;
            p = p > 1 ? 1 : p < 0 ? 0 : p;
            node2.durationProgress = p;
          }
          position = from + config2.easing(p) * (to2 - from);
          velocity = (position - node2.lastPosition) / dt;
          finished = p == 1;
        } else if (config2.decay) {
          const decay = config2.decay === true ? 0.998 : config2.decay;
          const e = Math.exp(-(1 - decay) * elapsed);
          position = from + v0 / (1 - decay) * (1 - e);
          finished = Math.abs(node2.lastPosition - position) <= precision;
          velocity = v0 * e;
        } else {
          velocity = node2.lastVelocity == null ? v0 : node2.lastVelocity;
          const restVelocity = config2.restVelocity || precision / 10;
          const bounceFactor = config2.clamp ? 0 : config2.bounce;
          const canBounce = !is.und(bounceFactor);
          const isGrowing = from == to2 ? node2.v0 > 0 : from < to2;
          let isMoving;
          let isBouncing = false;
          const step2 = 1;
          const numSteps = Math.ceil(dt / step2);
          for (let n = 0; n < numSteps; ++n) {
            isMoving = Math.abs(velocity) > restVelocity;
            if (!isMoving) {
              finished = Math.abs(to2 - position) <= precision;
              if (finished) {
                break;
              }
            }
            if (canBounce) {
              isBouncing = position == to2 || position > to2 == isGrowing;
              if (isBouncing) {
                velocity = -velocity * bounceFactor;
                position = to2;
              }
            }
            const springForce = -config2.tension * 1e-6 * (position - to2);
            const dampingForce = -config2.friction * 1e-3 * velocity;
            const acceleration = (springForce + dampingForce) / config2.mass;
            velocity = velocity + acceleration * step2;
            position = position + velocity * step2;
          }
        }
        node2.lastVelocity = velocity;
        if (Number.isNaN(position)) {
          console.warn(`Got NaN while animating:`, this);
          finished = true;
        }
      }
      if (payload && !payload[i].done) {
        finished = false;
      }
      if (finished) {
        node2.done = true;
      } else {
        idle = false;
      }
      if (node2.setValue(position, config2.round)) {
        changed = true;
      }
    });
    const node = getAnimated(this);
    const currVal = node.getValue();
    if (idle) {
      const finalVal = getFluidValue(anim.to);
      if ((currVal !== finalVal || changed) && !config2.decay) {
        node.setValue(finalVal);
        this._onChange(finalVal);
      } else if (changed && config2.decay) {
        this._onChange(currVal);
      }
      this._stop();
    } else if (changed) {
      this._onChange(currVal);
    }
  }
  /** Set the current value, while stopping the current animation */
  set(value2) {
    raf.batchedUpdates(() => {
      this._stop();
      this._focus(value2);
      this._set(value2);
    });
    return this;
  }
  /**
   * Freeze the active animation in time, as well as any updates merged
   * before `resume` is called.
   */
  pause() {
    this._update({ pause: true });
  }
  /** Resume the animation if paused. */
  resume() {
    this._update({ pause: false });
  }
  /** Skip to the end of the current animation. */
  finish() {
    if (isAnimating(this)) {
      const { to: to2, config: config2 } = this.animation;
      raf.batchedUpdates(() => {
        this._onStart();
        if (!config2.decay) {
          this._set(to2, false);
        }
        this._stop();
      });
    }
    return this;
  }
  /** Push props into the pending queue. */
  update(props) {
    const queue = this.queue || (this.queue = []);
    queue.push(props);
    return this;
  }
  start(to2, arg2) {
    let queue;
    if (!is.und(to2)) {
      queue = [is.obj(to2) ? to2 : { ...arg2, to: to2 }];
    } else {
      queue = this.queue || [];
      this.queue = [];
    }
    return Promise.all(
      queue.map((props) => {
        const up = this._update(props);
        return up;
      })
    ).then((results) => getCombinedResult(this, results));
  }
  /**
   * Stop the current animation, and cancel any delayed updates.
   *
   * Pass `true` to call `onRest` with `cancelled: true`.
   */
  stop(cancel) {
    const { to: to2 } = this.animation;
    this._focus(this.get());
    stopAsync(this._state, cancel && this._lastCallId);
    raf.batchedUpdates(() => this._stop(to2, cancel));
    return this;
  }
  /** Restart the animation. */
  reset() {
    this._update({ reset: true });
  }
  /** @internal */
  eventObserved(event) {
    if (event.type == "change") {
      this._start();
    } else if (event.type == "priority") {
      this.priority = event.priority + 1;
    }
  }
  /**
   * Parse the `to` and `from` range from the given `props` object.
   *
   * This also ensures the initial value is available to animated components
   * during the render phase.
   */
  _prepareNode(props) {
    const key = this.key || "";
    let { to: to2, from } = props;
    to2 = is.obj(to2) ? to2[key] : to2;
    if (to2 == null || isAsyncTo(to2)) {
      to2 = void 0;
    }
    from = is.obj(from) ? from[key] : from;
    if (from == null) {
      from = void 0;
    }
    const range2 = { to: to2, from };
    if (!hasAnimated(this)) {
      if (props.reverse)
        [to2, from] = [from, to2];
      from = getFluidValue(from);
      if (!is.und(from)) {
        this._set(from);
      } else if (!getAnimated(this)) {
        this._set(to2);
      }
    }
    return range2;
  }
  /** Every update is processed by this method before merging. */
  _update({ ...props }, isLoop) {
    const { key, defaultProps } = this;
    if (props.default)
      Object.assign(
        defaultProps,
        getDefaultProps(
          props,
          (value2, prop) => /^on/.test(prop) ? resolveProp(value2, key) : value2
        )
      );
    mergeActiveFn(this, props, "onProps");
    sendEvent(this, "onProps", props, this);
    const range2 = this._prepareNode(props);
    if (Object.isFrozen(this)) {
      throw Error(
        "Cannot animate a `SpringValue` object that is frozen. Did you forget to pass your component to `animated(...)` before animating its props?"
      );
    }
    const state = this._state;
    return scheduleProps(++this._lastCallId, {
      key,
      props,
      defaultProps,
      state,
      actions: {
        pause: () => {
          if (!isPaused(this)) {
            setPausedBit(this, true);
            flushCalls(state.pauseQueue);
            sendEvent(
              this,
              "onPause",
              getFinishedResult(this, checkFinished(this, this.animation.to)),
              this
            );
          }
        },
        resume: () => {
          if (isPaused(this)) {
            setPausedBit(this, false);
            if (isAnimating(this)) {
              this._resume();
            }
            flushCalls(state.resumeQueue);
            sendEvent(
              this,
              "onResume",
              getFinishedResult(this, checkFinished(this, this.animation.to)),
              this
            );
          }
        },
        start: this._merge.bind(this, range2)
      }
    }).then((result) => {
      if (props.loop && result.finished && !(isLoop && result.noop)) {
        const nextProps = createLoopUpdate(props);
        if (nextProps) {
          return this._update(nextProps, true);
        }
      }
      return result;
    });
  }
  /** Merge props into the current animation */
  _merge(range2, props, resolve) {
    if (props.cancel) {
      this.stop(true);
      return resolve(getCancelledResult(this));
    }
    const hasToProp = !is.und(range2.to);
    const hasFromProp = !is.und(range2.from);
    if (hasToProp || hasFromProp) {
      if (props.callId > this._lastToId) {
        this._lastToId = props.callId;
      } else {
        return resolve(getCancelledResult(this));
      }
    }
    const { key, defaultProps, animation: anim } = this;
    const { to: prevTo, from: prevFrom } = anim;
    let { to: to2 = prevTo, from = prevFrom } = range2;
    if (hasFromProp && !hasToProp && (!props.default || is.und(to2))) {
      to2 = from;
    }
    if (props.reverse)
      [to2, from] = [from, to2];
    const hasFromChanged = !isEqual(from, prevFrom);
    if (hasFromChanged) {
      anim.from = from;
    }
    from = getFluidValue(from);
    const hasToChanged = !isEqual(to2, prevTo);
    if (hasToChanged) {
      this._focus(to2);
    }
    const hasAsyncTo = isAsyncTo(props.to);
    const { config: config2 } = anim;
    const { decay, velocity } = config2;
    if (hasToProp || hasFromProp) {
      config2.velocity = 0;
    }
    if (props.config && !hasAsyncTo) {
      mergeConfig(
        config2,
        callProp(props.config, key),
        // Avoid calling the same "config" prop twice.
        props.config !== defaultProps.config ? callProp(defaultProps.config, key) : void 0
      );
    }
    let node = getAnimated(this);
    if (!node || is.und(to2)) {
      return resolve(getFinishedResult(this, true));
    }
    const reset = (
      // When `reset` is undefined, the `from` prop implies `reset: true`,
      // except for declarative updates. When `reset` is defined, there
      // must exist a value to animate from.
      is.und(props.reset) ? hasFromProp && !props.default : !is.und(from) && matchProp(props.reset, key)
    );
    const value2 = reset ? from : this.get();
    const goal = computeGoal(to2);
    const isAnimatable = is.num(goal) || is.arr(goal) || isAnimatedString(goal);
    const immediate = !hasAsyncTo && (!isAnimatable || matchProp(defaultProps.immediate || props.immediate, key));
    if (hasToChanged) {
      const nodeType = getAnimatedType(to2);
      if (nodeType !== node.constructor) {
        if (immediate) {
          node = this._set(goal);
        } else
          throw Error(
            `Cannot animate between ${node.constructor.name} and ${nodeType.name}, as the "to" prop suggests`
          );
      }
    }
    const goalType = node.constructor;
    let started = hasFluidValue(to2);
    let finished = false;
    if (!started) {
      const hasValueChanged = reset || !hasAnimated(this) && hasFromChanged;
      if (hasToChanged || hasValueChanged) {
        finished = isEqual(computeGoal(value2), goal);
        started = !finished;
      }
      if (!isEqual(anim.immediate, immediate) && !immediate || !isEqual(config2.decay, decay) || !isEqual(config2.velocity, velocity)) {
        started = true;
      }
    }
    if (finished && isAnimating(this)) {
      if (anim.changed && !reset) {
        started = true;
      } else if (!started) {
        this._stop(prevTo);
      }
    }
    if (!hasAsyncTo) {
      if (started || hasFluidValue(prevTo)) {
        anim.values = node.getPayload();
        anim.toValues = hasFluidValue(to2) ? null : goalType == AnimatedString ? [1] : toArray(goal);
      }
      if (anim.immediate != immediate) {
        anim.immediate = immediate;
        if (!immediate && !reset) {
          this._set(prevTo);
        }
      }
      if (started) {
        const { onRest } = anim;
        each(ACTIVE_EVENTS, (type) => mergeActiveFn(this, props, type));
        const result = getFinishedResult(this, checkFinished(this, prevTo));
        flushCalls(this._pendingCalls, result);
        this._pendingCalls.add(resolve);
        if (anim.changed)
          raf.batchedUpdates(() => {
            var _a;
            anim.changed = !reset;
            onRest == null ? void 0 : onRest(result, this);
            if (reset) {
              callProp(defaultProps.onRest, result);
            } else {
              (_a = anim.onStart) == null ? void 0 : _a.call(anim, result, this);
            }
          });
      }
    }
    if (reset) {
      this._set(value2);
    }
    if (hasAsyncTo) {
      resolve(runAsync(props.to, props, this._state, this));
    } else if (started) {
      this._start();
    } else if (isAnimating(this) && !hasToChanged) {
      this._pendingCalls.add(resolve);
    } else {
      resolve(getNoopResult(value2));
    }
  }
  /** Update the `animation.to` value, which might be a `FluidValue` */
  _focus(value2) {
    const anim = this.animation;
    if (value2 !== anim.to) {
      if (getFluidObservers(this)) {
        this._detach();
      }
      anim.to = value2;
      if (getFluidObservers(this)) {
        this._attach();
      }
    }
  }
  _attach() {
    let priority2 = 0;
    const { to: to2 } = this.animation;
    if (hasFluidValue(to2)) {
      addFluidObserver(to2, this);
      if (isFrameValue(to2)) {
        priority2 = to2.priority + 1;
      }
    }
    this.priority = priority2;
  }
  _detach() {
    const { to: to2 } = this.animation;
    if (hasFluidValue(to2)) {
      removeFluidObserver(to2, this);
    }
  }
  /**
   * Update the current value from outside the frameloop,
   * and return the `Animated` node.
   */
  _set(arg, idle = true) {
    const value2 = getFluidValue(arg);
    if (!is.und(value2)) {
      const oldNode = getAnimated(this);
      if (!oldNode || !isEqual(value2, oldNode.getValue())) {
        const nodeType = getAnimatedType(value2);
        if (!oldNode || oldNode.constructor != nodeType) {
          setAnimated(this, nodeType.create(value2));
        } else {
          oldNode.setValue(value2);
        }
        if (oldNode) {
          raf.batchedUpdates(() => {
            this._onChange(value2, idle);
          });
        }
      }
    }
    return getAnimated(this);
  }
  _onStart() {
    const anim = this.animation;
    if (!anim.changed) {
      anim.changed = true;
      sendEvent(
        this,
        "onStart",
        getFinishedResult(this, checkFinished(this, anim.to)),
        this
      );
    }
  }
  _onChange(value2, idle) {
    if (!idle) {
      this._onStart();
      callProp(this.animation.onChange, value2, this);
    }
    callProp(this.defaultProps.onChange, value2, this);
    super._onChange(value2, idle);
  }
  // This method resets the animation state (even if already animating) to
  // ensure the latest from/to range is used, and it also ensures this spring
  // is added to the frameloop.
  _start() {
    const anim = this.animation;
    getAnimated(this).reset(getFluidValue(anim.to));
    if (!anim.immediate) {
      anim.fromValues = anim.values.map((node) => node.lastPosition);
    }
    if (!isAnimating(this)) {
      setActiveBit(this, true);
      if (!isPaused(this)) {
        this._resume();
      }
    }
  }
  _resume() {
    if (globals_exports.skipAnimation) {
      this.finish();
    } else {
      frameLoop.start(this);
    }
  }
  /**
   * Exit the frameloop and notify `onRest` listeners.
   *
   * Always wrap `_stop` calls with `batchedUpdates`.
   */
  _stop(goal, cancel) {
    if (isAnimating(this)) {
      setActiveBit(this, false);
      const anim = this.animation;
      each(anim.values, (node) => {
        node.done = true;
      });
      if (anim.toValues) {
        anim.onChange = anim.onPause = anim.onResume = void 0;
      }
      callFluidObservers(this, {
        type: "idle",
        parent: this
      });
      const result = cancel ? getCancelledResult(this.get()) : getFinishedResult(this.get(), checkFinished(this, goal ?? anim.to));
      flushCalls(this._pendingCalls, result);
      if (anim.changed) {
        anim.changed = false;
        sendEvent(this, "onRest", result, this);
      }
    }
  }
};
function checkFinished(target, to2) {
  const goal = computeGoal(to2);
  const value2 = computeGoal(target.get());
  return isEqual(value2, goal);
}
function createLoopUpdate(props, loop2 = props.loop, to2 = props.to) {
  const loopRet = callProp(loop2);
  if (loopRet) {
    const overrides = loopRet !== true && inferTo(loopRet);
    const reverse2 = (overrides || props).reverse;
    const reset = !overrides || overrides.reset;
    return createUpdate({
      ...props,
      loop: loop2,
      // Avoid updating default props when looping.
      default: false,
      // Never loop the `pause` prop.
      pause: void 0,
      // For the "reverse" prop to loop as expected, the "to" prop
      // must be undefined. The "reverse" prop is ignored when the
      // "to" prop is an array or function.
      to: !reverse2 || isAsyncTo(to2) ? to2 : void 0,
      // Ignore the "from" prop except on reset.
      from: reset ? props.from : void 0,
      reset,
      // The "loop" prop can return a "useSpring" props object to
      // override any of the original props.
      ...overrides
    });
  }
}
function createUpdate(props) {
  const { to: to2, from } = props = inferTo(props);
  const keys = /* @__PURE__ */ new Set();
  if (is.obj(to2))
    findDefined(to2, keys);
  if (is.obj(from))
    findDefined(from, keys);
  props.keys = keys.size ? Array.from(keys) : null;
  return props;
}
function declareUpdate(props) {
  const update2 = createUpdate(props);
  if (is.und(update2.default)) {
    update2.default = getDefaultProps(update2);
  }
  return update2;
}
function findDefined(values, keys) {
  eachProp(values, (value2, key) => value2 != null && keys.add(key));
}
var ACTIVE_EVENTS = [
  "onStart",
  "onRest",
  "onChange",
  "onPause",
  "onResume"
];
function mergeActiveFn(target, props, type) {
  target.animation[type] = props[type] !== getDefaultProp(props, type) ? resolveProp(props[type], target.key) : void 0;
}
function sendEvent(target, type, ...args) {
  var _a, _b, _c, _d;
  (_b = (_a = target.animation)[type]) == null ? void 0 : _b.call(_a, ...args);
  (_d = (_c = target.defaultProps)[type]) == null ? void 0 : _d.call(_c, ...args);
}
var BATCHED_EVENTS = ["onStart", "onChange", "onRest"];
var nextId2 = 1;
var Controller = class {
  constructor(props, flush3) {
    this.id = nextId2++;
    this.springs = {};
    this.queue = [];
    this._lastAsyncId = 0;
    this._active = /* @__PURE__ */ new Set();
    this._changed = /* @__PURE__ */ new Set();
    this._started = false;
    this._state = {
      paused: false,
      pauseQueue: /* @__PURE__ */ new Set(),
      resumeQueue: /* @__PURE__ */ new Set(),
      timeouts: /* @__PURE__ */ new Set()
    };
    this._events = {
      onStart: /* @__PURE__ */ new Map(),
      onChange: /* @__PURE__ */ new Map(),
      onRest: /* @__PURE__ */ new Map()
    };
    this._onFrame = this._onFrame.bind(this);
    if (flush3) {
      this._flush = flush3;
    }
    if (props) {
      this.start({ default: true, ...props });
    }
  }
  /**
   * Equals `true` when no spring values are in the frameloop, and
   * no async animation is currently active.
   */
  get idle() {
    return !this._state.asyncTo && Object.values(this.springs).every((spring) => {
      return spring.idle && !spring.isDelayed && !spring.isPaused;
    });
  }
  get item() {
    return this._item;
  }
  set item(item) {
    this._item = item;
  }
  /** Get the current values of our springs */
  get() {
    const values = {};
    this.each((spring, key) => values[key] = spring.get());
    return values;
  }
  /** Set the current values without animating. */
  set(values) {
    for (const key in values) {
      const value2 = values[key];
      if (!is.und(value2)) {
        this.springs[key].set(value2);
      }
    }
  }
  /** Push an update onto the queue of each value. */
  update(props) {
    if (props) {
      this.queue.push(createUpdate(props));
    }
    return this;
  }
  /**
   * Start the queued animations for every spring, and resolve the returned
   * promise once all queued animations have finished or been cancelled.
   *
   * When you pass a queue (instead of nothing), that queue is used instead of
   * the queued animations added with the `update` method, which are left alone.
   */
  start(props) {
    let { queue } = this;
    if (props) {
      queue = toArray(props).map(createUpdate);
    } else {
      this.queue = [];
    }
    if (this._flush) {
      return this._flush(this, queue);
    }
    prepareKeys(this, queue);
    return flushUpdateQueue(this, queue);
  }
  /** @internal */
  stop(arg, keys) {
    if (arg !== !!arg) {
      keys = arg;
    }
    if (keys) {
      const springs = this.springs;
      each(toArray(keys), (key) => springs[key].stop(!!arg));
    } else {
      stopAsync(this._state, this._lastAsyncId);
      this.each((spring) => spring.stop(!!arg));
    }
    return this;
  }
  /** Freeze the active animation in time */
  pause(keys) {
    if (is.und(keys)) {
      this.start({ pause: true });
    } else {
      const springs = this.springs;
      each(toArray(keys), (key) => springs[key].pause());
    }
    return this;
  }
  /** Resume the animation if paused. */
  resume(keys) {
    if (is.und(keys)) {
      this.start({ pause: false });
    } else {
      const springs = this.springs;
      each(toArray(keys), (key) => springs[key].resume());
    }
    return this;
  }
  /** Call a function once per spring value */
  each(iterator) {
    eachProp(this.springs, iterator);
  }
  /** @internal Called at the end of every animation frame */
  _onFrame() {
    const { onStart, onChange, onRest } = this._events;
    const active = this._active.size > 0;
    const changed = this._changed.size > 0;
    if (active && !this._started || changed && !this._started) {
      this._started = true;
      flush(onStart, ([onStart2, result]) => {
        result.value = this.get();
        onStart2(result, this, this._item);
      });
    }
    const idle = !active && this._started;
    const values = changed || idle && onRest.size ? this.get() : null;
    if (changed && onChange.size) {
      flush(onChange, ([onChange2, result]) => {
        result.value = values;
        onChange2(result, this, this._item);
      });
    }
    if (idle) {
      this._started = false;
      flush(onRest, ([onRest2, result]) => {
        result.value = values;
        onRest2(result, this, this._item);
      });
    }
  }
  /** @internal */
  eventObserved(event) {
    if (event.type == "change") {
      this._changed.add(event.parent);
      if (!event.idle) {
        this._active.add(event.parent);
      }
    } else if (event.type == "idle") {
      this._active.delete(event.parent);
    } else
      return;
    raf.onFrame(this._onFrame);
  }
};
function flushUpdateQueue(ctrl, queue) {
  return Promise.all(queue.map((props) => flushUpdate(ctrl, props))).then(
    (results) => getCombinedResult(ctrl, results)
  );
}
async function flushUpdate(ctrl, props, isLoop) {
  const { keys, to: to2, from, loop: loop2, onRest, onResolve } = props;
  const defaults2 = is.obj(props.default) && props.default;
  if (loop2) {
    props.loop = false;
  }
  if (to2 === false)
    props.to = null;
  if (from === false)
    props.from = null;
  const asyncTo = is.arr(to2) || is.fun(to2) ? to2 : void 0;
  if (asyncTo) {
    props.to = void 0;
    props.onRest = void 0;
    if (defaults2) {
      defaults2.onRest = void 0;
    }
  } else {
    each(BATCHED_EVENTS, (key) => {
      const handler = props[key];
      if (is.fun(handler)) {
        const queue = ctrl["_events"][key];
        props[key] = ({ finished, cancelled }) => {
          const result2 = queue.get(handler);
          if (result2) {
            if (!finished)
              result2.finished = false;
            if (cancelled)
              result2.cancelled = true;
          } else {
            queue.set(handler, {
              value: null,
              finished: finished || false,
              cancelled: cancelled || false
            });
          }
        };
        if (defaults2) {
          defaults2[key] = props[key];
        }
      }
    });
  }
  const state = ctrl["_state"];
  if (props.pause === !state.paused) {
    state.paused = props.pause;
    flushCalls(props.pause ? state.pauseQueue : state.resumeQueue);
  } else if (state.paused) {
    props.pause = true;
  }
  const promises = (keys || Object.keys(ctrl.springs)).map(
    (key) => ctrl.springs[key].start(props)
  );
  const cancel = props.cancel === true || getDefaultProp(props, "cancel") === true;
  if (asyncTo || cancel && state.asyncId) {
    promises.push(
      scheduleProps(++ctrl["_lastAsyncId"], {
        props,
        state,
        actions: {
          pause: noop,
          resume: noop,
          start(props2, resolve) {
            if (cancel) {
              stopAsync(state, ctrl["_lastAsyncId"]);
              resolve(getCancelledResult(ctrl));
            } else {
              props2.onRest = onRest;
              resolve(
                runAsync(
                  asyncTo,
                  props2,
                  state,
                  ctrl
                )
              );
            }
          }
        }
      })
    );
  }
  if (state.paused) {
    await new Promise((resume) => {
      state.resumeQueue.add(resume);
    });
  }
  const result = getCombinedResult(ctrl, await Promise.all(promises));
  if (loop2 && result.finished && !(isLoop && result.noop)) {
    const nextProps = createLoopUpdate(props, loop2, to2);
    if (nextProps) {
      prepareKeys(ctrl, [nextProps]);
      return flushUpdate(ctrl, nextProps, true);
    }
  }
  if (onResolve) {
    raf.batchedUpdates(() => onResolve(result, ctrl, ctrl.item));
  }
  return result;
}
function getSprings(ctrl, props) {
  const springs = { ...ctrl.springs };
  if (props) {
    each(toArray(props), (props2) => {
      if (is.und(props2.keys)) {
        props2 = createUpdate(props2);
      }
      if (!is.obj(props2.to)) {
        props2 = { ...props2, to: void 0 };
      }
      prepareSprings(springs, props2, (key) => {
        return createSpring(key);
      });
    });
  }
  setSprings(ctrl, springs);
  return springs;
}
function setSprings(ctrl, springs) {
  eachProp(springs, (spring, key) => {
    if (!ctrl.springs[key]) {
      ctrl.springs[key] = spring;
      addFluidObserver(spring, ctrl);
    }
  });
}
function createSpring(key, observer2) {
  const spring = new SpringValue();
  spring.key = key;
  if (observer2) {
    addFluidObserver(spring, observer2);
  }
  return spring;
}
function prepareSprings(springs, props, create) {
  if (props.keys) {
    each(props.keys, (key) => {
      const spring = springs[key] || (springs[key] = create(key));
      spring["_prepareNode"](props);
    });
  }
}
function prepareKeys(ctrl, queue) {
  each(queue, (props) => {
    prepareSprings(ctrl.springs, props, (key) => {
      return createSpring(key, ctrl);
    });
  });
}
var SpringContext = ({
  children,
  ...props
}) => {
  const inherited = reactExports.useContext(ctx);
  const pause = props.pause || !!inherited.pause, immediate = props.immediate || !!inherited.immediate;
  props = useMemoOne(() => ({ pause, immediate }), [pause, immediate]);
  const { Provider } = ctx;
  return /* @__PURE__ */ reactExports.createElement(Provider, { value: props }, children);
};
var ctx = makeContext(SpringContext, {});
SpringContext.Provider = ctx.Provider;
SpringContext.Consumer = ctx.Consumer;
function makeContext(target, init2) {
  Object.assign(target, reactExports.createContext(init2));
  target.Provider._context = target;
  target.Consumer._context = target;
  return target;
}
var SpringRef = () => {
  const current = [];
  const SpringRef2 = function(props) {
    deprecateDirectCall();
    const results = [];
    each(current, (ctrl, i) => {
      if (is.und(props)) {
        results.push(ctrl.start());
      } else {
        const update2 = _getProps(props, ctrl, i);
        if (update2) {
          results.push(ctrl.start(update2));
        }
      }
    });
    return results;
  };
  SpringRef2.current = current;
  SpringRef2.add = function(ctrl) {
    if (!current.includes(ctrl)) {
      current.push(ctrl);
    }
  };
  SpringRef2.delete = function(ctrl) {
    const i = current.indexOf(ctrl);
    if (~i)
      current.splice(i, 1);
  };
  SpringRef2.pause = function() {
    each(current, (ctrl) => ctrl.pause(...arguments));
    return this;
  };
  SpringRef2.resume = function() {
    each(current, (ctrl) => ctrl.resume(...arguments));
    return this;
  };
  SpringRef2.set = function(values) {
    each(current, (ctrl, i) => {
      const update2 = is.fun(values) ? values(i, ctrl) : values;
      if (update2) {
        ctrl.set(update2);
      }
    });
  };
  SpringRef2.start = function(props) {
    const results = [];
    each(current, (ctrl, i) => {
      if (is.und(props)) {
        results.push(ctrl.start());
      } else {
        const update2 = this._getProps(props, ctrl, i);
        if (update2) {
          results.push(ctrl.start(update2));
        }
      }
    });
    return results;
  };
  SpringRef2.stop = function() {
    each(current, (ctrl) => ctrl.stop(...arguments));
    return this;
  };
  SpringRef2.update = function(props) {
    each(current, (ctrl, i) => ctrl.update(this._getProps(props, ctrl, i)));
    return this;
  };
  const _getProps = function(arg, ctrl, index2) {
    return is.fun(arg) ? arg(index2, ctrl) : arg;
  };
  SpringRef2._getProps = _getProps;
  return SpringRef2;
};
function useSprings(length2, props, deps) {
  const propsFn = is.fun(props) && props;
  if (propsFn && !deps)
    deps = [];
  const ref = reactExports.useMemo(
    () => propsFn || arguments.length == 3 ? SpringRef() : void 0,
    []
  );
  const layoutId = reactExports.useRef(0);
  const forceUpdate = useForceUpdate();
  const state = reactExports.useMemo(
    () => ({
      ctrls: [],
      queue: [],
      flush(ctrl, updates2) {
        const springs2 = getSprings(ctrl, updates2);
        const canFlushSync = layoutId.current > 0 && !state.queue.length && !Object.keys(springs2).some((key) => !ctrl.springs[key]);
        return canFlushSync ? flushUpdateQueue(ctrl, updates2) : new Promise((resolve) => {
          setSprings(ctrl, springs2);
          state.queue.push(() => {
            resolve(flushUpdateQueue(ctrl, updates2));
          });
          forceUpdate();
        });
      }
    }),
    []
  );
  const ctrls = reactExports.useRef([...state.ctrls]);
  const updates = [];
  const prevLength = usePrev(length2) || 0;
  reactExports.useMemo(() => {
    each(ctrls.current.slice(length2, prevLength), (ctrl) => {
      detachRefs(ctrl, ref);
      ctrl.stop(true);
    });
    ctrls.current.length = length2;
    declareUpdates(prevLength, length2);
  }, [length2]);
  reactExports.useMemo(() => {
    declareUpdates(0, Math.min(prevLength, length2));
  }, deps);
  function declareUpdates(startIndex, endIndex) {
    for (let i = startIndex; i < endIndex; i++) {
      const ctrl = ctrls.current[i] || (ctrls.current[i] = new Controller(null, state.flush));
      const update2 = propsFn ? propsFn(i, ctrl) : props[i];
      if (update2) {
        updates[i] = declareUpdate(update2);
      }
    }
  }
  const springs = ctrls.current.map((ctrl, i) => getSprings(ctrl, updates[i]));
  const context = reactExports.useContext(SpringContext);
  const prevContext = usePrev(context);
  const hasContext = context !== prevContext && hasProps(context);
  useIsomorphicLayoutEffect(() => {
    layoutId.current++;
    state.ctrls = ctrls.current;
    const { queue } = state;
    if (queue.length) {
      state.queue = [];
      each(queue, (cb) => cb());
    }
    each(ctrls.current, (ctrl, i) => {
      ref == null ? void 0 : ref.add(ctrl);
      if (hasContext) {
        ctrl.start({ default: context });
      }
      const update2 = updates[i];
      if (update2) {
        replaceRef(ctrl, update2.ref);
        if (ctrl.ref) {
          ctrl.queue.push(update2);
        } else {
          ctrl.start(update2);
        }
      }
    });
  });
  useOnce(() => () => {
    each(state.ctrls, (ctrl) => ctrl.stop(true));
  });
  const values = springs.map((x2) => ({ ...x2 }));
  return ref ? [values, ref] : values;
}
function useSpring(props, deps) {
  const isFn = is.fun(props);
  const [[values], ref] = useSprings(
    1,
    isFn ? props : [props],
    isFn ? deps || [] : deps
  );
  return isFn || arguments.length == 2 ? [values, ref] : values;
}
var initSpringRef = () => SpringRef();
var useSpringRef = () => reactExports.useState(initSpringRef)[0];
var useSpringValue = (initial, props) => {
  const springValue = useConstant(() => new SpringValue(initial, props));
  useOnce(() => () => {
    springValue.stop();
  });
  return springValue;
};
function useTrail(length2, propsArg, deps) {
  const propsFn = is.fun(propsArg) && propsArg;
  if (propsFn && !deps)
    deps = [];
  let reverse2 = true;
  let passedRef = void 0;
  const result = useSprings(
    length2,
    (i, ctrl) => {
      const props = propsFn ? propsFn(i, ctrl) : propsArg;
      passedRef = props.ref;
      reverse2 = reverse2 && props.reverse;
      return props;
    },
    // Ensure the props function is called when no deps exist.
    // This works around the 3 argument rule.
    deps || [{}]
  );
  useIsomorphicLayoutEffect(() => {
    each(result[1].current, (ctrl, i) => {
      const parent = result[1].current[i + (reverse2 ? 1 : -1)];
      replaceRef(ctrl, passedRef);
      if (ctrl.ref) {
        if (parent) {
          ctrl.update({ to: parent.springs });
        }
        return;
      }
      if (parent) {
        ctrl.start({ to: parent.springs });
      } else {
        ctrl.start();
      }
    });
  }, deps);
  if (propsFn || arguments.length == 3) {
    const ref = passedRef ?? result[1];
    ref["_getProps"] = (propsArg2, ctrl, i) => {
      const props = is.fun(propsArg2) ? propsArg2(i, ctrl) : propsArg2;
      if (props) {
        const parent = ref.current[i + (props.reverse ? 1 : -1)];
        if (parent)
          props.to = parent.springs;
        return props;
      }
    };
    return result;
  }
  return result[0];
}
function useTransition(data, props, deps) {
  const propsFn = is.fun(props) && props;
  const {
    reset,
    sort: sort2,
    trail = 0,
    expires = true,
    exitBeforeEnter = false,
    onDestroyed,
    ref: propsRef,
    config: propsConfig
  } = propsFn ? propsFn() : props;
  const ref = reactExports.useMemo(
    () => propsFn || arguments.length == 3 ? SpringRef() : void 0,
    []
  );
  const items = toArray(data);
  const transitions = [];
  const usedTransitions = reactExports.useRef(null);
  const prevTransitions = reset ? null : usedTransitions.current;
  useIsomorphicLayoutEffect(() => {
    usedTransitions.current = transitions;
  });
  useOnce(() => {
    each(transitions, (t) => {
      ref == null ? void 0 : ref.add(t.ctrl);
      t.ctrl.ref = ref;
    });
    return () => {
      each(usedTransitions.current, (t) => {
        if (t.expired) {
          clearTimeout(t.expirationId);
        }
        detachRefs(t.ctrl, ref);
        t.ctrl.stop(true);
      });
    };
  });
  const keys = getKeys(items, propsFn ? propsFn() : props, prevTransitions);
  const expired = reset && usedTransitions.current || [];
  useIsomorphicLayoutEffect(
    () => each(expired, ({ ctrl, item, key }) => {
      detachRefs(ctrl, ref);
      callProp(onDestroyed, item, key);
    })
  );
  const reused = [];
  if (prevTransitions)
    each(prevTransitions, (t, i) => {
      if (t.expired) {
        clearTimeout(t.expirationId);
        expired.push(t);
      } else {
        i = reused[i] = keys.indexOf(t.key);
        if (~i)
          transitions[i] = t;
      }
    });
  each(items, (item, i) => {
    if (!transitions[i]) {
      transitions[i] = {
        key: keys[i],
        item,
        phase: "mount",
        ctrl: new Controller()
      };
      transitions[i].ctrl.item = item;
    }
  });
  if (reused.length) {
    let i = -1;
    const { leave } = propsFn ? propsFn() : props;
    each(reused, (keyIndex, prevIndex) => {
      const t = prevTransitions[prevIndex];
      if (~keyIndex) {
        i = transitions.indexOf(t);
        transitions[i] = { ...t, item: items[keyIndex] };
      } else if (leave) {
        transitions.splice(++i, 0, t);
      }
    });
  }
  if (is.fun(sort2)) {
    transitions.sort((a2, b) => sort2(a2.item, b.item));
  }
  let delay = -trail;
  const forceUpdate = useForceUpdate();
  const defaultProps = getDefaultProps(props);
  const changes = /* @__PURE__ */ new Map();
  const exitingTransitions = reactExports.useRef(/* @__PURE__ */ new Map());
  const forceChange = reactExports.useRef(false);
  each(transitions, (t, i) => {
    const key = t.key;
    const prevPhase = t.phase;
    const p = propsFn ? propsFn() : props;
    let to2;
    let phase;
    const propsDelay = callProp(p.delay || 0, key);
    if (prevPhase == "mount") {
      to2 = p.enter;
      phase = "enter";
    } else {
      const isLeave = keys.indexOf(key) < 0;
      if (prevPhase != "leave") {
        if (isLeave) {
          to2 = p.leave;
          phase = "leave";
        } else if (to2 = p.update) {
          phase = "update";
        } else
          return;
      } else if (!isLeave) {
        to2 = p.enter;
        phase = "enter";
      } else
        return;
    }
    to2 = callProp(to2, t.item, i);
    to2 = is.obj(to2) ? inferTo(to2) : { to: to2 };
    if (!to2.config) {
      const config2 = propsConfig || defaultProps.config;
      to2.config = callProp(config2, t.item, i, phase);
    }
    delay += trail;
    const payload = {
      ...defaultProps,
      // we need to add our props.delay value you here.
      delay: propsDelay + delay,
      ref: propsRef,
      immediate: p.immediate,
      // This prevents implied resets.
      reset: false,
      // Merge any phase-specific props.
      ...to2
    };
    if (phase == "enter" && is.und(payload.from)) {
      const p2 = propsFn ? propsFn() : props;
      const from = is.und(p2.initial) || prevTransitions ? p2.from : p2.initial;
      payload.from = callProp(from, t.item, i);
    }
    const { onResolve } = payload;
    payload.onResolve = (result) => {
      callProp(onResolve, result);
      const transitions2 = usedTransitions.current;
      const t22 = transitions2.find((t32) => t32.key === key);
      if (!t22)
        return;
      if (result.cancelled && t22.phase != "update") {
        return;
      }
      if (t22.ctrl.idle) {
        const idle = transitions2.every((t32) => t32.ctrl.idle);
        if (t22.phase == "leave") {
          const expiry = callProp(expires, t22.item);
          if (expiry !== false) {
            const expiryMs = expiry === true ? 0 : expiry;
            t22.expired = true;
            if (!idle && expiryMs > 0) {
              if (expiryMs <= 2147483647)
                t22.expirationId = setTimeout(forceUpdate, expiryMs);
              return;
            }
          }
        }
        if (idle && transitions2.some((t32) => t32.expired)) {
          exitingTransitions.current.delete(t22);
          if (exitBeforeEnter) {
            forceChange.current = true;
          }
          forceUpdate();
        }
      }
    };
    const springs = getSprings(t.ctrl, payload);
    if (phase === "leave" && exitBeforeEnter) {
      exitingTransitions.current.set(t, { phase, springs, payload });
    } else {
      changes.set(t, { phase, springs, payload });
    }
  });
  const context = reactExports.useContext(SpringContext);
  const prevContext = usePrev(context);
  const hasContext = context !== prevContext && hasProps(context);
  useIsomorphicLayoutEffect(() => {
    if (hasContext) {
      each(transitions, (t) => {
        t.ctrl.start({ default: context });
      });
    }
  }, [context]);
  each(changes, (_, t) => {
    if (exitingTransitions.current.size) {
      const ind = transitions.findIndex((state) => state.key === t.key);
      transitions.splice(ind, 1);
    }
  });
  useIsomorphicLayoutEffect(
    () => {
      each(
        exitingTransitions.current.size ? exitingTransitions.current : changes,
        ({ phase, payload }, t) => {
          const { ctrl } = t;
          t.phase = phase;
          ref == null ? void 0 : ref.add(ctrl);
          if (hasContext && phase == "enter") {
            ctrl.start({ default: context });
          }
          if (payload) {
            replaceRef(ctrl, payload.ref);
            if ((ctrl.ref || ref) && !forceChange.current) {
              ctrl.update(payload);
            } else {
              ctrl.start(payload);
              if (forceChange.current) {
                forceChange.current = false;
              }
            }
          }
        }
      );
    },
    reset ? void 0 : deps
  );
  const renderTransitions = (render) => /* @__PURE__ */ reactExports.createElement(reactExports.Fragment, null, transitions.map((t, i) => {
    const { springs } = changes.get(t) || t.ctrl;
    const elem = render({ ...springs }, t.item, t, i);
    return elem && elem.type ? /* @__PURE__ */ reactExports.createElement(
      elem.type,
      {
        ...elem.props,
        key: is.str(t.key) || is.num(t.key) ? t.key : t.ctrl.id,
        ref: elem.ref
      }
    ) : elem;
  }));
  return ref ? [renderTransitions, ref] : renderTransitions;
}
var nextKey = 1;
function getKeys(items, { key, keys = key }, prevTransitions) {
  if (keys === null) {
    const reused = /* @__PURE__ */ new Set();
    return items.map((item) => {
      const t = prevTransitions && prevTransitions.find(
        (t22) => t22.item === item && t22.phase !== "leave" && !reused.has(t22)
      );
      if (t) {
        reused.add(t);
        return t.key;
      }
      return nextKey++;
    });
  }
  return is.und(keys) ? items : is.fun(keys) ? items.map(keys) : toArray(keys);
}
var useScroll = ({
  container,
  ...springOptions
} = {}) => {
  const [scrollValues, api] = useSpring(
    () => ({
      scrollX: 0,
      scrollY: 0,
      scrollXProgress: 0,
      scrollYProgress: 0,
      ...springOptions
    }),
    []
  );
  useIsomorphicLayoutEffect(() => {
    const cleanupScroll = onScroll(
      ({ x: x2, y: y2 }) => {
        api.start({
          scrollX: x2.current,
          scrollXProgress: x2.progress,
          scrollY: y2.current,
          scrollYProgress: y2.progress
        });
      },
      { container: (container == null ? void 0 : container.current) || void 0 }
    );
    return () => {
      each(Object.values(scrollValues), (value2) => value2.stop());
      cleanupScroll();
    };
  }, []);
  return scrollValues;
};
var useResize = ({
  container,
  ...springOptions
}) => {
  const [sizeValues, api] = useSpring(
    () => ({
      width: 0,
      height: 0,
      ...springOptions
    }),
    []
  );
  useIsomorphicLayoutEffect(() => {
    const cleanupScroll = onResize(
      ({ width, height }) => {
        api.start({
          width,
          height,
          immediate: sizeValues.width.get() === 0 || sizeValues.height.get() === 0
        });
      },
      { container: (container == null ? void 0 : container.current) || void 0 }
    );
    return () => {
      each(Object.values(sizeValues), (value2) => value2.stop());
      cleanupScroll();
    };
  }, []);
  return sizeValues;
};
var defaultThresholdOptions = {
  any: 0,
  all: 1
};
function useInView(props, args) {
  const [isInView, setIsInView] = reactExports.useState(false);
  const ref = reactExports.useRef();
  const propsFn = is.fun(props) && props;
  const springsProps = propsFn ? propsFn() : {};
  const { to: to2 = {}, from = {}, ...restSpringProps } = springsProps;
  const intersectionArguments = propsFn ? args : props;
  const [springs, api] = useSpring(() => ({ from, ...restSpringProps }), []);
  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    const {
      root: root2,
      once: once2,
      amount = "any",
      ...restArgs
    } = intersectionArguments ?? {};
    if (!element || once2 && isInView || typeof IntersectionObserver === "undefined")
      return;
    const activeIntersections = /* @__PURE__ */ new WeakMap();
    const onEnter = () => {
      if (to2) {
        api.start(to2);
      }
      setIsInView(true);
      const cleanup = () => {
        if (from) {
          api.start(from);
        }
        setIsInView(false);
      };
      return once2 ? void 0 : cleanup;
    };
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        const onLeave = activeIntersections.get(entry.target);
        if (entry.isIntersecting === Boolean(onLeave)) {
          return;
        }
        if (entry.isIntersecting) {
          const newOnLeave = onEnter();
          if (is.fun(newOnLeave)) {
            activeIntersections.set(entry.target, newOnLeave);
          } else {
            observer2.unobserve(entry.target);
          }
        } else if (onLeave) {
          onLeave();
          activeIntersections.delete(entry.target);
        }
      });
    };
    const observer2 = new IntersectionObserver(handleIntersection, {
      root: root2 && root2.current || void 0,
      threshold: typeof amount === "number" || Array.isArray(amount) ? amount : defaultThresholdOptions[amount],
      ...restArgs
    });
    observer2.observe(element);
    return () => observer2.unobserve(element);
  }, [intersectionArguments]);
  if (propsFn) {
    return [ref, springs];
  }
  return [ref, isInView];
}
function Spring({ children, ...props }) {
  return children(useSpring(props));
}
function Trail({
  items,
  children,
  ...props
}) {
  const trails = useTrail(items.length, props);
  return items.map((item, index2) => {
    const result = children(item, index2);
    return is.fun(result) ? result(trails[index2]) : result;
  });
}
function Transition({
  items,
  children,
  ...props
}) {
  return useTransition(items, props)(children);
}
var Interpolation = class extends FrameValue {
  constructor(source, args) {
    super();
    this.source = source;
    this.idle = true;
    this._active = /* @__PURE__ */ new Set();
    this.calc = createInterpolator(...args);
    const value2 = this._get();
    const nodeType = getAnimatedType(value2);
    setAnimated(this, nodeType.create(value2));
  }
  advance(_dt) {
    const value2 = this._get();
    const oldValue = this.get();
    if (!isEqual(value2, oldValue)) {
      getAnimated(this).setValue(value2);
      this._onChange(value2, this.idle);
    }
    if (!this.idle && checkIdle(this._active)) {
      becomeIdle(this);
    }
  }
  _get() {
    const inputs = is.arr(this.source) ? this.source.map(getFluidValue) : toArray(getFluidValue(this.source));
    return this.calc(...inputs);
  }
  _start() {
    if (this.idle && !checkIdle(this._active)) {
      this.idle = false;
      each(getPayload(this), (node) => {
        node.done = false;
      });
      if (globals_exports.skipAnimation) {
        raf.batchedUpdates(() => this.advance());
        becomeIdle(this);
      } else {
        frameLoop.start(this);
      }
    }
  }
  // Observe our sources only when we're observed.
  _attach() {
    let priority2 = 1;
    each(toArray(this.source), (source) => {
      if (hasFluidValue(source)) {
        addFluidObserver(source, this);
      }
      if (isFrameValue(source)) {
        if (!source.idle) {
          this._active.add(source);
        }
        priority2 = Math.max(priority2, source.priority + 1);
      }
    });
    this.priority = priority2;
    this._start();
  }
  // Stop observing our sources once we have no observers.
  _detach() {
    each(toArray(this.source), (source) => {
      if (hasFluidValue(source)) {
        removeFluidObserver(source, this);
      }
    });
    this._active.clear();
    becomeIdle(this);
  }
  /** @internal */
  eventObserved(event) {
    if (event.type == "change") {
      if (event.idle) {
        this.advance();
      } else {
        this._active.add(event.parent);
        this._start();
      }
    } else if (event.type == "idle") {
      this._active.delete(event.parent);
    } else if (event.type == "priority") {
      this.priority = toArray(this.source).reduce(
        (highest, parent) => Math.max(highest, (isFrameValue(parent) ? parent.priority : 0) + 1),
        0
      );
    }
  }
};
function isIdle(source) {
  return source.idle !== false;
}
function checkIdle(active) {
  return !active.size || Array.from(active).every(isIdle);
}
function becomeIdle(self) {
  if (!self.idle) {
    self.idle = true;
    each(getPayload(self), (node) => {
      node.done = true;
    });
    callFluidObservers(self, {
      type: "idle",
      parent: self
    });
  }
}
var to = (source, ...args) => new Interpolation(source, args);
var interpolate$1 = (source, ...args) => (deprecateInterpolate(), new Interpolation(source, args));
globals_exports.assign({
  createStringInterpolator: createStringInterpolator2,
  to: (source, args) => new Interpolation(source, args)
});
var update = frameLoop.advance;
const reactSpring_core_modern = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Any,
  BailSignal,
  Controller,
  FrameValue,
  Globals: globals_exports,
  Interpolation,
  Spring,
  SpringContext,
  SpringRef,
  SpringValue,
  Trail,
  Transition,
  config,
  createInterpolator,
  easings,
  inferTo,
  interpolate: interpolate$1,
  to,
  update,
  useChain,
  useInView,
  useIsomorphicLayoutEffect,
  useReducedMotion,
  useResize,
  useScroll,
  useSpring,
  useSpringRef,
  useSpringValue,
  useSprings,
  useTrail,
  useTransition
}, Symbol.toStringTag, { value: "Module" }));
var isCustomPropRE = /^--/;
function dangerousStyleValue(name, value2) {
  if (value2 == null || typeof value2 === "boolean" || value2 === "")
    return "";
  if (typeof value2 === "number" && value2 !== 0 && !isCustomPropRE.test(name) && !(isUnitlessNumber.hasOwnProperty(name) && isUnitlessNumber[name]))
    return value2 + "px";
  return ("" + value2).trim();
}
var attributeCache = {};
function applyAnimatedValues(instance, props) {
  if (!instance.nodeType || !instance.setAttribute) {
    return false;
  }
  const isFilterElement = instance.nodeName === "filter" || instance.parentNode && instance.parentNode.nodeName === "filter";
  const { style, children, scrollTop, scrollLeft, viewBox, ...attributes } = props;
  const values = Object.values(attributes);
  const names = Object.keys(attributes).map(
    (name) => isFilterElement || instance.hasAttribute(name) ? name : attributeCache[name] || (attributeCache[name] = name.replace(
      /([A-Z])/g,
      // Attributes are written in dash case
      (n) => "-" + n.toLowerCase()
    ))
  );
  if (children !== void 0) {
    instance.textContent = children;
  }
  for (const name in style) {
    if (style.hasOwnProperty(name)) {
      const value2 = dangerousStyleValue(name, style[name]);
      if (isCustomPropRE.test(name)) {
        instance.style.setProperty(name, value2);
      } else {
        instance.style[name] = value2;
      }
    }
  }
  names.forEach((name, i) => {
    instance.setAttribute(name, values[i]);
  });
  if (scrollTop !== void 0) {
    instance.scrollTop = scrollTop;
  }
  if (scrollLeft !== void 0) {
    instance.scrollLeft = scrollLeft;
  }
  if (viewBox !== void 0) {
    instance.setAttribute("viewBox", viewBox);
  }
}
var isUnitlessNumber = {
  animationIterationCount: true,
  borderImageOutset: true,
  borderImageSlice: true,
  borderImageWidth: true,
  boxFlex: true,
  boxFlexGroup: true,
  boxOrdinalGroup: true,
  columnCount: true,
  columns: true,
  flex: true,
  flexGrow: true,
  flexPositive: true,
  flexShrink: true,
  flexNegative: true,
  flexOrder: true,
  gridRow: true,
  gridRowEnd: true,
  gridRowSpan: true,
  gridRowStart: true,
  gridColumn: true,
  gridColumnEnd: true,
  gridColumnSpan: true,
  gridColumnStart: true,
  fontWeight: true,
  lineClamp: true,
  lineHeight: true,
  opacity: true,
  order: true,
  orphans: true,
  tabSize: true,
  widows: true,
  zIndex: true,
  zoom: true,
  // SVG-related properties
  fillOpacity: true,
  floodOpacity: true,
  stopOpacity: true,
  strokeDasharray: true,
  strokeDashoffset: true,
  strokeMiterlimit: true,
  strokeOpacity: true,
  strokeWidth: true
};
var prefixKey = (prefix2, key) => prefix2 + key.charAt(0).toUpperCase() + key.substring(1);
var prefixes = ["Webkit", "Ms", "Moz", "O"];
isUnitlessNumber = Object.keys(isUnitlessNumber).reduce((acc, prop) => {
  prefixes.forEach((prefix2) => acc[prefixKey(prefix2, prop)] = acc[prop]);
  return acc;
}, isUnitlessNumber);
var domTransforms = /^(matrix|translate|scale|rotate|skew)/;
var pxTransforms = /^(translate)/;
var degTransforms = /^(rotate|skew)/;
var addUnit = (value2, unit2) => is.num(value2) && value2 !== 0 ? value2 + unit2 : value2;
var isValueIdentity = (value2, id) => is.arr(value2) ? value2.every((v) => isValueIdentity(v, id)) : is.num(value2) ? value2 === id : parseFloat(value2) === id;
var AnimatedStyle = class extends AnimatedObject {
  constructor({ x: x2, y: y2, z, ...style }) {
    const inputs = [];
    const transforms = [];
    if (x2 || y2 || z) {
      inputs.push([x2 || 0, y2 || 0, z || 0]);
      transforms.push((xyz) => [
        `translate3d(${xyz.map((v) => addUnit(v, "px")).join(",")})`,
        // prettier-ignore
        isValueIdentity(xyz, 0)
      ]);
    }
    eachProp(style, (value2, key) => {
      if (key === "transform") {
        inputs.push([value2 || ""]);
        transforms.push((transform2) => [transform2, transform2 === ""]);
      } else if (domTransforms.test(key)) {
        delete style[key];
        if (is.und(value2))
          return;
        const unit2 = pxTransforms.test(key) ? "px" : degTransforms.test(key) ? "deg" : "";
        inputs.push(toArray(value2));
        transforms.push(
          key === "rotate3d" ? ([x22, y22, z2, deg]) => [
            `rotate3d(${x22},${y22},${z2},${addUnit(deg, unit2)})`,
            isValueIdentity(deg, 0)
          ] : (input) => [
            `${key}(${input.map((v) => addUnit(v, unit2)).join(",")})`,
            isValueIdentity(input, key.startsWith("scale") ? 1 : 0)
          ]
        );
      }
    });
    if (inputs.length) {
      style.transform = new FluidTransform(inputs, transforms);
    }
    super(style);
  }
};
var FluidTransform = class extends FluidValue {
  constructor(inputs, transforms) {
    super();
    this.inputs = inputs;
    this.transforms = transforms;
    this._value = null;
  }
  get() {
    return this._value || (this._value = this._get());
  }
  _get() {
    let transform2 = "";
    let identity2 = true;
    each(this.inputs, (input, i) => {
      const arg1 = getFluidValue(input[0]);
      const [t, id] = this.transforms[i](
        is.arr(arg1) ? arg1 : input.map(getFluidValue)
      );
      transform2 += " " + t;
      identity2 = identity2 && id;
    });
    return identity2 ? "none" : transform2;
  }
  // Start observing our inputs once we have an observer.
  observerAdded(count2) {
    if (count2 == 1)
      each(
        this.inputs,
        (input) => each(
          input,
          (value2) => hasFluidValue(value2) && addFluidObserver(value2, this)
        )
      );
  }
  // Stop observing our inputs once we have no observers.
  observerRemoved(count2) {
    if (count2 == 0)
      each(
        this.inputs,
        (input) => each(
          input,
          (value2) => hasFluidValue(value2) && removeFluidObserver(value2, this)
        )
      );
  }
  eventObserved(event) {
    if (event.type == "change") {
      this._value = null;
    }
    callFluidObservers(this, event);
  }
};
var primitives = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "big",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rp",
  "rt",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "var",
  "video",
  "wbr",
  // SVG
  "circle",
  "clipPath",
  "defs",
  "ellipse",
  "foreignObject",
  "g",
  "image",
  "line",
  "linearGradient",
  "mask",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "stop",
  "svg",
  "text",
  "tspan"
];
globals_exports.assign({
  batchedUpdates: reactDomExports.unstable_batchedUpdates,
  createStringInterpolator: createStringInterpolator2,
  colors: colors2
});
var host = createHost(primitives, {
  applyAnimatedValues,
  createAnimatedStyle: (style) => new AnimatedStyle(style),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getComponentProps: ({ scrollTop, scrollLeft, ...props }) => props
});
var animated = host.animated;
var Axis$1 = {};
const require$$4$1 = /* @__PURE__ */ getAugmentedNamespace(esm$4);
const require$$6 = /* @__PURE__ */ getAugmentedNamespace(esm$1);
var AxisRenderer$1 = {};
function setNumberOrNumberAccessor$2(func, value2) {
  if (typeof value2 === "number") func(value2);
  else func(value2);
}
var STACK_ORDERS$1 = {
  ascending: stackOrderAscending,
  descending: stackOrderDescending,
  insideout: stackOrderInsideOut,
  none: stackOrderNone,
  reverse: stackOrderReverse
};
var STACK_ORDER_NAMES$1 = Object.keys(STACK_ORDERS$1);
function stackOrder$2(order) {
  return order && STACK_ORDERS$1[order] || STACK_ORDERS$1.none;
}
var STACK_OFFSETS$1 = {
  expand: stackOffsetExpand,
  diverging: stackOffsetDiverging,
  none: stackOffsetNone,
  silhouette: stackOffsetSilhouette,
  wiggle: stackOffsetWiggle
};
var STACK_OFFSET_NAMES$1 = Object.keys(STACK_OFFSETS$1);
function stackOffset$2(offset) {
  return offset && STACK_OFFSETS$1[offset] || STACK_OFFSETS$1.none;
}
function arc$1(_temp) {
  var _ref = _temp === void 0 ? {} : _temp, innerRadius = _ref.innerRadius, outerRadius = _ref.outerRadius, cornerRadius = _ref.cornerRadius, startAngle = _ref.startAngle, endAngle = _ref.endAngle, padAngle = _ref.padAngle, padRadius = _ref.padRadius;
  var path2 = d3Arc();
  if (innerRadius != null) setNumberOrNumberAccessor$2(path2.innerRadius, innerRadius);
  if (outerRadius != null) setNumberOrNumberAccessor$2(path2.outerRadius, outerRadius);
  if (cornerRadius != null) setNumberOrNumberAccessor$2(path2.cornerRadius, cornerRadius);
  if (startAngle != null) setNumberOrNumberAccessor$2(path2.startAngle, startAngle);
  if (endAngle != null) setNumberOrNumberAccessor$2(path2.endAngle, endAngle);
  if (padAngle != null) setNumberOrNumberAccessor$2(path2.padAngle, padAngle);
  if (padRadius != null) setNumberOrNumberAccessor$2(path2.padRadius, padRadius);
  return path2;
}
function area$1(_temp2) {
  var _ref2 = _temp2 === void 0 ? {} : _temp2, x2 = _ref2.x, x0 = _ref2.x0, x1 = _ref2.x1, y2 = _ref2.y, y0 = _ref2.y0, y1 = _ref2.y1, defined = _ref2.defined, curve = _ref2.curve;
  var path2 = d3Area();
  if (x2) setNumberOrNumberAccessor$2(path2.x, x2);
  if (x0) setNumberOrNumberAccessor$2(path2.x0, x0);
  if (x1) setNumberOrNumberAccessor$2(path2.x1, x1);
  if (y2) setNumberOrNumberAccessor$2(path2.y, y2);
  if (y0) setNumberOrNumberAccessor$2(path2.y0, y0);
  if (y1) setNumberOrNumberAccessor$2(path2.y1, y1);
  if (defined) path2.defined(defined);
  if (curve) path2.curve(curve);
  return path2;
}
function line$1(_temp3) {
  var _ref3 = _temp3 === void 0 ? {} : _temp3, x2 = _ref3.x, y2 = _ref3.y, defined = _ref3.defined, curve = _ref3.curve;
  var path2 = d3Line();
  if (x2) setNumberOrNumberAccessor$2(path2.x, x2);
  if (y2) setNumberOrNumberAccessor$2(path2.y, y2);
  if (defined) path2.defined(defined);
  if (curve) path2.curve(curve);
  return path2;
}
function pie$1(_temp4) {
  var _ref4 = _temp4 === void 0 ? {} : _temp4, startAngle = _ref4.startAngle, endAngle = _ref4.endAngle, padAngle = _ref4.padAngle, value2 = _ref4.value, sort2 = _ref4.sort, sortValues = _ref4.sortValues;
  var path2 = d3Pie();
  if (sort2 === null) path2.sort(sort2);
  else if (sort2 != null) path2.sort(sort2);
  if (sortValues === null) path2.sortValues(sortValues);
  else if (sortValues != null) path2.sortValues(sortValues);
  if (value2 != null) path2.value(value2);
  if (padAngle != null) setNumberOrNumberAccessor$2(path2.padAngle, padAngle);
  if (startAngle != null) setNumberOrNumberAccessor$2(path2.startAngle, startAngle);
  if (endAngle != null) setNumberOrNumberAccessor$2(path2.endAngle, endAngle);
  return path2;
}
function radialLine$1(_temp5) {
  var _ref5 = _temp5 === void 0 ? {} : _temp5, angle = _ref5.angle, radius = _ref5.radius, defined = _ref5.defined, curve = _ref5.curve;
  var path2 = d3RadialLine();
  if (angle) setNumberOrNumberAccessor$2(path2.angle, angle);
  if (radius) setNumberOrNumberAccessor$2(path2.radius, radius);
  if (defined) path2.defined(defined);
  if (curve) path2.curve(curve);
  return path2;
}
function stack$1(_ref6) {
  var keys = _ref6.keys, value2 = _ref6.value, order = _ref6.order, offset = _ref6.offset;
  var path2 = d3stack();
  if (keys) path2.keys(keys);
  if (value2) setNumberOrNumberAccessor$2(path2.value, value2);
  if (order) path2.order(stackOrder$2(order));
  if (offset) path2.offset(stackOffset$2(offset));
  return path2;
}
var _excluded$A = ["className", "data", "innerRadius", "outerRadius", "cornerRadius", "startAngle", "endAngle", "padAngle", "padRadius", "children", "innerRef"];
function _extends$P() {
  _extends$P = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$P.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$A(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function Arc(_ref) {
  var className = _ref.className, data = _ref.data, innerRadius = _ref.innerRadius, outerRadius = _ref.outerRadius, cornerRadius = _ref.cornerRadius, startAngle = _ref.startAngle, endAngle = _ref.endAngle, padAngle = _ref.padAngle, padRadius = _ref.padRadius, children = _ref.children, innerRef = _ref.innerRef, restProps = _objectWithoutPropertiesLoose$A(_ref, _excluded$A);
  var path2 = arc$1({
    innerRadius,
    outerRadius,
    cornerRadius,
    startAngle,
    endAngle,
    padAngle,
    padRadius
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: path2
  }));
  if (!data && (startAngle == null || endAngle == null || innerRadius == null || outerRadius == null)) {
    console.warn("[@visx/shape/Arc]: expected data because one of startAngle, endAngle, innerRadius, outerRadius is undefined. Bailing.");
    return null;
  }
  return /* @__PURE__ */ React.createElement("path", _extends$P({
    ref: innerRef,
    className: cx("visx-arc", className),
    d: path2(data) || ""
  }, restProps));
}
var _excluded$z = ["className", "top", "left", "data", "centroid", "innerRadius", "outerRadius", "cornerRadius", "startAngle", "endAngle", "padAngle", "padRadius", "pieSort", "pieSortValues", "pieValue", "children", "fill"];
function _extends$O() {
  _extends$O = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$O.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$z(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function Pie(_ref) {
  var className = _ref.className, top = _ref.top, left = _ref.left, _ref$data = _ref.data, data = _ref$data === void 0 ? [] : _ref$data, centroid = _ref.centroid, _ref$innerRadius = _ref.innerRadius, innerRadius = _ref$innerRadius === void 0 ? 0 : _ref$innerRadius, outerRadius = _ref.outerRadius, cornerRadius = _ref.cornerRadius, startAngle = _ref.startAngle, endAngle = _ref.endAngle, padAngle = _ref.padAngle, padRadius = _ref.padRadius, pieSort = _ref.pieSort, pieSortValues = _ref.pieSortValues, pieValue = _ref.pieValue, children = _ref.children, _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "" : _ref$fill, restProps = _objectWithoutPropertiesLoose$z(_ref, _excluded$z);
  var path2 = arc$1({
    innerRadius,
    outerRadius,
    cornerRadius,
    padRadius
  });
  var pie2 = pie$1({
    startAngle,
    endAngle,
    padAngle,
    value: pieValue,
    sort: pieSort,
    sortValues: pieSortValues
  });
  var arcs = pie2(data);
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    arcs,
    path: path2,
    pie: pie2
  }));
  return /* @__PURE__ */ React.createElement(Group, {
    className: "visx-pie-arcs-group",
    top,
    left
  }, arcs.map(function(arc2, i) {
    return /* @__PURE__ */ React.createElement("g", {
      key: "pie-arc-" + i
    }, /* @__PURE__ */ React.createElement("path", _extends$O({
      className: cx("visx-pie-arc", className),
      d: path2(arc2) || "",
      fill: fill == null || typeof fill === "string" ? fill : fill(arc2)
    }, restProps)), centroid == null ? void 0 : centroid(path2.centroid(arc2), arc2));
  }));
}
var _excluded$y = ["from", "to", "fill", "className", "innerRef"];
function _extends$N() {
  _extends$N = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$N.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$y(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function Line(_ref) {
  var _ref$from = _ref.from, from = _ref$from === void 0 ? {
    x: 0,
    y: 0
  } : _ref$from, _ref$to = _ref.to, to2 = _ref$to === void 0 ? {
    x: 1,
    y: 1
  } : _ref$to, _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "transparent" : _ref$fill, className = _ref.className, innerRef = _ref.innerRef, restProps = _objectWithoutPropertiesLoose$y(_ref, _excluded$y);
  var isRectilinear = from.x === to2.x || from.y === to2.y;
  return /* @__PURE__ */ React.createElement("line", _extends$N({
    ref: innerRef,
    className: cx("visx-line", className),
    x1: from.x,
    y1: from.y,
    x2: to2.x,
    y2: to2.y,
    fill,
    shapeRendering: isRectilinear ? "crispEdges" : "auto"
  }, restProps));
}
var _excluded$x = ["children", "data", "x", "y", "fill", "className", "curve", "innerRef", "defined"];
function _extends$M() {
  _extends$M = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$M.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$x(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function LinePath$1(_ref) {
  var children = _ref.children, _ref$data = _ref.data, data = _ref$data === void 0 ? [] : _ref$data, x2 = _ref.x, y2 = _ref.y, _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "transparent" : _ref$fill, className = _ref.className, curve = _ref.curve, innerRef = _ref.innerRef, _ref$defined = _ref.defined, defined = _ref$defined === void 0 ? function() {
    return true;
  } : _ref$defined, restProps = _objectWithoutPropertiesLoose$x(_ref, _excluded$x);
  var path2 = line$1({
    x: x2,
    y: y2,
    defined,
    curve
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: path2
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$M({
    ref: innerRef,
    className: cx("visx-linepath", className),
    d: path2(data) || "",
    fill,
    strokeLinecap: "round"
  }, restProps));
}
var _excluded$w = ["className", "angle", "radius", "defined", "curve", "data", "innerRef", "children", "fill"];
function _extends$L() {
  _extends$L = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$L.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$w(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function LineRadial(_ref) {
  var className = _ref.className, angle = _ref.angle, radius = _ref.radius, defined = _ref.defined, curve = _ref.curve, _ref$data = _ref.data, data = _ref$data === void 0 ? [] : _ref$data, innerRef = _ref.innerRef, children = _ref.children, _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "transparent" : _ref$fill, restProps = _objectWithoutPropertiesLoose$w(_ref, _excluded$w);
  var path2 = radialLine$1({
    angle,
    radius,
    defined,
    curve
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: path2
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$L({
    ref: innerRef,
    className: cx("visx-line-radial", className),
    d: path2(data) || "",
    fill
  }, restProps));
}
var _excluded$v = ["children", "x", "x0", "x1", "y", "y0", "y1", "data", "defined", "className", "curve", "innerRef"];
function _extends$K() {
  _extends$K = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$K.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$v(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function Area(_ref) {
  var children = _ref.children, x2 = _ref.x, x0 = _ref.x0, x1 = _ref.x1, y2 = _ref.y, y0 = _ref.y0, y1 = _ref.y1, _ref$data = _ref.data, data = _ref$data === void 0 ? [] : _ref$data, _ref$defined = _ref.defined, defined = _ref$defined === void 0 ? function() {
    return true;
  } : _ref$defined, className = _ref.className, curve = _ref.curve, innerRef = _ref.innerRef, restProps = _objectWithoutPropertiesLoose$v(_ref, _excluded$v);
  var path2 = area$1({
    x: x2,
    x0,
    x1,
    y: y2,
    y0,
    y1,
    defined,
    curve
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: path2
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$K({
    ref: innerRef,
    className: cx("visx-area", className),
    d: path2(data) || ""
  }, restProps));
}
var _excluded$u = ["x", "x0", "x1", "y", "y1", "y0", "yScale", "data", "defined", "className", "curve", "innerRef", "children"];
function _extends$J() {
  _extends$J = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$J.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$u(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function AreaClosed(_ref) {
  var x2 = _ref.x, x0 = _ref.x0, x1 = _ref.x1, y2 = _ref.y, y1 = _ref.y1, y0 = _ref.y0, yScale = _ref.yScale, _ref$data = _ref.data, data = _ref$data === void 0 ? [] : _ref$data, _ref$defined = _ref.defined, defined = _ref$defined === void 0 ? function() {
    return true;
  } : _ref$defined, className = _ref.className, curve = _ref.curve, innerRef = _ref.innerRef, children = _ref.children, restProps = _objectWithoutPropertiesLoose$u(_ref, _excluded$u);
  var path2 = area$1({
    x: x2,
    x0,
    x1,
    defined,
    curve
  });
  if (y0 == null) {
    path2.y0(yScale.range()[0]);
  } else {
    setNumberOrNumberAccessor$2(path2.y0, y0);
  }
  if (y2 && !y1) setNumberOrNumberAccessor$2(path2.y1, y2);
  if (y1 && !y2) setNumberOrNumberAccessor$2(path2.y1, y1);
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: path2
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$J({
    ref: innerRef,
    className: cx("visx-area-closed", className),
    d: path2(data) || ""
  }, restProps));
}
var _excluded$t = ["className", "top", "left", "keys", "data", "curve", "defined", "x", "x0", "x1", "y0", "y1", "value", "order", "offset", "color", "children"];
function _extends$I() {
  _extends$I = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$I.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$t(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function Stack(_ref) {
  var className = _ref.className, top = _ref.top, left = _ref.left, keys = _ref.keys, data = _ref.data, curve = _ref.curve, defined = _ref.defined, x2 = _ref.x, x0 = _ref.x0, x1 = _ref.x1, y0 = _ref.y0, y1 = _ref.y1, value2 = _ref.value, order = _ref.order, offset = _ref.offset, color2 = _ref.color, children = _ref.children, restProps = _objectWithoutPropertiesLoose$t(_ref, _excluded$t);
  var stack2 = stack$1({
    keys,
    value: value2,
    order,
    offset
  });
  var path2 = area$1({
    x: x2,
    x0,
    x1,
    y0,
    y1,
    curve,
    defined
  });
  var stacks = stack2(data);
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    stacks,
    path: path2,
    stack: stack2
  }));
  return /* @__PURE__ */ React.createElement(Group, {
    top,
    left
  }, stacks.map(function(series, i) {
    return /* @__PURE__ */ React.createElement("path", _extends$I({
      className: cx("visx-stack", className),
      key: "stack-" + i + "-" + (series.key || ""),
      d: path2(series) || "",
      fill: color2 == null ? void 0 : color2(series.key, i)
    }, restProps));
  }));
}
var _excluded$s = ["className", "top", "left", "keys", "data", "curve", "defined", "x", "x0", "x1", "y0", "y1", "value", "order", "offset", "color", "children"];
function _extends$H() {
  _extends$H = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$H.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$s(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function AreaStack(_ref) {
  var className = _ref.className, top = _ref.top, left = _ref.left, keys = _ref.keys, data = _ref.data, curve = _ref.curve, defined = _ref.defined, x2 = _ref.x, x0 = _ref.x0, x1 = _ref.x1, y0 = _ref.y0, y1 = _ref.y1, value2 = _ref.value, order = _ref.order, offset = _ref.offset, color2 = _ref.color, children = _ref.children, restProps = _objectWithoutPropertiesLoose$s(_ref, _excluded$s);
  return /* @__PURE__ */ React.createElement(Stack, _extends$H({
    className,
    top,
    left,
    keys,
    data,
    curve,
    defined,
    x: x2,
    x0,
    x1,
    y0,
    y1,
    value: value2,
    order,
    offset,
    color: color2
  }, restProps), children || function(_ref2) {
    var stacks = _ref2.stacks, path2 = _ref2.path;
    return stacks.map(function(series, i) {
      return /* @__PURE__ */ React.createElement("path", _extends$H({
        className: cx("visx-area-stack", className),
        key: "area-stack-" + i + "-" + (series.key || ""),
        d: path2(series) || "",
        fill: color2 == null ? void 0 : color2(series.key, i)
      }, restProps));
    });
  });
}
var _excluded$r = ["className", "innerRef"];
function _extends$G() {
  _extends$G = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$G.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$r(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function Bar(_ref) {
  var className = _ref.className, innerRef = _ref.innerRef, restProps = _objectWithoutPropertiesLoose$r(_ref, _excluded$r);
  return /* @__PURE__ */ React.createElement("rect", _extends$G({
    ref: innerRef,
    className: cx("visx-bar", className)
  }, restProps));
}
var _excluded$q = ["children", "className", "innerRef", "x", "y", "width", "height", "radius", "all", "top", "bottom", "left", "right", "topLeft", "topRight", "bottomLeft", "bottomRight"];
function _extends$F() {
  _extends$F = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$F.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$q(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function useBarRoundedPath(_ref) {
  var all = _ref.all, bottom = _ref.bottom, bottomLeft = _ref.bottomLeft, bottomRight = _ref.bottomRight, height = _ref.height, left = _ref.left, radius = _ref.radius, right = _ref.right, top = _ref.top, topLeft = _ref.topLeft, topRight = _ref.topRight, width = _ref.width, x2 = _ref.x, y2 = _ref.y;
  topRight = all || top || right || topRight;
  bottomRight = all || bottom || right || bottomRight;
  bottomLeft = all || bottom || left || bottomLeft;
  topLeft = all || top || left || topLeft;
  radius = Math.max(1, Math.min(radius, Math.min(width, height) / 2));
  var diameter = 2 * radius;
  var path2 = ("M" + (x2 + radius) + "," + y2 + " h" + (width - diameter) + "\n " + (topRight ? "a" + radius + "," + radius + " 0 0 1 " + radius + "," + radius : "h" + radius + "v" + radius) + "\n v" + (height - diameter) + "\n " + (bottomRight ? "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + radius : "v" + radius + "h" + -radius) + "\n h" + (diameter - width) + "\n " + (bottomLeft ? "a" + radius + "," + radius + " 0 0 1 " + -radius + "," + -radius : "h" + -radius + "v" + -radius) + "\n v" + (diameter - height) + "\n " + (topLeft ? "a" + radius + "," + radius + " 0 0 1 " + radius + "," + -radius : "v" + -radius + "h" + radius) + "\nz").split("\n").join("");
  return path2;
}
function BarRounded(_ref2) {
  var children = _ref2.children, className = _ref2.className, innerRef = _ref2.innerRef, x2 = _ref2.x, y2 = _ref2.y, width = _ref2.width, height = _ref2.height, radius = _ref2.radius, _ref2$all = _ref2.all, all = _ref2$all === void 0 ? false : _ref2$all, _ref2$top = _ref2.top, top = _ref2$top === void 0 ? false : _ref2$top, _ref2$bottom = _ref2.bottom, bottom = _ref2$bottom === void 0 ? false : _ref2$bottom, _ref2$left = _ref2.left, left = _ref2$left === void 0 ? false : _ref2$left, _ref2$right = _ref2.right, right = _ref2$right === void 0 ? false : _ref2$right, _ref2$topLeft = _ref2.topLeft, topLeft = _ref2$topLeft === void 0 ? false : _ref2$topLeft, _ref2$topRight = _ref2.topRight, topRight = _ref2$topRight === void 0 ? false : _ref2$topRight, _ref2$bottomLeft = _ref2.bottomLeft, bottomLeft = _ref2$bottomLeft === void 0 ? false : _ref2$bottomLeft, _ref2$bottomRight = _ref2.bottomRight, bottomRight = _ref2$bottomRight === void 0 ? false : _ref2$bottomRight, restProps = _objectWithoutPropertiesLoose$q(_ref2, _excluded$q);
  var path2 = useBarRoundedPath({
    x: x2,
    y: y2,
    width,
    height,
    radius,
    all,
    top,
    bottom,
    left,
    right,
    topLeft,
    topRight,
    bottomLeft,
    bottomRight
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: path2
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$F({
    ref: innerRef,
    className: cx("visx-bar-rounded", className),
    d: path2
  }, restProps));
}
function getBandwidth(scale) {
  if ("bandwidth" in scale) {
    return scale.bandwidth();
  }
  var range2 = scale.range();
  var domain2 = scale.domain();
  return Math.abs(range2[range2.length - 1] - range2[0]) / domain2.length;
}
var _excluded$p = ["data", "className", "top", "left", "x0", "x0Scale", "x1Scale", "yScale", "color", "keys", "height", "children"];
function _extends$E() {
  _extends$E = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$E.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$p(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function BarGroup(_ref) {
  var data = _ref.data, className = _ref.className, top = _ref.top, left = _ref.left, x0 = _ref.x0, x0Scale = _ref.x0Scale, x1Scale = _ref.x1Scale, yScale = _ref.yScale, color2 = _ref.color, keys = _ref.keys, height = _ref.height, children = _ref.children, restProps = _objectWithoutPropertiesLoose$p(_ref, _excluded$p);
  var barWidth = getBandwidth(x1Scale);
  var barGroups = data.map(function(group2, i) {
    return {
      index: i,
      x0: x0Scale(x0(group2)),
      bars: keys.map(function(key, j) {
        var value2 = group2[key];
        return {
          index: j,
          key,
          value: value2,
          width: barWidth,
          x: x1Scale(key) || 0,
          y: yScale(value2) || 0,
          color: color2(key, j),
          height: height - (yScale(value2) || 0)
        };
      })
    };
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children(barGroups));
  return /* @__PURE__ */ React.createElement(Group, {
    className: cx("visx-bar-group", className),
    top,
    left
  }, barGroups.map(function(barGroup) {
    return /* @__PURE__ */ React.createElement(Group, {
      key: "bar-group-" + barGroup.index + "-" + barGroup.x0,
      left: barGroup.x0
    }, barGroup.bars.map(function(bar) {
      return /* @__PURE__ */ React.createElement(Bar, _extends$E({
        key: "bar-group-bar-" + barGroup.index + "-" + bar.index + "-" + bar.value + "-" + bar.key,
        x: bar.x,
        y: bar.y,
        width: bar.width,
        height: bar.height,
        fill: bar.color
      }, restProps));
    }));
  }));
}
var _excluded$o = ["data", "className", "top", "left", "x", "y0", "y0Scale", "y1Scale", "xScale", "color", "keys", "width", "children"];
function _extends$D() {
  _extends$D = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$D.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$o(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function BarGroupHorizontal(_ref) {
  var data = _ref.data, className = _ref.className, top = _ref.top, left = _ref.left, _ref$x = _ref.x, x2 = _ref$x === void 0 ? function() {
    return 0;
  } : _ref$x, y0 = _ref.y0, y0Scale = _ref.y0Scale, y1Scale = _ref.y1Scale, xScale = _ref.xScale, color2 = _ref.color, keys = _ref.keys;
  _ref.width;
  var children = _ref.children, restProps = _objectWithoutPropertiesLoose$o(_ref, _excluded$o);
  var barHeight = getBandwidth(y1Scale);
  var barGroups = data.map(function(group2, i) {
    return {
      index: i,
      y0: y0Scale(y0(group2)) || 0,
      bars: keys.map(function(key, j) {
        var value2 = group2[key];
        return {
          index: j,
          key,
          value: value2,
          height: barHeight,
          x: x2(value2) || 0,
          y: y1Scale(key) || 0,
          color: color2(key, j),
          width: xScale(value2) || 0
        };
      })
    };
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children(barGroups));
  return /* @__PURE__ */ React.createElement(Group, {
    className: cx("visx-bar-group-horizontal", className),
    top,
    left
  }, barGroups.map(function(barGroup) {
    return /* @__PURE__ */ React.createElement(Group, {
      key: "bar-group-" + barGroup.index + "-" + barGroup.y0,
      top: barGroup.y0
    }, barGroup.bars.map(function(bar) {
      return /* @__PURE__ */ React.createElement(Bar, _extends$D({
        key: "bar-group-bar-" + barGroup.index + "-" + bar.index + "-" + bar.value + "-" + bar.key,
        x: bar.x,
        y: bar.y,
        width: bar.width,
        height: bar.height,
        fill: bar.color
      }, restProps));
    }));
  }));
}
function getX$1(l) {
  return typeof (l == null ? void 0 : l.x) === "number" ? l == null ? void 0 : l.x : 0;
}
function getY$1(l) {
  return typeof (l == null ? void 0 : l.y) === "number" ? l == null ? void 0 : l.y : 0;
}
function getSource(l) {
  return l == null ? void 0 : l.source;
}
function getTarget(l) {
  return l == null ? void 0 : l.target;
}
function getFirstItem(d) {
  return d == null ? void 0 : d[0];
}
function getSecondItem(d) {
  return d == null ? void 0 : d[1];
}
var _excluded$n = ["data", "className", "top", "left", "x", "y0", "y1", "xScale", "yScale", "color", "keys", "value", "order", "offset", "children"];
function _extends$C() {
  _extends$C = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$C.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$n(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function BarStack(_ref) {
  var data = _ref.data, className = _ref.className, top = _ref.top, left = _ref.left, x2 = _ref.x, _ref$y = _ref.y0, y0 = _ref$y === void 0 ? getFirstItem : _ref$y, _ref$y2 = _ref.y1, y1 = _ref$y2 === void 0 ? getSecondItem : _ref$y2, xScale = _ref.xScale, yScale = _ref.yScale, color2 = _ref.color, keys = _ref.keys, value2 = _ref.value, order = _ref.order, offset = _ref.offset, children = _ref.children, restProps = _objectWithoutPropertiesLoose$n(_ref, _excluded$n);
  var stack2 = d3stack();
  if (keys) stack2.keys(keys);
  if (value2) setNumberOrNumberAccessor$2(stack2.value, value2);
  if (order) stack2.order(stackOrder$2(order));
  if (offset) stack2.offset(stackOffset$2(offset));
  var stacks = stack2(data);
  var barWidth = getBandwidth(xScale);
  var barStacks = stacks.map(function(barStack, i) {
    var key = barStack.key;
    return {
      index: i,
      key,
      bars: barStack.map(function(bar, j) {
        var barHeight = (yScale(y0(bar)) || 0) - (yScale(y1(bar)) || 0);
        var barY = yScale(y1(bar));
        var barX = "bandwidth" in xScale ? xScale(x2(bar.data)) : Math.max((xScale(x2(bar.data)) || 0) - barWidth / 2);
        return {
          bar,
          key,
          index: j,
          height: barHeight,
          width: barWidth,
          x: barX || 0,
          y: barY || 0,
          color: color2(barStack.key, j)
        };
      })
    };
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children(barStacks));
  return /* @__PURE__ */ React.createElement(Group, {
    className: cx("visx-bar-stack", className),
    top,
    left
  }, barStacks.map(function(barStack) {
    return barStack.bars.map(function(bar) {
      return /* @__PURE__ */ React.createElement(Bar, _extends$C({
        key: "bar-stack-" + barStack.index + "-" + bar.index,
        x: bar.x,
        y: bar.y,
        height: bar.height,
        width: bar.width,
        fill: bar.color
      }, restProps));
    });
  }));
}
var _excluded$m = ["data", "className", "top", "left", "y", "x0", "x1", "xScale", "yScale", "color", "keys", "value", "order", "offset", "children"];
function _extends$B() {
  _extends$B = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$B.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$m(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function BarStackHorizontal(_ref) {
  var data = _ref.data, className = _ref.className, top = _ref.top, left = _ref.left, y2 = _ref.y, _ref$x = _ref.x0, x0 = _ref$x === void 0 ? getFirstItem : _ref$x, _ref$x2 = _ref.x1, x1 = _ref$x2 === void 0 ? getSecondItem : _ref$x2, xScale = _ref.xScale, yScale = _ref.yScale, color2 = _ref.color, keys = _ref.keys, value2 = _ref.value, order = _ref.order, offset = _ref.offset, children = _ref.children, restProps = _objectWithoutPropertiesLoose$m(_ref, _excluded$m);
  var stack2 = d3stack();
  if (keys) stack2.keys(keys);
  if (value2) setNumberOrNumberAccessor$2(stack2.value, value2);
  if (order) stack2.order(stackOrder$2(order));
  if (offset) stack2.offset(stackOffset$2(offset));
  var stacks = stack2(data);
  var barHeight = getBandwidth(yScale);
  var barStacks = stacks.map(function(barStack, i) {
    var key = barStack.key;
    return {
      index: i,
      key,
      bars: barStack.map(function(bar, j) {
        var barWidth = (xScale(x1(bar)) || 0) - (xScale(x0(bar)) || 0);
        var barX = xScale(x0(bar));
        var barY = "bandwidth" in yScale ? yScale(y2(bar.data)) : Math.max((yScale(y2(bar.data)) || 0) - barWidth / 2);
        return {
          bar,
          key,
          index: j,
          height: barHeight,
          width: barWidth,
          x: barX || 0,
          y: barY || 0,
          color: color2(barStack.key, j)
        };
      })
    };
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children(barStacks));
  return /* @__PURE__ */ React.createElement(Group, {
    className: cx("visx-bar-stack-horizontal", className),
    top,
    left
  }, barStacks.map(function(barStack) {
    return barStack.bars.map(function(bar) {
      return /* @__PURE__ */ React.createElement(Bar, _extends$B({
        key: "bar-stack-" + barStack.index + "-" + bar.index,
        x: bar.x,
        y: bar.y,
        height: bar.height,
        width: bar.width,
        fill: bar.color
      }, restProps));
    });
  }));
}
var degreesToRadians = function degreesToRadians2(degrees2) {
  return Math.PI / 180 * degrees2;
};
var _excluded$l = ["className", "children", "data", "innerRef", "path", "x", "y", "source", "target"];
function _extends$A() {
  _extends$A = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$A.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$l(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathHorizontalDiagonal(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y;
  return function(data) {
    var link2 = linkHorizontal();
    link2.x(x2);
    link2.y(y2);
    link2.source(source);
    link2.target(target);
    return link2(data);
  };
}
function LinkHorizontalDiagonal(_ref2) {
  var className = _ref2.className, children = _ref2.children, data = _ref2.data, innerRef = _ref2.innerRef, path2 = _ref2.path, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getY$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getX$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, restProps = _objectWithoutPropertiesLoose$l(_ref2, _excluded$l);
  var pathGen = path2 || pathHorizontalDiagonal({
    source,
    target,
    x: x2,
    y: y2
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$A({
    ref: innerRef,
    className: cx("visx-link visx-link-horizontal-diagonal", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$k = ["className", "children", "data", "innerRef", "path", "x", "y", "source", "target"];
function _extends$z() {
  _extends$z = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$z.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$k(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathVerticalDiagonal(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y;
  return function(data) {
    var link2 = linkVertical();
    link2.x(x2);
    link2.y(y2);
    link2.source(source);
    link2.target(target);
    return link2(data);
  };
}
function LinkVerticalDiagonal(_ref2) {
  var className = _ref2.className, children = _ref2.children, data = _ref2.data, innerRef = _ref2.innerRef, path2 = _ref2.path, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getX$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getY$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, restProps = _objectWithoutPropertiesLoose$k(_ref2, _excluded$k);
  var pathGen = path2 || pathVerticalDiagonal({
    source,
    target,
    x: x2,
    y: y2
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$z({
    ref: innerRef,
    className: cx("visx-link visx-link-vertical-diagonal", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$j = ["className", "children", "data", "innerRef", "path", "angle", "radius", "source", "target"];
function _extends$y() {
  _extends$y = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$y.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$j(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathRadialDiagonal(_ref) {
  var source = _ref.source, target = _ref.target, angle = _ref.angle, radius = _ref.radius;
  return function(data) {
    var link2 = linkRadial();
    link2.angle(angle);
    link2.radius(radius);
    link2.source(source);
    link2.target(target);
    return link2(data);
  };
}
function LinkRadialDiagonal(_ref2) {
  var className = _ref2.className, children = _ref2.children, data = _ref2.data, innerRef = _ref2.innerRef, path2 = _ref2.path, _ref2$angle = _ref2.angle, angle = _ref2$angle === void 0 ? getX$1 : _ref2$angle, _ref2$radius = _ref2.radius, radius = _ref2$radius === void 0 ? getY$1 : _ref2$radius, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, restProps = _objectWithoutPropertiesLoose$j(_ref2, _excluded$j);
  var pathGen = path2 || pathRadialDiagonal({
    source,
    target,
    angle,
    radius
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$y({
    ref: innerRef,
    className: cx("visx-link visx-link-radial-diagonal", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$i = ["className", "children", "data", "innerRef", "path", "percent", "x", "y", "source", "target"];
function _extends$x() {
  _extends$x = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$x.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$i(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathHorizontalCurve(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y, percent = _ref.percent;
  return function(link2) {
    var sourceData = source(link2);
    var targetData = target(link2);
    var sx = x2(sourceData);
    var sy = y2(sourceData);
    var tx = x2(targetData);
    var ty = y2(targetData);
    var dx = tx - sx;
    var dy = ty - sy;
    var ix = percent * (dx + dy);
    var iy = percent * (dy - dx);
    var path$1 = path();
    path$1.moveTo(sx, sy);
    path$1.bezierCurveTo(sx + ix, sy + iy, tx + iy, ty - ix, tx, ty);
    return path$1.toString();
  };
}
function LinkHorizontalCurve(_ref2) {
  var className = _ref2.className, children = _ref2.children, data = _ref2.data, innerRef = _ref2.innerRef, path2 = _ref2.path, _ref2$percent = _ref2.percent, percent = _ref2$percent === void 0 ? 0.2 : _ref2$percent, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getY$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getX$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, restProps = _objectWithoutPropertiesLoose$i(_ref2, _excluded$i);
  var pathGen = path2 || pathHorizontalCurve({
    source,
    target,
    x: x2,
    y: y2,
    percent
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$x({
    ref: innerRef,
    className: cx("visx-link visx-link-horizontal-curve", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$h = ["className", "children", "data", "innerRef", "path", "percent", "x", "y", "source", "target"];
function _extends$w() {
  _extends$w = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$w.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$h(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathVerticalCurve(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y, percent = _ref.percent;
  return function(link2) {
    var sourceData = source(link2);
    var targetData = target(link2);
    var sx = x2(sourceData);
    var sy = y2(sourceData);
    var tx = x2(targetData);
    var ty = y2(targetData);
    var dx = tx - sx;
    var dy = ty - sy;
    var ix = percent * (dx + dy);
    var iy = percent * (dy - dx);
    var path$1 = path();
    path$1.moveTo(sx, sy);
    path$1.bezierCurveTo(sx + ix, sy + iy, tx + iy, ty - ix, tx, ty);
    return path$1.toString();
  };
}
function LinkVerticalCurve(_ref2) {
  var className = _ref2.className, children = _ref2.children, data = _ref2.data, innerRef = _ref2.innerRef, path2 = _ref2.path, _ref2$percent = _ref2.percent, percent = _ref2$percent === void 0 ? 0.2 : _ref2$percent, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getX$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getY$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, restProps = _objectWithoutPropertiesLoose$h(_ref2, _excluded$h);
  var pathGen = path2 || pathVerticalCurve({
    source,
    target,
    x: x2,
    y: y2,
    percent
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$w({
    ref: innerRef,
    className: cx("visx-link visx-link-vertical-curve", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$g = ["className", "children", "data", "innerRef", "path", "percent", "x", "y", "source", "target"];
function _extends$v() {
  _extends$v = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$v.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$g(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathRadialCurve(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y, percent = _ref.percent;
  return function(link2) {
    var sourceData = source(link2);
    var targetData = target(link2);
    var sa = x2(sourceData) - Math.PI / 2;
    var sr = y2(sourceData);
    var ta = x2(targetData) - Math.PI / 2;
    var tr = y2(targetData);
    var sc = Math.cos(sa);
    var ss = Math.sin(sa);
    var tc = Math.cos(ta);
    var ts2 = Math.sin(ta);
    var sx = sr * sc;
    var sy = sr * ss;
    var tx = tr * tc;
    var ty = tr * ts2;
    var dx = tx - sx;
    var dy = ty - sy;
    var ix = percent * (dx + dy);
    var iy = percent * (dy - dx);
    var path$1 = path();
    path$1.moveTo(sx, sy);
    path$1.bezierCurveTo(sx + ix, sy + iy, tx + iy, ty - ix, tx, ty);
    return path$1.toString();
  };
}
function LinkRadialCurve(_ref2) {
  var className = _ref2.className, children = _ref2.children, data = _ref2.data, innerRef = _ref2.innerRef, path2 = _ref2.path, _ref2$percent = _ref2.percent, percent = _ref2$percent === void 0 ? 0.2 : _ref2$percent, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getX$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getY$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, restProps = _objectWithoutPropertiesLoose$g(_ref2, _excluded$g);
  var pathGen = path2 || pathRadialCurve({
    source,
    target,
    x: x2,
    y: y2,
    percent
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$v({
    ref: innerRef,
    className: cx("visx-link visx-link-radial-curve", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$f = ["className", "children", "innerRef", "data", "path", "x", "y", "source", "target"];
function _extends$u() {
  _extends$u = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$u.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$f(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathHorizontalLine(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y;
  return function(data) {
    var sourceData = source(data);
    var targetData = target(data);
    var sx = x2(sourceData);
    var sy = y2(sourceData);
    var tx = x2(targetData);
    var ty = y2(targetData);
    var path$1 = path();
    path$1.moveTo(sx, sy);
    path$1.lineTo(tx, ty);
    return path$1.toString();
  };
}
function LinkHorizontalLine(_ref2) {
  var className = _ref2.className, children = _ref2.children, innerRef = _ref2.innerRef, data = _ref2.data, path2 = _ref2.path, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getY$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getX$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, restProps = _objectWithoutPropertiesLoose$f(_ref2, _excluded$f);
  var pathGen = path2 || pathHorizontalLine({
    source,
    target,
    x: x2,
    y: y2
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$u({
    ref: innerRef,
    className: cx("visx-link visx-link-horizontal-line", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$e = ["className", "innerRef", "data", "path", "x", "y", "source", "target", "children"];
function _extends$t() {
  _extends$t = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$t.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$e(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathVerticalLine(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y;
  return function(data) {
    var sourceData = source(data);
    var targetData = target(data);
    var sx = x2(sourceData);
    var sy = y2(sourceData);
    var tx = x2(targetData);
    var ty = y2(targetData);
    var path$1 = path();
    path$1.moveTo(sx, sy);
    path$1.lineTo(tx, ty);
    return path$1.toString();
  };
}
function LinkVerticalLine(_ref2) {
  var className = _ref2.className, innerRef = _ref2.innerRef, data = _ref2.data, path2 = _ref2.path, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getX$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getY$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, children = _ref2.children, restProps = _objectWithoutPropertiesLoose$e(_ref2, _excluded$e);
  var pathGen = path2 || pathVerticalLine({
    source,
    target,
    x: x2,
    y: y2
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$t({
    ref: innerRef,
    className: cx("visx-link visx-link-vertical-line", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$d = ["className", "innerRef", "data", "path", "x", "y", "source", "target", "children"];
function _extends$s() {
  _extends$s = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$s.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$d(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathRadialLine(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y;
  return function(data) {
    var sourceData = source(data);
    var targetData = target(data);
    var sa = x2(sourceData) - Math.PI / 2;
    var sr = y2(sourceData);
    var ta = x2(targetData) - Math.PI / 2;
    var tr = y2(targetData);
    var sc = Math.cos(sa);
    var ss = Math.sin(sa);
    var tc = Math.cos(ta);
    var ts2 = Math.sin(ta);
    var path$1 = path();
    path$1.moveTo(sr * sc, sr * ss);
    path$1.lineTo(tr * tc, tr * ts2);
    return path$1.toString();
  };
}
function LinkRadialLine(_ref2) {
  var className = _ref2.className, innerRef = _ref2.innerRef, data = _ref2.data, path2 = _ref2.path, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getX$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getY$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, children = _ref2.children, restProps = _objectWithoutPropertiesLoose$d(_ref2, _excluded$d);
  var pathGen = path2 || pathRadialLine({
    source,
    target,
    x: x2,
    y: y2
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$s({
    ref: innerRef,
    className: cx("visx-link visx-link-radial-line", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$c = ["className", "innerRef", "data", "path", "percent", "x", "y", "source", "target", "children"];
function _extends$r() {
  _extends$r = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$r.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$c(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathHorizontalStep(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y, percent = _ref.percent;
  return function(link2) {
    var sourceData = source(link2);
    var targetData = target(link2);
    var sx = x2(sourceData);
    var sy = y2(sourceData);
    var tx = x2(targetData);
    var ty = y2(targetData);
    var path$1 = path();
    path$1.moveTo(sx, sy);
    path$1.lineTo(sx + (tx - sx) * percent, sy);
    path$1.lineTo(sx + (tx - sx) * percent, ty);
    path$1.lineTo(tx, ty);
    return path$1.toString();
  };
}
function LinkHorizontalStep(_ref2) {
  var className = _ref2.className, innerRef = _ref2.innerRef, data = _ref2.data, path2 = _ref2.path, _ref2$percent = _ref2.percent, percent = _ref2$percent === void 0 ? 0.5 : _ref2$percent, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getY$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getX$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, children = _ref2.children, restProps = _objectWithoutPropertiesLoose$c(_ref2, _excluded$c);
  var pathGen = path2 || pathHorizontalStep({
    source,
    target,
    x: x2,
    y: y2,
    percent
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$r({
    ref: innerRef,
    className: cx("visx-link visx-link-horizontal-step", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$b = ["className", "innerRef", "data", "path", "percent", "x", "y", "source", "target", "children"];
function _extends$q() {
  _extends$q = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$q.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$b(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathVerticalStep(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y, percent = _ref.percent;
  return function(link2) {
    var sourceData = source(link2);
    var targetData = target(link2);
    var sx = x2(sourceData);
    var sy = y2(sourceData);
    var tx = x2(targetData);
    var ty = y2(targetData);
    var path$1 = path();
    path$1.moveTo(sx, sy);
    path$1.lineTo(sx, sy + (ty - sy) * percent);
    path$1.lineTo(tx, sy + (ty - sy) * percent);
    path$1.lineTo(tx, ty);
    return path$1.toString();
  };
}
function LinkVerticalStep(_ref2) {
  var className = _ref2.className, innerRef = _ref2.innerRef, data = _ref2.data, path2 = _ref2.path, _ref2$percent = _ref2.percent, percent = _ref2$percent === void 0 ? 0.5 : _ref2$percent, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getX$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getY$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, children = _ref2.children, restProps = _objectWithoutPropertiesLoose$b(_ref2, _excluded$b);
  var pathGen = path2 || pathVerticalStep({
    source,
    target,
    x: x2,
    y: y2,
    percent
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$q({
    ref: innerRef,
    className: cx("visx-link visx-link-vertical-step", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$a = ["className", "innerRef", "data", "path", "x", "y", "source", "target", "children"];
function _extends$p() {
  _extends$p = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$p.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$a(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function pathRadialStep(_ref) {
  var source = _ref.source, target = _ref.target, x2 = _ref.x, y2 = _ref.y;
  return function(link2) {
    var sourceData = source(link2);
    var targetData = target(link2);
    var sx = x2(sourceData);
    var sy = y2(sourceData);
    var tx = x2(targetData);
    var ty = y2(targetData);
    var sa = sx - Math.PI / 2;
    var sr = sy;
    var ta = tx - Math.PI / 2;
    var tr = ty;
    var sc = Math.cos(sa);
    var ss = Math.sin(sa);
    var tc = Math.cos(ta);
    var ts2 = Math.sin(ta);
    var sf = Math.abs(ta - sa) > Math.PI ? ta <= sa : ta > sa;
    return "\n      M" + sr * sc + "," + sr * ss + "\n      A" + sr + "," + sr + ",0,0," + (sf ? 1 : 0) + "," + sr * tc + "," + sr * ts2 + "\n      L" + tr * tc + "," + tr * ts2 + "\n    ";
  };
}
function LinkRadialStep(_ref2) {
  var className = _ref2.className, innerRef = _ref2.innerRef, data = _ref2.data, path2 = _ref2.path, _ref2$x = _ref2.x, x2 = _ref2$x === void 0 ? getX$1 : _ref2$x, _ref2$y = _ref2.y, y2 = _ref2$y === void 0 ? getY$1 : _ref2$y, _ref2$source = _ref2.source, source = _ref2$source === void 0 ? getSource : _ref2$source, _ref2$target = _ref2.target, target = _ref2$target === void 0 ? getTarget : _ref2$target, children = _ref2.children, restProps = _objectWithoutPropertiesLoose$a(_ref2, _excluded$a);
  var pathGen = path2 || pathRadialStep({
    source,
    target,
    x: x2,
    y: y2
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    path: pathGen
  }));
  return /* @__PURE__ */ React.createElement("path", _extends$p({
    ref: innerRef,
    className: cx("visx-link visx-link-radial-step", className),
    d: pathGen(data) || ""
  }, restProps));
}
var _excluded$9 = ["sides", "size", "center", "rotate", "className", "children", "innerRef", "points"];
function _extends$o() {
  _extends$o = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$o.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$9(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
var DEFAULT_CENTER = {
  x: 0,
  y: 0
};
var getPoint = function getPoint2(_ref) {
  var _ref$sides = _ref.sides, sides = _ref$sides === void 0 ? 4 : _ref$sides, _ref$size = _ref.size, size = _ref$size === void 0 ? 25 : _ref$size, _ref$center = _ref.center, center = _ref$center === void 0 ? DEFAULT_CENTER : _ref$center, _ref$rotate = _ref.rotate, rotate = _ref$rotate === void 0 ? 0 : _ref$rotate, side = _ref.side;
  var degrees2 = 360 / sides * side - rotate;
  var radians2 = degreesToRadians(degrees2);
  return {
    x: center.x + size * Math.cos(radians2),
    y: center.y + size * Math.sin(radians2)
  };
};
var getPoints = function getPoints2(_ref2) {
  var sides = _ref2.sides, size = _ref2.size, center = _ref2.center, rotate = _ref2.rotate;
  return new Array(sides).fill(0).map(function(_, side) {
    return getPoint({
      sides,
      size,
      center,
      rotate,
      side
    });
  });
};
function Polygon(_ref3) {
  var _ref3$sides = _ref3.sides, sides = _ref3$sides === void 0 ? 4 : _ref3$sides, _ref3$size = _ref3.size, size = _ref3$size === void 0 ? 25 : _ref3$size, _ref3$center = _ref3.center, center = _ref3$center === void 0 ? DEFAULT_CENTER : _ref3$center, _ref3$rotate = _ref3.rotate, rotate = _ref3$rotate === void 0 ? 0 : _ref3$rotate, className = _ref3.className, children = _ref3.children, innerRef = _ref3.innerRef, points = _ref3.points, restProps = _objectWithoutPropertiesLoose$9(_ref3, _excluded$9);
  var pointsToRender = points || getPoints({
    sides,
    size,
    center,
    rotate
  }).map(function(_ref4) {
    var x2 = _ref4.x, y2 = _ref4.y;
    return [x2, y2];
  });
  if (children) return /* @__PURE__ */ React.createElement(React.Fragment, null, children({
    points: pointsToRender
  }));
  return /* @__PURE__ */ React.createElement("polygon", _extends$o({
    ref: innerRef,
    className: cx("visx-polygon", className),
    points: pointsToRender.join(" ")
  }, restProps));
}
var _excluded$8 = ["className", "innerRef"];
function _extends$n() {
  _extends$n = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$n.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$8(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function Circle(_ref) {
  var className = _ref.className, innerRef = _ref.innerRef, restProps = _objectWithoutPropertiesLoose$8(_ref, _excluded$8);
  return /* @__PURE__ */ React.createElement("circle", _extends$n({
    ref: innerRef,
    className: cx("visx-circle", className)
  }, restProps));
}
var SVG_NAMESPACE_URL = "http://www.w3.org/2000/svg";
function getOrCreateMeasurementElement(elementId) {
  var pathElement = document.getElementById(elementId);
  if (!pathElement) {
    var svg = document.createElementNS(SVG_NAMESPACE_URL, "svg");
    svg.setAttribute("aria-hidden", "true");
    svg.style.opacity = "0";
    svg.style.width = "0";
    svg.style.height = "0";
    svg.style.position = "absolute";
    svg.style.top = "-100%";
    svg.style.left = "-100%";
    svg.style.pointerEvents = "none";
    pathElement = document.createElementNS(SVG_NAMESPACE_URL, "path");
    pathElement.setAttribute("id", elementId);
    svg.appendChild(pathElement);
    document.body.appendChild(svg);
  }
  return pathElement;
}
var MEASUREMENT_ELEMENT_ID = "__visx_splitpath_svg_path_measurement_id";
var TRUE = function TRUE2() {
  return true;
};
function getSplitLineSegments(_ref) {
  var path2 = _ref.path, pointsInSegments = _ref.pointsInSegments, _ref$segmentation = _ref.segmentation, segmentation = _ref$segmentation === void 0 ? "x" : _ref$segmentation, _ref$sampleRate = _ref.sampleRate, sampleRate = _ref$sampleRate === void 0 ? 1 : _ref$sampleRate;
  try {
    var pathElement = getOrCreateMeasurementElement(MEASUREMENT_ELEMENT_ID);
    pathElement.setAttribute("d", path2);
    var totalLength = pathElement.getTotalLength();
    var numSegments = pointsInSegments.length;
    var lineSegments = pointsInSegments.map(function() {
      return [];
    });
    if (segmentation === "x" || segmentation === "y") {
      var segmentStarts = pointsInSegments.map(function(points) {
        var _points$find;
        return (_points$find = points.find(function(p) {
          return typeof p[segmentation] === "number";
        })) == null ? void 0 : _points$find[segmentation];
      });
      var first = pathElement.getPointAtLength(0);
      var last = pathElement.getPointAtLength(totalLength);
      var isIncreasing = last[segmentation] > first[segmentation];
      var isBeyondSegmentStart = isIncreasing ? segmentStarts.map(function(start2) {
        return typeof start2 === "undefined" ? TRUE : function(xOrY) {
          return xOrY >= start2;
        };
      }) : segmentStarts.map(function(start2) {
        return typeof start2 === "undefined" ? TRUE : function(xOrY) {
          return xOrY <= start2;
        };
      });
      var currentSegment = 0;
      for (var distance = 0; distance <= totalLength; distance += sampleRate) {
        var sample = pathElement.getPointAtLength(distance);
        var position = sample[segmentation];
        while (currentSegment < numSegments - 1 && isBeyondSegmentStart[currentSegment + 1](position)) {
          currentSegment += 1;
        }
        lineSegments[currentSegment].push(sample);
      }
    } else {
      var numPointsInSegment = pointsInSegments.map(function(points) {
        return points.length;
      });
      var numPoints = numPointsInSegment.reduce(function(sum2, curr) {
        return sum2 + curr;
      }, 0);
      var lengthBetweenPoints = totalLength / Math.max(1, numPoints - 1);
      var _segmentStarts = numPointsInSegment.slice(0, numSegments - 1);
      _segmentStarts.unshift(0);
      for (var i = 2; i < numSegments; i += 1) {
        _segmentStarts[i] += _segmentStarts[i - 1];
      }
      for (var _i = 0; _i < numSegments; _i += 1) {
        _segmentStarts[_i] *= lengthBetweenPoints;
      }
      var _currentSegment = 0;
      for (var _distance = 0; _distance <= totalLength; _distance += sampleRate) {
        var _sample = pathElement.getPointAtLength(_distance);
        while (_currentSegment < numSegments - 1 && _distance >= _segmentStarts[_currentSegment + 1]) {
          _currentSegment += 1;
        }
        lineSegments[_currentSegment].push(_sample);
      }
    }
    return lineSegments;
  } catch (e) {
    return [];
  }
}
function _extends$m() {
  _extends$m = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$m.apply(this, arguments);
}
var getX = function getX2(d) {
  return d.x || 0;
};
var getY = function getY2(d) {
  return d.y || 0;
};
function SplitLinePath(_ref) {
  var children = _ref.children, className = _ref.className, curve = _ref.curve, defined = _ref.defined, segmentation = _ref.segmentation, sampleRate = _ref.sampleRate, segments = _ref.segments, x2 = _ref.x, y2 = _ref.y, styles = _ref.styles;
  var pointsInSegments = reactExports.useMemo(function() {
    var xFn = typeof x2 === "number" || typeof x2 === "undefined" ? function() {
      return x2;
    } : x2;
    var yFn = typeof y2 === "number" || typeof y2 === "undefined" ? function() {
      return y2;
    } : y2;
    return segments.map(function(s2) {
      return s2.map(function(value2, i) {
        return {
          x: xFn(value2, i, s2),
          y: yFn(value2, i, s2)
        };
      });
    });
  }, [x2, y2, segments]);
  var pathString = reactExports.useMemo(function() {
    var path2 = line$1({
      x: x2,
      y: y2,
      defined,
      curve
    });
    return path2(segments.flat()) || "";
  }, [x2, y2, defined, curve, segments]);
  var splitLineSegments = reactExports.useMemo(function() {
    return getSplitLineSegments({
      path: pathString,
      segmentation,
      pointsInSegments,
      sampleRate
    });
  }, [pathString, segmentation, pointsInSegments, sampleRate]);
  return /* @__PURE__ */ React.createElement("g", null, splitLineSegments.map(function(segment, index2) {
    return children ? /* @__PURE__ */ React.createElement(React.Fragment, {
      key: index2
    }, children({
      index: index2,
      segment,
      styles: styles[index2] || styles[index2 % styles.length]
    })) : /* @__PURE__ */ React.createElement(LinePath$1, _extends$m({
      key: index2,
      className,
      data: segment,
      x: getX,
      y: getY
    }, styles[index2] || styles[index2 % styles.length]));
  }));
}
SplitLinePath.propTypes = {
  segments: _pt.arrayOf(_pt.array).isRequired,
  styles: _pt.array.isRequired,
  children: _pt.func,
  className: _pt.string
};
const esm = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Arc,
  Area,
  AreaClosed,
  AreaStack,
  Bar,
  BarGroup,
  BarGroupHorizontal,
  BarRounded,
  BarStack,
  BarStackHorizontal,
  Circle,
  Line,
  LinePath: LinePath$1,
  LineRadial,
  LinkHorizontal: LinkHorizontalDiagonal,
  LinkHorizontalCurve,
  LinkHorizontalLine,
  LinkHorizontalStep,
  LinkRadial: LinkRadialDiagonal,
  LinkRadialCurve,
  LinkRadialLine,
  LinkRadialStep,
  LinkVertical: LinkVerticalDiagonal,
  LinkVerticalCurve,
  LinkVerticalLine,
  LinkVerticalStep,
  Pie,
  Polygon,
  STACK_OFFSETS: STACK_OFFSETS$1,
  STACK_OFFSET_NAMES: STACK_OFFSET_NAMES$1,
  STACK_ORDERS: STACK_ORDERS$1,
  STACK_ORDER_NAMES: STACK_ORDER_NAMES$1,
  SplitLinePath,
  Stack,
  arc: arc$1,
  area: area$1,
  degreesToRadians,
  getPoint,
  getPoints,
  line: line$1,
  pathHorizontalCurve,
  pathHorizontalDiagonal,
  pathHorizontalLine,
  pathHorizontalStep,
  pathRadialCurve,
  pathRadialDiagonal,
  pathRadialLine,
  pathRadialStep,
  pathVerticalCurve,
  pathVerticalDiagonal,
  pathVerticalLine,
  pathVerticalStep,
  pie: pie$1,
  radialLine: radialLine$1,
  stack: stack$1,
  stackOffset: stackOffset$2,
  stackOrder: stackOrder$2
}, Symbol.toStringTag, { value: "Module" }));
const require$$2$1 = /* @__PURE__ */ getAugmentedNamespace(esm);
const require$$4 = /* @__PURE__ */ getAugmentedNamespace(esm$3);
var getLabelTransform$1 = {};
var orientation = {};
orientation.__esModule = true;
orientation.default = void 0;
var Orientation = {
  top: "top",
  left: "left",
  right: "right",
  bottom: "bottom"
};
var _default$4 = Orientation;
orientation.default = _default$4;
getLabelTransform$1.__esModule = true;
getLabelTransform$1.default = getLabelTransform;
var _orientation$4 = _interopRequireDefault$d(orientation);
function _interopRequireDefault$d(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function getLabelTransform(_ref) {
  var labelOffset = _ref.labelOffset, labelProps = _ref.labelProps, orientation2 = _ref.orientation, range2 = _ref.range, tickLabelFontSize = _ref.tickLabelFontSize, tickLength = _ref.tickLength;
  var sign2 = orientation2 === _orientation$4.default.left || orientation2 === _orientation$4.default.top ? -1 : 1;
  var x2;
  var y2;
  var transform2;
  if (orientation2 === _orientation$4.default.top || orientation2 === _orientation$4.default.bottom) {
    var yBottomOffset = orientation2 === _orientation$4.default.bottom && typeof labelProps.fontSize === "number" ? labelProps.fontSize : 0;
    x2 = (Number(range2[0]) + Number(range2[range2.length - 1])) / 2;
    y2 = sign2 * (tickLength + labelOffset + tickLabelFontSize + yBottomOffset);
  } else {
    x2 = sign2 * ((Number(range2[0]) + Number(range2[range2.length - 1])) / 2);
    y2 = -(tickLength + labelOffset);
    transform2 = "rotate(" + sign2 * 90 + ")";
  }
  return {
    x: x2,
    y: y2,
    transform: transform2
  };
}
var Ticks$1 = {};
Ticks$1.__esModule = true;
Ticks$1.default = Ticks;
var _react$8 = _interopRequireDefault$c(reactExports);
var _classnames$4 = _interopRequireDefault$c(classnamesExports);
var _shape$1 = require$$2$1;
var _group$1 = require$$4$1;
var _text$2 = require$$4;
var _orientation$3 = _interopRequireDefault$c(orientation);
function _interopRequireDefault$c(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _extends$l() {
  _extends$l = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$l.apply(this, arguments);
}
function Ticks(_ref) {
  var hideTicks = _ref.hideTicks, horizontal = _ref.horizontal, orientation2 = _ref.orientation, tickClassName = _ref.tickClassName, tickComponent = _ref.tickComponent, allTickLabelProps = _ref.tickLabelProps, _ref$tickStroke = _ref.tickStroke, tickStroke = _ref$tickStroke === void 0 ? "#222" : _ref$tickStroke, tickTransform = _ref.tickTransform, ticks2 = _ref.ticks, strokeWidth = _ref.strokeWidth, tickLineProps = _ref.tickLineProps;
  return ticks2.map(function(_ref2) {
    var _allTickLabelProps$in;
    var value2 = _ref2.value, index2 = _ref2.index, from = _ref2.from, to2 = _ref2.to, formattedValue = _ref2.formattedValue;
    var tickLabelProps = (_allTickLabelProps$in = allTickLabelProps[index2]) != null ? _allTickLabelProps$in : {};
    var tickLabelFontSize = Math.max(10, typeof tickLabelProps.fontSize === "number" && tickLabelProps.fontSize || 0);
    var tickYCoord = to2.y + (horizontal && orientation2 !== _orientation$3.default.top ? tickLabelFontSize : 0);
    return /* @__PURE__ */ _react$8.default.createElement(_group$1.Group, {
      key: "visx-tick-" + value2 + "-" + index2,
      className: (0, _classnames$4.default)("visx-axis-tick", tickClassName),
      transform: tickTransform
    }, !hideTicks && /* @__PURE__ */ _react$8.default.createElement(_shape$1.Line, _extends$l({
      from,
      to: to2,
      stroke: tickStroke,
      strokeWidth,
      strokeLinecap: "square"
    }, tickLineProps)), tickComponent ? tickComponent(_extends$l({}, tickLabelProps, {
      x: to2.x,
      y: tickYCoord,
      formattedValue
    })) : /* @__PURE__ */ _react$8.default.createElement(_text$2.Text, _extends$l({
      x: to2.x,
      y: tickYCoord
    }, tickLabelProps), formattedValue));
  });
}
AxisRenderer$1.__esModule = true;
AxisRenderer$1.default = AxisRenderer;
var _react$7 = _interopRequireDefault$b(reactExports);
var _classnames$3 = _interopRequireDefault$b(classnamesExports);
var _shape = require$$2$1;
var _text$1 = require$$4;
var _getLabelTransform = _interopRequireDefault$b(getLabelTransform$1);
var _orientation$2 = _interopRequireDefault$b(orientation);
var _Ticks = _interopRequireDefault$b(Ticks$1);
function _interopRequireDefault$b(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _extends$k() {
  _extends$k = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$k.apply(this, arguments);
}
var defaultTextProps = {
  textAnchor: "middle",
  fontFamily: "Arial",
  fontSize: 10,
  fill: "#222"
};
function AxisRenderer(_ref) {
  var axisFromPoint = _ref.axisFromPoint, axisLineClassName = _ref.axisLineClassName, axisToPoint = _ref.axisToPoint, hideAxisLine = _ref.hideAxisLine, hideTicks = _ref.hideTicks, horizontal = _ref.horizontal, _ref$label = _ref.label, label = _ref$label === void 0 ? "" : _ref$label, labelClassName = _ref.labelClassName, _ref$labelOffset = _ref.labelOffset, labelOffset = _ref$labelOffset === void 0 ? 14 : _ref$labelOffset, labelProps = _ref.labelProps, _ref$orientation = _ref.orientation, orientation2 = _ref$orientation === void 0 ? _orientation$2.default.bottom : _ref$orientation, scale = _ref.scale, _ref$stroke = _ref.stroke, stroke = _ref$stroke === void 0 ? "#222" : _ref$stroke, strokeDasharray = _ref.strokeDasharray, _ref$strokeWidth = _ref.strokeWidth, strokeWidth = _ref$strokeWidth === void 0 ? 1 : _ref$strokeWidth, tickClassName = _ref.tickClassName, tickComponent = _ref.tickComponent, tickLineProps = _ref.tickLineProps, tickLabelProps = _ref.tickLabelProps, _ref$tickLength = _ref.tickLength, tickLength = _ref$tickLength === void 0 ? 8 : _ref$tickLength, _ref$tickStroke = _ref.tickStroke, tickStroke = _ref$tickStroke === void 0 ? "#222" : _ref$tickStroke, tickTransform = _ref.tickTransform, ticks2 = _ref.ticks, _ref$ticksComponent = _ref.ticksComponent, ticksComponent = _ref$ticksComponent === void 0 ? _Ticks.default : _ref$ticksComponent;
  var combinedLabelProps = _extends$k({}, defaultTextProps, labelProps);
  var tickLabelPropsDefault = _extends$k({}, defaultTextProps, typeof tickLabelProps === "object" ? tickLabelProps : null);
  var allTickLabelProps = ticks2.map(function(_ref2) {
    var value2 = _ref2.value, index2 = _ref2.index;
    return typeof tickLabelProps === "function" ? tickLabelProps(value2, index2, ticks2) : tickLabelPropsDefault;
  });
  var maxTickLabelFontSize = Math.max.apply(Math, [10].concat(allTickLabelProps.map(function(props) {
    return typeof props.fontSize === "number" ? props.fontSize : 0;
  })));
  return /* @__PURE__ */ _react$7.default.createElement(_react$7.default.Fragment, null, ticksComponent({
    hideTicks,
    horizontal,
    orientation: orientation2,
    scale,
    tickClassName,
    tickComponent,
    tickLabelProps: allTickLabelProps,
    tickStroke,
    tickTransform,
    ticks: ticks2,
    strokeWidth,
    tickLineProps
  }), !hideAxisLine && /* @__PURE__ */ _react$7.default.createElement(_shape.Line, {
    className: (0, _classnames$3.default)("visx-axis-line", axisLineClassName),
    from: axisFromPoint,
    to: axisToPoint,
    stroke,
    strokeWidth,
    strokeDasharray
  }), label && /* @__PURE__ */ _react$7.default.createElement(_text$1.Text, _extends$k({
    className: (0, _classnames$3.default)("visx-axis-label", labelClassName)
  }, (0, _getLabelTransform.default)({
    labelOffset,
    labelProps: combinedLabelProps,
    orientation: orientation2,
    range: scale.range(),
    tickLabelFontSize: maxTickLabelFontSize,
    tickLength
  }), combinedLabelProps), label));
}
var getTickPosition$1 = {};
getTickPosition$1.__esModule = true;
getTickPosition$1.default = getTickPosition;
function getTickPosition(scale, align2) {
  if (align2 === void 0) {
    align2 = "center";
  }
  var s2 = scale;
  if (align2 !== "start" && "bandwidth" in s2) {
    var offset = s2.bandwidth();
    if (align2 === "center") offset /= 2;
    if (s2.round()) offset = Math.round(offset);
    return function(d) {
      var scaledValue = s2(d);
      return typeof scaledValue === "number" ? scaledValue + offset : scaledValue;
    };
  }
  return scale;
}
var getTickFormatter$1 = {};
getTickFormatter$1.__esModule = true;
getTickFormatter$1.default = getTickFormatter;
var _scale$2 = require$$6;
function getTickFormatter(scale) {
  var s2 = scale;
  if ("tickFormat" in s2) {
    return s2.tickFormat();
  }
  return _scale$2.toString;
}
var createPoint$1 = {};
createPoint$1.__esModule = true;
createPoint$1.default = createPoint;
var _point = require$$5;
function createPoint(_ref, horizontal) {
  var x2 = _ref.x, y2 = _ref.y;
  return new _point.Point(horizontal ? {
    x: x2,
    y: y2
  } : {
    x: y2,
    y: x2
  });
}
var getAxisRangePaddingConfig$1 = {};
getAxisRangePaddingConfig$1.__esModule = true;
getAxisRangePaddingConfig$1.default = getAxisRangePaddingConfig;
getAxisRangePaddingConfig$1.defaultAxisRangePadding = void 0;
function _extends$j() {
  _extends$j = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$j.apply(this, arguments);
}
var defaultAxisRangePadding = 0;
getAxisRangePaddingConfig$1.defaultAxisRangePadding = defaultAxisRangePadding;
function getAxisRangePaddingConfig(originalRangePadding) {
  if (originalRangePadding === void 0) {
    originalRangePadding = defaultAxisRangePadding;
  }
  return typeof originalRangePadding === "number" ? {
    start: originalRangePadding,
    end: originalRangePadding
  } : _extends$j({
    start: defaultAxisRangePadding,
    end: defaultAxisRangePadding
  }, originalRangePadding);
}
Axis$1.__esModule = true;
Axis$1.default = Axis;
_interopRequireDefault$a(propTypesExports);
var _react$6 = _interopRequireDefault$a(reactExports);
var _classnames$2 = _interopRequireDefault$a(classnamesExports);
var _group = require$$4$1;
var _scale$1 = require$$6;
var _AxisRenderer = _interopRequireDefault$a(AxisRenderer$1);
var _getTickPosition = _interopRequireDefault$a(getTickPosition$1);
var _getTickFormatter = _interopRequireDefault$a(getTickFormatter$1);
var _createPoint = _interopRequireDefault$a(createPoint$1);
var _orientation$1 = _interopRequireDefault$a(orientation);
var _getAxisRangePaddingConfig = _interopRequireDefault$a(getAxisRangePaddingConfig$1);
var _excluded$7 = ["children", "axisClassName", "hideAxisLine", "hideTicks", "hideZero", "innerRef", "left", "numTicks", "orientation", "rangePadding", "scale", "tickFormat", "tickLength", "tickValues", "top"];
function _interopRequireDefault$a(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _extends$i() {
  _extends$i = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$i.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$7(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function Axis(_ref) {
  var _ref$children = _ref.children, children = _ref$children === void 0 ? _AxisRenderer.default : _ref$children, axisClassName = _ref.axisClassName, _ref$hideAxisLine = _ref.hideAxisLine, hideAxisLine = _ref$hideAxisLine === void 0 ? false : _ref$hideAxisLine, _ref$hideTicks = _ref.hideTicks, hideTicks = _ref$hideTicks === void 0 ? false : _ref$hideTicks, _ref$hideZero = _ref.hideZero, hideZero = _ref$hideZero === void 0 ? false : _ref$hideZero, innerRef = _ref.innerRef, _ref$left = _ref.left, left = _ref$left === void 0 ? 0 : _ref$left, _ref$numTicks = _ref.numTicks, numTicks = _ref$numTicks === void 0 ? 10 : _ref$numTicks, _ref$orientation = _ref.orientation, orientation2 = _ref$orientation === void 0 ? _orientation$1.default.bottom : _ref$orientation, _ref$rangePadding = _ref.rangePadding, rangePadding = _ref$rangePadding === void 0 ? 0 : _ref$rangePadding, scale = _ref.scale, tickFormat2 = _ref.tickFormat, _ref$tickLength = _ref.tickLength, tickLength = _ref$tickLength === void 0 ? 8 : _ref$tickLength, tickValues = _ref.tickValues, _ref$top = _ref.top, top = _ref$top === void 0 ? 0 : _ref$top, restProps = _objectWithoutPropertiesLoose$7(_ref, _excluded$7);
  var format2 = tickFormat2 != null ? tickFormat2 : (0, _getTickFormatter.default)(scale);
  var isLeft = orientation2 === _orientation$1.default.left;
  var isTop = orientation2 === _orientation$1.default.top;
  var horizontal = isTop || orientation2 === _orientation$1.default.bottom;
  var tickPosition = (0, _getTickPosition.default)(scale);
  var tickSign = isLeft || isTop ? -1 : 1;
  var range2 = scale.range();
  var rangePaddingConfig = (0, _getAxisRangePaddingConfig.default)(rangePadding);
  var axisFromPoint = (0, _createPoint.default)({
    x: Number(range2[0]) + 0.5 - rangePaddingConfig.start,
    y: 0
  }, horizontal);
  var axisToPoint = (0, _createPoint.default)({
    x: Number(range2[range2.length - 1]) + 0.5 + rangePaddingConfig.end,
    y: 0
  }, horizontal);
  var filteredTickValues = (tickValues != null ? tickValues : (0, _scale$1.getTicks)(scale, numTicks)).filter(function(value2) {
    return !hideZero || value2 !== 0 && value2 !== "0";
  }).map(function(value2, index2) {
    return {
      value: value2,
      index: index2
    };
  });
  var ticks2 = filteredTickValues.map(function(_ref2) {
    var value2 = _ref2.value, index2 = _ref2.index;
    var scaledValue = (0, _scale$1.coerceNumber)(tickPosition(value2));
    return {
      value: value2,
      index: index2,
      from: (0, _createPoint.default)({
        x: scaledValue,
        y: 0
      }, horizontal),
      to: (0, _createPoint.default)({
        x: scaledValue,
        y: tickLength * tickSign
      }, horizontal),
      formattedValue: format2(value2, index2, filteredTickValues)
    };
  });
  return /* @__PURE__ */ _react$6.default.createElement(_group.Group, {
    className: (0, _classnames$2.default)("visx-axis", axisClassName),
    innerRef,
    top,
    left
  }, children(_extends$i({}, restProps, {
    axisFromPoint,
    axisToPoint,
    hideAxisLine,
    hideTicks,
    hideZero,
    horizontal,
    numTicks,
    orientation: orientation2,
    rangePadding,
    scale,
    tickFormat: format2,
    tickLength,
    tickPosition,
    tickSign,
    ticks: ticks2
  })));
}
var AnimatedTicks$1 = {};
var cjs = { exports: {} };
var reactSpring_web_production_min = { exports: {} };
const require$$0$1 = /* @__PURE__ */ getAugmentedNamespace(reactSpring_core_modern);
const require$$2 = /* @__PURE__ */ getAugmentedNamespace(reactSpring_shared_modern);
const require$$3 = /* @__PURE__ */ getAugmentedNamespace(reactSpring_animated_modern);
(function(module) {
  var v = Object.defineProperty;
  var T = Object.getOwnPropertyDescriptor;
  var j = Object.getOwnPropertyNames;
  var R = Object.prototype.hasOwnProperty;
  var W = (t, e) => {
    for (var o in e) v(t, o, { get: e[o], enumerable: true });
  }, O = (t, e, o, i) => {
    if (e && typeof e == "object" || typeof e == "function") for (let s2 of j(e)) !R.call(t, s2) && s2 !== o && v(t, s2, { get: () => e[s2], enumerable: !(i = T(e, s2)) || i.enumerable });
    return t;
  }, l = (t, e, o) => (O(t, e, "default"), o && O(o, e, "default"));
  var _ = (t) => O(v({}, "__esModule", { value: true }), t);
  var u = {};
  W(u, { a: () => q, animated: () => q });
  module.exports = _(u);
  var S = require$$0$1, E2 = reactDomExports, x2 = require$$2, P = require$$3;
  var C2 = /^--/;
  function $(t, e) {
    return e == null || typeof e == "boolean" || e === "" ? "" : typeof e == "number" && e !== 0 && !C2.test(t) && !(h.hasOwnProperty(t) && h[t]) ? e + "px" : ("" + e).trim();
  }
  var A2 = {};
  function I(t, e) {
    if (!t.nodeType || !t.setAttribute) return false;
    let o = t.nodeName === "filter" || t.parentNode && t.parentNode.nodeName === "filter", { style: i, children: s2, scrollTop: d, scrollLeft: m, viewBox: p, ...a2 } = e, f = Object.values(a2), b = Object.keys(a2).map((n) => o || t.hasAttribute(n) ? n : A2[n] || (A2[n] = n.replace(/([A-Z])/g, (c6) => "-" + c6.toLowerCase())));
    s2 !== void 0 && (t.textContent = s2);
    for (let n in i) if (i.hasOwnProperty(n)) {
      let c6 = $(n, i[n]);
      C2.test(n) ? t.style.setProperty(n, c6) : t.style[n] = c6;
    }
    b.forEach((n, c6) => {
      t.setAttribute(n, f[c6]);
    }), d !== void 0 && (t.scrollTop = d), m !== void 0 && (t.scrollLeft = m), p !== void 0 && t.setAttribute("viewBox", p);
  }
  var h = { animationIterationCount: true, borderImageOutset: true, borderImageSlice: true, borderImageWidth: true, boxFlex: true, boxFlexGroup: true, boxOrdinalGroup: true, columnCount: true, columns: true, flex: true, flexGrow: true, flexPositive: true, flexShrink: true, flexNegative: true, flexOrder: true, gridRow: true, gridRowEnd: true, gridRowSpan: true, gridRowStart: true, gridColumn: true, gridColumnEnd: true, gridColumnSpan: true, gridColumnStart: true, fontWeight: true, lineClamp: true, lineHeight: true, opacity: true, order: true, orphans: true, tabSize: true, widows: true, zIndex: true, zoom: true, fillOpacity: true, floodOpacity: true, stopOpacity: true, strokeDasharray: true, strokeDashoffset: true, strokeMiterlimit: true, strokeOpacity: true, strokeWidth: true }, G = (t, e) => t + e.charAt(0).toUpperCase() + e.substring(1), M = ["Webkit", "Ms", "Moz", "O"];
  h = Object.keys(h).reduce((t, e) => (M.forEach((o) => t[G(o, e)] = t[e]), t), h);
  var F = require$$3, r = require$$2, N = /^(matrix|translate|scale|rotate|skew)/, U = /^(translate)/, D2 = /^(rotate|skew)/, k2 = (t, e) => r.is.num(t) && t !== 0 ? t + e : t, g = (t, e) => r.is.arr(t) ? t.every((o) => g(o, e)) : r.is.num(t) ? t === e : parseFloat(t) === e, y2 = class extends F.AnimatedObject {
    constructor({ x: e, y: o, z: i, ...s2 }) {
      let d = [], m = [];
      (e || o || i) && (d.push([e || 0, o || 0, i || 0]), m.push((p) => [`translate3d(${p.map((a2) => k2(a2, "px")).join(",")})`, g(p, 0)])), (0, r.eachProp)(s2, (p, a2) => {
        if (a2 === "transform") d.push([p || ""]), m.push((f) => [f, f === ""]);
        else if (N.test(a2)) {
          if (delete s2[a2], r.is.und(p)) return;
          let f = U.test(a2) ? "px" : D2.test(a2) ? "deg" : "";
          d.push((0, r.toArray)(p)), m.push(a2 === "rotate3d" ? ([b, n, c6, w]) => [`rotate3d(${b},${n},${c6},${k2(w, f)})`, g(w, 0)] : (b) => [`${a2}(${b.map((n) => k2(n, f)).join(",")})`, g(b, a2.startsWith("scale") ? 1 : 0)]);
        }
      }), d.length && (s2.transform = new V(d, m)), super(s2);
    }
  }, V = class extends r.FluidValue {
    constructor(o, i) {
      super();
      this.inputs = o;
      this.transforms = i;
      this._value = null;
    }
    get() {
      return this._value || (this._value = this._get());
    }
    _get() {
      let o = "", i = true;
      return (0, r.each)(this.inputs, (s2, d) => {
        let m = (0, r.getFluidValue)(s2[0]), [p, a2] = this.transforms[d](r.is.arr(m) ? m : s2.map(r.getFluidValue));
        o += " " + p, i = i && a2;
      }), i ? "none" : o;
    }
    observerAdded(o) {
      o == 1 && (0, r.each)(this.inputs, (i) => (0, r.each)(i, (s2) => (0, r.hasFluidValue)(s2) && (0, r.addFluidObserver)(s2, this)));
    }
    observerRemoved(o) {
      o == 0 && (0, r.each)(this.inputs, (i) => (0, r.each)(i, (s2) => (0, r.hasFluidValue)(s2) && (0, r.removeFluidObserver)(s2, this)));
    }
    eventObserved(o) {
      o.type == "change" && (this._value = null), (0, r.callFluidObservers)(this, o);
    }
  };
  var L = ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr", "circle", "clipPath", "defs", "ellipse", "foreignObject", "g", "image", "line", "linearGradient", "mask", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "text", "tspan"];
  l(u, require$$0$1, module.exports);
  S.Globals.assign({ batchedUpdates: E2.unstable_batchedUpdates, createStringInterpolator: x2.createStringInterpolator, colors: x2.colors });
  var H = (0, P.createHost)(L, { applyAnimatedValues: I, createAnimatedStyle: (t) => new y2(t), getComponentProps: ({ scrollTop: t, scrollLeft: e, ...o }) => o }), q = H.animated;
})(reactSpring_web_production_min);
var reactSpring_web_production_minExports = reactSpring_web_production_min.exports;
{
  cjs.exports = reactSpring_web_production_minExports;
}
var cjsExports = cjs.exports;
var useLineTransitionConfig$1 = {};
useLineTransitionConfig$1.__esModule = true;
useLineTransitionConfig$1.default = useLineTransitionConfig;
var _react$5 = reactExports;
var _scale = require$$6;
function animatedValue(animationTrajectory, positionOnScale, scaleMin, scaleMax, scaleHalfwayPoint) {
  var _ref;
  switch (animationTrajectory) {
    case "center":
      return scaleHalfwayPoint;
    case "min":
      return scaleMin != null ? scaleMin : 0;
    case "max":
      return scaleMax != null ? scaleMax : 0;
    case "outside":
    default:
      return (_ref = (positionOnScale != null ? positionOnScale : 0) < scaleHalfwayPoint ? scaleMin : scaleMax) != null ? _ref : 0;
  }
}
function enterUpdate(_ref2) {
  var from = _ref2.from, to2 = _ref2.to;
  return {
    fromX: from.x,
    toX: to2.x,
    fromY: from.y,
    toY: to2.y,
    opacity: 1
  };
}
function useLineTransitionConfig(_ref3) {
  var scale = _ref3.scale, animateXOrY = _ref3.animateXOrY, _ref3$animationTrajec = _ref3.animationTrajectory, initAnimationTrajectory = _ref3$animationTrajec === void 0 ? "outside" : _ref3$animationTrajec;
  var shouldAnimateX = animateXOrY === "x";
  return (0, _react$5.useMemo)(function() {
    var _scale$range$map = scale.range().map(_scale.coerceNumber), a2 = _scale$range$map[0], b = _scale$range$map[1];
    var isDescending = b != null && a2 != null && b < a2;
    var _ref4 = isDescending ? [b, a2] : [a2, b], scaleMin = _ref4[0], scaleMax = _ref4[1];
    var scaleLength = b != null && a2 != null ? Math.abs(b - a2) : 0;
    var scaleHalfwayPoint = (scaleMin != null ? scaleMin : 0) + scaleLength / 2;
    var animationTrajectory = initAnimationTrajectory;
    if (!shouldAnimateX && initAnimationTrajectory === "min") animationTrajectory = "max";
    if (!shouldAnimateX && initAnimationTrajectory === "max") animationTrajectory = "min";
    var fromLeave = function fromLeave2(_ref5) {
      var from = _ref5.from, to2 = _ref5.to;
      return {
        fromX: shouldAnimateX ? animatedValue(animationTrajectory, from.x, scaleMin, scaleMax, scaleHalfwayPoint) : from.x,
        toX: shouldAnimateX ? animatedValue(animationTrajectory, from.x, scaleMin, scaleMax, scaleHalfwayPoint) : to2.x,
        fromY: shouldAnimateX ? from.y : animatedValue(animationTrajectory, from.y, scaleMin, scaleMax, scaleHalfwayPoint),
        toY: shouldAnimateX ? to2.y : animatedValue(animationTrajectory, from.y, scaleMin, scaleMax, scaleHalfwayPoint),
        opacity: 0
      };
    };
    return {
      from: fromLeave,
      leave: fromLeave,
      enter: enterUpdate,
      update: enterUpdate
    };
  }, [scale, shouldAnimateX, initAnimationTrajectory]);
}
AnimatedTicks$1.__esModule = true;
AnimatedTicks$1.default = AnimatedTicks;
var _react$4 = _interopRequireDefault$9(reactExports);
var _web = cjsExports;
var _classnames$1 = _interopRequireDefault$9(classnamesExports);
var _orientation = _interopRequireDefault$9(orientation);
var _text = require$$4;
var _useLineTransitionConfig = _interopRequireDefault$9(useLineTransitionConfig$1);
function _interopRequireDefault$9(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _extends$h() {
  _extends$h = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$h.apply(this, arguments);
}
function AnimatedTicks(_ref) {
  var hideTicks = _ref.hideTicks, horizontal = _ref.horizontal, orientation2 = _ref.orientation, scale = _ref.scale, tickClassName = _ref.tickClassName, tickComponent = _ref.tickComponent, allTickLabelProps = _ref.tickLabelProps, _ref$tickStroke = _ref.tickStroke, tickStroke = _ref$tickStroke === void 0 ? "#222" : _ref$tickStroke, tickTransform = _ref.tickTransform, ticks2 = _ref.ticks, tickLineProps = _ref.tickLineProps, animationTrajectory = _ref.animationTrajectory;
  var animatedTicks = (0, _web.useTransition)(ticks2, _extends$h({}, (0, _useLineTransitionConfig.default)({
    scale,
    animateXOrY: horizontal ? "x" : "y",
    animationTrajectory
  }), {
    keys: function keys(tick) {
      return "tick-" + tick.value + "-" + tick.index;
    }
  }));
  return /* @__PURE__ */ _react$4.default.createElement(_react$4.default.Fragment, null, animatedTicks(function(_ref2, item, _ref3, index2) {
    var _ref4, _allTickLabelProps$in;
    var fromX = _ref2.fromX, toX = _ref2.toX, fromY = _ref2.fromY, toY = _ref2.toY, opacity = _ref2.opacity;
    var key = _ref3.key;
    var tickLabelProps = (_ref4 = (_allTickLabelProps$in = allTickLabelProps[index2]) != null ? _allTickLabelProps$in : allTickLabelProps[0]) != null ? _ref4 : {};
    return item == null || key == null ? null : /* @__PURE__ */ _react$4.default.createElement(_web.animated.g, {
      key,
      className: (0, _classnames$1.default)("visx-axis-tick", tickClassName),
      transform: tickTransform
    }, !hideTicks && /* @__PURE__ */ _react$4.default.createElement(_web.animated.line, _extends$h({
      x1: fromX,
      x2: toX,
      y1: fromY,
      y2: toY,
      stroke: tickStroke,
      strokeLinecap: "square",
      strokeOpacity: opacity
    }, tickLineProps)), /* @__PURE__ */ _react$4.default.createElement(_web.animated.g, {
      key: index2,
      transform: (0, _web.to)([toX, toY], function(interpolatedX, interpolatedY) {
        var _tickLabelProps$fontS;
        return "translate(" + interpolatedX + "," + (interpolatedY + (orientation2 === _orientation.default.bottom && typeof tickLabelProps.fontSize === "number" ? (_tickLabelProps$fontS = tickLabelProps.fontSize) != null ? _tickLabelProps$fontS : 10 : 0)) + ")";
      }),
      opacity
    }, tickComponent ? tickComponent(_extends$h({}, tickLabelProps, {
      x: toX,
      y: toY,
      formattedValue: item == null ? void 0 : item.formattedValue
    })) : /* @__PURE__ */ _react$4.default.createElement(_text.Text, tickLabelProps, item == null ? void 0 : item.formattedValue)));
  }));
}
var _default$3 = AnimatedAxis$1;
_interopRequireDefault$8(propTypesExports);
var _react$3 = _interopRequireWildcard(reactExports);
var _Axis = _interopRequireDefault$8(Axis$1);
var _AnimatedTicks = _interopRequireDefault$8(AnimatedTicks$1);
var _excluded$6 = ["animationTrajectory", "tickComponent"];
function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== "function") return null;
  var cacheBabelInterop = /* @__PURE__ */ new WeakMap();
  var cacheNodeInterop = /* @__PURE__ */ new WeakMap();
  return (_getRequireWildcardCache = function _getRequireWildcardCache2(nodeInterop2) {
    return nodeInterop2 ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}
function _interopRequireWildcard(obj, nodeInterop) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
    return { default: obj };
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}
function _interopRequireDefault$8(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _extends$g() {
  _extends$g = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$g.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$6(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function AnimatedAxis$1(_ref) {
  var animationTrajectory = _ref.animationTrajectory, tickComponent = _ref.tickComponent, axisProps = _objectWithoutPropertiesLoose$6(_ref, _excluded$6);
  var ticksComponent = (0, _react$3.useMemo)(function() {
    return (
      // eslint-disable-next-line react/no-unstable-nested-components
      function TicksComponent(ticks2) {
        return /* @__PURE__ */ _react$3.default.createElement(_AnimatedTicks.default, _extends$g({}, ticks2, {
          tickComponent,
          animationTrajectory
        }));
      }
    );
  }, [animationTrajectory, tickComponent]);
  return /* @__PURE__ */ _react$3.default.createElement(_Axis.default, _extends$g({}, axisProps, {
    ticksComponent
  }));
}
var _excluded$5 = ["AxisComponent"];
function _extends$f() {
  _extends$f = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$f.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$5(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function BaseAxis(_ref) {
  var _margin$bottom, _margin$top, _margin$left, _margin$right, _axisStyles$axisLine, _axisStyles$axisLine2, _axisStyles$tickLine;
  var AxisComponent = _ref.AxisComponent, props = _objectWithoutPropertiesLoose$5(_ref, _excluded$5);
  var _useContext = reactExports.useContext(DataContext), theme = _useContext.theme, xScale = _useContext.xScale, yScale = _useContext.yScale, margin = _useContext.margin, width = _useContext.width, height = _useContext.height;
  var orientation2 = props.orientation;
  var axisStyles = reactExports.useMemo(function() {
    var _theme$axisStyles, _theme$axisStyles$y, _theme$axisStyles2, _theme$axisStyles2$x;
    return orientation2 === "left" || orientation2 === "right" ? theme == null ? void 0 : (_theme$axisStyles = theme.axisStyles) == null ? void 0 : (_theme$axisStyles$y = _theme$axisStyles.y) == null ? void 0 : _theme$axisStyles$y[orientation2] : theme == null ? void 0 : (_theme$axisStyles2 = theme.axisStyles) == null ? void 0 : (_theme$axisStyles2$x = _theme$axisStyles2.x) == null ? void 0 : _theme$axisStyles2$x[orientation2];
  }, [theme, orientation2]);
  var maybeTickLabelProps = props.tickLabelProps;
  var tickLabelProps = reactExports.useMemo(function() {
    return maybeTickLabelProps || axisStyles ? function(value2, index2, values) {
      return (
        // by default, wrap vertical-axis tick labels within the allotted margin space
        // this does not currently account for axis label
        _extends$f({}, axisStyles == null ? void 0 : axisStyles.tickLabel, {
          width: orientation2 === "left" || orientation2 === "right" ? margin == null ? void 0 : margin[orientation2] : void 0
        }, typeof maybeTickLabelProps === "function" ? maybeTickLabelProps(value2, index2, values) : maybeTickLabelProps)
      );
    } : void 0;
  }, [maybeTickLabelProps, axisStyles, orientation2, margin]);
  var topOffset = orientation2 === "bottom" ? (height != null ? height : 0) - ((_margin$bottom = margin == null ? void 0 : margin.bottom) != null ? _margin$bottom : 0) : orientation2 === "top" ? (_margin$top = margin == null ? void 0 : margin.top) != null ? _margin$top : 0 : 0;
  var leftOffset = orientation2 === "left" ? (_margin$left = margin == null ? void 0 : margin.left) != null ? _margin$left : 0 : orientation2 === "right" ? (width != null ? width : 0) - ((_margin$right = margin == null ? void 0 : margin.right) != null ? _margin$right : 0) : 0;
  var scale = orientation2 === "left" || orientation2 === "right" ? yScale : xScale;
  return scale ? /* @__PURE__ */ React.createElement(AxisComponent, _extends$f({
    top: topOffset,
    left: leftOffset,
    labelProps: axisStyles == null ? void 0 : axisStyles.axisLabel,
    stroke: axisStyles == null ? void 0 : (_axisStyles$axisLine = axisStyles.axisLine) == null ? void 0 : _axisStyles$axisLine.stroke,
    strokeWidth: axisStyles == null ? void 0 : (_axisStyles$axisLine2 = axisStyles.axisLine) == null ? void 0 : _axisStyles$axisLine2.strokeWidth,
    tickLength: axisStyles == null ? void 0 : axisStyles.tickLength,
    tickStroke: axisStyles == null ? void 0 : (_axisStyles$tickLine = axisStyles.tickLine) == null ? void 0 : _axisStyles$tickLine.stroke
  }, props, {
    tickLabelProps,
    scale
  })) : null;
}
function _extends$e() {
  _extends$e = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$e.apply(this, arguments);
}
function AnimatedAxis(props) {
  return /* @__PURE__ */ React.createElement(BaseAxis, _extends$e({
    AxisComponent: _default$3
  }, props));
}
var _excluded$4 = ["tooltipOpen"];
function _objectWithoutPropertiesLoose$4(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function _extends$d() {
  _extends$d = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$d.apply(this, arguments);
}
function useTooltip(initialTooltipState) {
  var _useState = reactExports.useState(_extends$d({
    tooltipOpen: false
  }, initialTooltipState)), tooltipState = _useState[0], setTooltipState = _useState[1];
  var showTooltip = reactExports.useCallback(function(showArgs) {
    return setTooltipState(typeof showArgs === "function" ? function(_ref) {
      _ref.tooltipOpen;
      var show = _objectWithoutPropertiesLoose$4(_ref, _excluded$4);
      return _extends$d({}, showArgs(show), {
        tooltipOpen: true
      });
    } : {
      tooltipOpen: true,
      tooltipLeft: showArgs.tooltipLeft,
      tooltipTop: showArgs.tooltipTop,
      tooltipData: showArgs.tooltipData
    });
  }, [setTooltipState]);
  var hideTooltip = reactExports.useCallback(function() {
    return setTooltipState({
      tooltipOpen: false,
      tooltipLeft: void 0,
      tooltipTop: void 0,
      tooltipData: void 0
    });
  }, [setTooltipState]);
  return {
    tooltipOpen: tooltipState.tooltipOpen,
    tooltipLeft: tooltipState.tooltipLeft,
    tooltipTop: tooltipState.tooltipTop,
    tooltipData: tooltipState.tooltipData,
    updateTooltip: setTooltipState,
    showTooltip,
    hideTooltip
  };
}
var TooltipContext = /* @__PURE__ */ reactExports.createContext(null);
var useParentSize$1 = {};
useParentSize$1.__esModule = true;
useParentSize$1.default = useParentSize;
var _debounce = _interopRequireDefault$7(debounce_1);
var _react$2 = reactExports;
function _interopRequireDefault$7(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _extends$c() {
  _extends$c = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$c.apply(this, arguments);
}
var defaultIgnoreDimensions = [];
var defaultInitialSize = {
  width: 0,
  height: 0,
  top: 0,
  left: 0
};
function useParentSize(_temp) {
  var _ref = _temp === void 0 ? {} : _temp, _ref$initialSize = _ref.initialSize, initialSize = _ref$initialSize === void 0 ? defaultInitialSize : _ref$initialSize, _ref$debounceTime = _ref.debounceTime, debounceTime = _ref$debounceTime === void 0 ? 300 : _ref$debounceTime, _ref$ignoreDimensions = _ref.ignoreDimensions, ignoreDimensions = _ref$ignoreDimensions === void 0 ? defaultIgnoreDimensions : _ref$ignoreDimensions, _ref$enableDebounceLe = _ref.enableDebounceLeadingCall, enableDebounceLeadingCall = _ref$enableDebounceLe === void 0 ? true : _ref$enableDebounceLe, resizeObserverPolyfill = _ref.resizeObserverPolyfill;
  var parentRef = (0, _react$2.useRef)(null);
  var animationFrameID = (0, _react$2.useRef)(0);
  var _useState = (0, _react$2.useState)(_extends$c({}, defaultInitialSize, initialSize)), state = _useState[0], setState = _useState[1];
  var resize = (0, _react$2.useMemo)(function() {
    var normalized = Array.isArray(ignoreDimensions) ? ignoreDimensions : [ignoreDimensions];
    return (0, _debounce.default)(function(incoming) {
      setState(function(existing) {
        var stateKeys = Object.keys(existing);
        var keysWithChanges = stateKeys.filter(function(key) {
          return existing[key] !== incoming[key];
        });
        var shouldBail = keysWithChanges.every(function(key) {
          return normalized.includes(key);
        });
        return shouldBail ? existing : incoming;
      });
    }, debounceTime, {
      leading: enableDebounceLeadingCall
    });
  }, [debounceTime, enableDebounceLeadingCall, ignoreDimensions]);
  (0, _react$2.useEffect)(function() {
    var LocalResizeObserver = resizeObserverPolyfill || window.ResizeObserver;
    var observer2 = new LocalResizeObserver(function(entries) {
      entries.forEach(function(entry) {
        var _entry$contentRect;
        var _ref2 = (_entry$contentRect = entry == null ? void 0 : entry.contentRect) != null ? _entry$contentRect : {}, left = _ref2.left, top = _ref2.top, width = _ref2.width, height = _ref2.height;
        animationFrameID.current = window.requestAnimationFrame(function() {
          resize({
            width,
            height,
            top,
            left
          });
        });
      });
    });
    if (parentRef.current) observer2.observe(parentRef.current);
    return function() {
      window.cancelAnimationFrame(animationFrameID.current);
      observer2.disconnect();
      resize.cancel();
    };
  }, [resize, resizeObserverPolyfill]);
  return _extends$c({
    parentRef,
    resize
  }, state);
}
var _default$2 = ParentSize;
var _propTypes = _interopRequireDefault$6(propTypesExports);
var _react$1 = _interopRequireDefault$6(reactExports);
var _useParentSize2 = _interopRequireDefault$6(useParentSize$1);
var _excluded$3 = ["className", "children", "debounceTime", "ignoreDimensions", "initialSize", "parentSizeStyles", "enableDebounceLeadingCall", "resizeObserverPolyfill"], _excluded2 = ["parentRef", "resize"];
function _interopRequireDefault$6(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _extends$b() {
  _extends$b = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$b.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$3(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
var defaultParentSizeStyles = {
  width: "100%",
  height: "100%"
};
function ParentSize(_ref) {
  var className = _ref.className, children = _ref.children, debounceTime = _ref.debounceTime, ignoreDimensions = _ref.ignoreDimensions, initialSize = _ref.initialSize, _ref$parentSizeStyles = _ref.parentSizeStyles, parentSizeStyles = _ref$parentSizeStyles === void 0 ? defaultParentSizeStyles : _ref$parentSizeStyles, _ref$enableDebounceLe = _ref.enableDebounceLeadingCall, enableDebounceLeadingCall = _ref$enableDebounceLe === void 0 ? true : _ref$enableDebounceLe, resizeObserverPolyfill = _ref.resizeObserverPolyfill, restProps = _objectWithoutPropertiesLoose$3(_ref, _excluded$3);
  var _useParentSize = (0, _useParentSize2.default)({
    initialSize,
    debounceTime,
    ignoreDimensions,
    enableDebounceLeadingCall,
    resizeObserverPolyfill
  }), parentRef = _useParentSize.parentRef, resize = _useParentSize.resize, dimensions = _objectWithoutPropertiesLoose$3(_useParentSize, _excluded2);
  return /* @__PURE__ */ _react$1.default.createElement("div", _extends$b({
    style: parentSizeStyles,
    ref: parentRef,
    className
  }, restProps), children(_extends$b({}, dimensions, {
    ref: parentRef.current,
    resize
  })));
}
ParentSize.propTypes = {
  className: _propTypes.default.string,
  children: _propTypes.default.func.isRequired
};
var EventEmitterContext = /* @__PURE__ */ reactExports.createContext(null);
function useEventEmitter(eventType, handler, allowedSources) {
  var emitter = reactExports.useContext(EventEmitterContext);
  var allowedSourcesRef = reactExports.useRef();
  allowedSourcesRef.current = allowedSources;
  var emit = reactExports.useCallback(function(type, event, source) {
    if (emitter) {
      emitter.emit(type, {
        event,
        svgPoint: localPoint(event),
        source
      });
    }
  }, [emitter]);
  reactExports.useEffect(function() {
    if (emitter && eventType && handler) {
      var handlerWithSourceFilter = function handlerWithSourceFilter2(params) {
        var _allowedSourcesRef$cu;
        if (!allowedSourcesRef.current || params != null && params.source && (_allowedSourcesRef$cu = allowedSourcesRef.current) != null && _allowedSourcesRef$cu.includes(params.source)) {
          handler(params);
        }
      };
      emitter.on(eventType, handlerWithSourceFilter);
      return function() {
        return emitter == null ? void 0 : emitter.off(eventType, handlerWithSourceFilter);
      };
    }
    return void 0;
  }, [emitter, eventType, handler]);
  return emitter ? emit : null;
}
function mitt(n) {
  return { all: n = n || /* @__PURE__ */ new Map(), on: function(t, e) {
    var i = n.get(t);
    i && i.push(e) || n.set(t, [e]);
  }, off: function(t, e) {
    var i = n.get(t);
    i && i.splice(i.indexOf(e) >>> 0, 1);
  }, emit: function(t, e) {
    (n.get(t) || []).slice().map(function(n2) {
      n2(e);
    }), (n.get("*") || []).slice().map(function(n2) {
      n2(t, e);
    });
  } };
}
function EventEmitterProvider(_ref) {
  var children = _ref.children;
  var emitter = reactExports.useMemo(function() {
    return mitt();
  }, []);
  return /* @__PURE__ */ React.createElement(EventEmitterContext.Provider, {
    value: emitter
  }, children);
}
function _extends$a() {
  _extends$a = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$a.apply(this, arguments);
}
function TooltipProvider(_ref) {
  var _ref$hideTooltipDebou = _ref.hideTooltipDebounceMs, hideTooltipDebounceMs = _ref$hideTooltipDebou === void 0 ? 400 : _ref$hideTooltipDebou, children = _ref.children;
  var _useTooltip = useTooltip(void 0), tooltipOpen = _useTooltip.tooltipOpen, tooltipLeft = _useTooltip.tooltipLeft, tooltipTop = _useTooltip.tooltipTop, tooltipData = _useTooltip.tooltipData, updateTooltip = _useTooltip.updateTooltip, privateHideTooltip = _useTooltip.hideTooltip;
  var debouncedHideTooltip = reactExports.useRef(null);
  function cancelDeboundedHideTooltip() {
    if (debouncedHideTooltip.current) {
      debouncedHideTooltip.current.cancel();
      debouncedHideTooltip.current = null;
    }
  }
  reactExports.useEffect(function() {
    return cancelDeboundedHideTooltip;
  }, []);
  var showTooltip = reactExports.useRef(function(_ref2) {
    var svgPoint = _ref2.svgPoint, index2 = _ref2.index, key = _ref2.key, datum = _ref2.datum, distanceX = _ref2.distanceX, distanceY = _ref2.distanceY;
    cancelDeboundedHideTooltip();
    var cleanDistanceX = isValidNumber(distanceX) ? distanceX : Infinity;
    var cleanDistanceY = isValidNumber(distanceY) ? distanceY : Infinity;
    var distance = Math.sqrt(Math.pow(cleanDistanceX, 2) + Math.pow(cleanDistanceY, 2));
    updateTooltip(function(_ref3) {
      var _currData$nearestDatu, _currData$nearestDatu2, _extends2;
      var currData = _ref3.tooltipData;
      var currNearestDatumDistance = currData != null && currData.nearestDatum && isValidNumber(currData.nearestDatum.distance) ? currData.nearestDatum.distance : Infinity;
      return {
        tooltipOpen: true,
        tooltipLeft: svgPoint == null ? void 0 : svgPoint.x,
        tooltipTop: svgPoint == null ? void 0 : svgPoint.y,
        tooltipData: {
          nearestDatum: ((_currData$nearestDatu = currData == null ? void 0 : (_currData$nearestDatu2 = currData.nearestDatum) == null ? void 0 : _currData$nearestDatu2.key) != null ? _currData$nearestDatu : "") !== key && currNearestDatumDistance < distance ? currData == null ? void 0 : currData.nearestDatum : {
            key,
            index: index2,
            datum,
            distance
          },
          datumByKey: _extends$a({}, currData == null ? void 0 : currData.datumByKey, (_extends2 = {}, _extends2[key] = {
            datum,
            index: index2,
            key
          }, _extends2))
        }
      };
    });
  });
  var hideTooltip = reactExports.useCallback(function() {
    debouncedHideTooltip.current = debounce(privateHideTooltip, hideTooltipDebounceMs);
    debouncedHideTooltip.current();
  }, [privateHideTooltip, hideTooltipDebounceMs]);
  var value2 = reactExports.useMemo(function() {
    return {
      tooltipOpen,
      tooltipLeft,
      tooltipTop,
      tooltipData,
      updateTooltip,
      showTooltip: showTooltip.current,
      hideTooltip
    };
  }, [hideTooltip, tooltipData, tooltipLeft, tooltipOpen, tooltipTop, updateTooltip]);
  return /* @__PURE__ */ React.createElement(TooltipContext.Provider, {
    value: value2
  }, children);
}
TooltipProvider.propTypes = {
  hideTooltipDebounceMs: _pt.number,
  children: _pt.node.isRequired
};
var scaleOperator$1 = {};
var domain = {};
domain.__esModule = true;
domain.default = applyDomain;
function applyDomain(scale, config2) {
  if (config2.domain) {
    if ("nice" in scale || "quantiles" in scale) {
      scale.domain(config2.domain);
    } else if ("padding" in scale) {
      scale.domain(config2.domain);
    } else {
      scale.domain(config2.domain);
    }
  }
}
var range$1 = {};
range$1.__esModule = true;
range$1.default = applyRange;
function applyRange(scale, config2) {
  if (config2.range) {
    if ("padding" in scale) {
      scale.range(config2.range);
    } else {
      scale.range(config2.range);
    }
  }
}
var align = {};
align.__esModule = true;
align.default = applyAlign;
function applyAlign(scale, config2) {
  if ("align" in scale && "align" in config2 && typeof config2.align !== "undefined") {
    scale.align(config2.align);
  }
}
var base = {};
base.__esModule = true;
base.default = applyBase;
function applyBase(scale, config2) {
  if ("base" in scale && "base" in config2 && typeof config2.base !== "undefined") {
    scale.base(config2.base);
  }
}
var clamp = {};
clamp.__esModule = true;
clamp.default = applyClamp;
function applyClamp(scale, config2) {
  if ("clamp" in scale && "clamp" in config2 && typeof config2.clamp !== "undefined") {
    scale.clamp(config2.clamp);
  }
}
var constant = {};
constant.__esModule = true;
constant.default = applyConstant;
function applyConstant(scale, config2) {
  if ("constant" in scale && "constant" in config2 && typeof config2.constant !== "undefined") {
    scale.constant(config2.constant);
  }
}
var exponent = {};
exponent.__esModule = true;
exponent.default = applyExponent;
function applyExponent(scale, config2) {
  if ("exponent" in scale && "exponent" in config2 && typeof config2.exponent !== "undefined") {
    scale.exponent(config2.exponent);
  }
}
var interpolate = {};
var createColorInterpolator$1 = {};
createColorInterpolator$1.__esModule = true;
createColorInterpolator$1.default = createColorInterpolator;
var _d3Interpolate$1 = d3Interpolate;
var interpolatorMap = {
  lab: _d3Interpolate$1.interpolateLab,
  hcl: _d3Interpolate$1.interpolateHcl,
  "hcl-long": _d3Interpolate$1.interpolateHclLong,
  hsl: _d3Interpolate$1.interpolateHsl,
  "hsl-long": _d3Interpolate$1.interpolateHslLong,
  cubehelix: _d3Interpolate$1.interpolateCubehelix,
  "cubehelix-long": _d3Interpolate$1.interpolateCubehelixLong,
  rgb: _d3Interpolate$1.interpolateRgb
};
function createColorInterpolator(interpolate2) {
  switch (interpolate2) {
    case "lab":
    case "hcl":
    case "hcl-long":
    case "hsl":
    case "hsl-long":
    case "cubehelix":
    case "cubehelix-long":
    case "rgb":
      return interpolatorMap[interpolate2];
  }
  var type = interpolate2.type, gamma2 = interpolate2.gamma;
  var interpolator = interpolatorMap[type];
  return typeof gamma2 === "undefined" ? interpolator : interpolator.gamma(gamma2);
}
interpolate.__esModule = true;
interpolate.default = applyInterpolate;
var _createColorInterpolator = _interopRequireDefault$5(createColorInterpolator$1);
function _interopRequireDefault$5(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function applyInterpolate(scale, config2) {
  if ("interpolate" in config2 && "interpolate" in scale && typeof config2.interpolate !== "undefined") {
    var interpolator = (0, _createColorInterpolator.default)(config2.interpolate);
    scale.interpolate(interpolator);
  }
}
var nice = {};
var isUtcScale$1 = {};
isUtcScale$1.__esModule = true;
isUtcScale$1.default = isUtcScale;
var TEST_TIME = new Date(Date.UTC(2020, 1, 2, 3, 4, 5));
var TEST_FORMAT = "%Y-%m-%d %H:%M";
function isUtcScale(scale) {
  var output = scale.tickFormat(1, TEST_FORMAT)(TEST_TIME);
  return output === "2020-02-02 03:04";
}
nice.__esModule = true;
nice.default = applyNice;
var _d3Time = d3Time;
var _isUtcScale = _interopRequireDefault$4(isUtcScale$1);
function _interopRequireDefault$4(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var localTimeIntervals = {
  day: _d3Time.timeDay,
  hour: _d3Time.timeHour,
  minute: _d3Time.timeMinute,
  month: _d3Time.timeMonth,
  second: _d3Time.timeSecond,
  week: _d3Time.timeWeek,
  year: _d3Time.timeYear
};
var utcIntervals = {
  day: _d3Time.utcDay,
  hour: _d3Time.utcHour,
  minute: _d3Time.utcMinute,
  month: _d3Time.utcMonth,
  second: _d3Time.utcSecond,
  week: _d3Time.utcWeek,
  year: _d3Time.utcYear
};
function applyNice(scale, config2) {
  if ("nice" in config2 && typeof config2.nice !== "undefined" && "nice" in scale) {
    var nice2 = config2.nice;
    if (typeof nice2 === "boolean") {
      if (nice2) {
        scale.nice();
      }
    } else if (typeof nice2 === "number") {
      scale.nice(nice2);
    } else {
      var timeScale = scale;
      var isUtc = (0, _isUtcScale.default)(timeScale);
      if (typeof nice2 === "string") {
        timeScale.nice(isUtc ? utcIntervals[nice2] : localTimeIntervals[nice2]);
      } else {
        var interval2 = nice2.interval, step2 = nice2.step;
        var parsedInterval = (isUtc ? utcIntervals[interval2] : localTimeIntervals[interval2]).every(step2);
        if (parsedInterval != null) {
          timeScale.nice(parsedInterval);
        }
      }
    }
  }
}
var padding = {};
padding.__esModule = true;
padding.default = applyPadding;
function applyPadding(scale, config2) {
  if ("padding" in scale && "padding" in config2 && typeof config2.padding !== "undefined") {
    scale.padding(config2.padding);
  }
  if ("paddingInner" in scale && "paddingInner" in config2 && typeof config2.paddingInner !== "undefined") {
    scale.paddingInner(config2.paddingInner);
  }
  if ("paddingOuter" in scale && "paddingOuter" in config2 && typeof config2.paddingOuter !== "undefined") {
    scale.paddingOuter(config2.paddingOuter);
  }
}
var reverse = {};
reverse.__esModule = true;
reverse.default = applyReverse;
function applyReverse(scale, config2) {
  if (config2.reverse) {
    var reversedRange = scale.range().slice().reverse();
    if ("padding" in scale) {
      scale.range(reversedRange);
    } else {
      scale.range(reversedRange);
    }
  }
}
var round = {};
round.__esModule = true;
round.default = applyRound;
var _d3Interpolate = d3Interpolate;
function applyRound(scale, config2) {
  if ("round" in config2 && typeof config2.round !== "undefined") {
    if (config2.round && "interpolate" in config2 && typeof config2.interpolate !== "undefined") {
      console.warn("[visx/scale/applyRound] ignoring round: scale config contains round and interpolate. only applying interpolate. config:", config2);
    } else if ("round" in scale) {
      scale.round(config2.round);
    } else if ("interpolate" in scale && config2.round) {
      scale.interpolate(_d3Interpolate.interpolateRound);
    }
  }
}
var unknown = {};
unknown.__esModule = true;
unknown.default = applyUnknown;
function applyUnknown(scale, config2) {
  if ("unknown" in scale && "unknown" in config2 && typeof config2.unknown !== "undefined") {
    scale.unknown(config2.unknown);
  }
}
var zero$1 = {};
zero$1.__esModule = true;
zero$1.default = applyZero;
function applyZero(scale, config2) {
  if ("zero" in config2 && config2.zero === true) {
    var domain2 = scale.domain();
    var a2 = domain2[0], b = domain2[1];
    var isDescending = b < a2;
    var _ref = isDescending ? [b, a2] : [a2, b], min2 = _ref[0], max2 = _ref[1];
    var domainWithZero = [Math.min(0, min2), Math.max(0, max2)];
    scale.domain(isDescending ? domainWithZero.reverse() : domainWithZero);
  }
}
scaleOperator$1.__esModule = true;
scaleOperator$1.ALL_OPERATORS = void 0;
scaleOperator$1.default = scaleOperator;
var _domain = _interopRequireDefault$3(domain);
var _range = _interopRequireDefault$3(range$1);
var _align = _interopRequireDefault$3(align);
var _base = _interopRequireDefault$3(base);
var _clamp = _interopRequireDefault$3(clamp);
var _constant = _interopRequireDefault$3(constant);
var _exponent = _interopRequireDefault$3(exponent);
var _interpolate = _interopRequireDefault$3(interpolate);
var _nice = _interopRequireDefault$3(nice);
var _padding = _interopRequireDefault$3(padding);
var _reverse = _interopRequireDefault$3(reverse);
var _round = _interopRequireDefault$3(round);
var _unknown = _interopRequireDefault$3(unknown);
var _zero = _interopRequireDefault$3(zero$1);
function _interopRequireDefault$3(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var ALL_OPERATORS = [
  // domain => nice => zero
  "domain",
  "nice",
  "zero",
  // interpolate before round
  "interpolate",
  "round",
  // set range then reverse
  "range",
  "reverse",
  // Order does not matter for these operators
  "align",
  "base",
  "clamp",
  "constant",
  "exponent",
  "padding",
  "unknown"
];
scaleOperator$1.ALL_OPERATORS = ALL_OPERATORS;
var operators = {
  domain: _domain.default,
  nice: _nice.default,
  zero: _zero.default,
  interpolate: _interpolate.default,
  round: _round.default,
  align: _align.default,
  base: _base.default,
  clamp: _clamp.default,
  constant: _constant.default,
  exponent: _exponent.default,
  padding: _padding.default,
  range: _range.default,
  reverse: _reverse.default,
  unknown: _unknown.default
};
function scaleOperator() {
  for (var _len = arguments.length, ops = new Array(_len), _key = 0; _key < _len; _key++) {
    ops[_key] = arguments[_key];
  }
  var selection = new Set(ops);
  var selectedOps = ALL_OPERATORS.filter(function(o) {
    return selection.has(o);
  });
  return function applyOperators(scale, config2) {
    if (typeof config2 !== "undefined") {
      selectedOps.forEach(function(op) {
        operators[op](scale, config2);
      });
    }
    return scale;
  };
}
var _default$1 = createOrdinalScale;
var _d3Scale = d3Scale;
var _scaleOperator = _interopRequireDefault$2(scaleOperator$1);
function _interopRequireDefault$2(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
var updateOrdinalScale = (0, _scaleOperator.default)("domain", "range", "reverse", "unknown");
function createOrdinalScale(config2) {
  return updateOrdinalScale((0, _d3Scale.scaleOrdinal)(), config2);
}
var allColors = {
  red: ["#fff5f5", "#ffe3e3", "#ffc9c9", "#ffa8a8", "#ff8787", "#ff6b6b", "#fa5252", "#f03e3e", "#e03131", "#c92a2a"],
  pink: ["#fff0f6", "#ffdeeb", "#fcc2d7", "#faa2c1", "#f783ac", "#f06595", "#e64980", "#d6336c", "#c2255c", "#a61e4d"],
  grape: ["#f8f0fc", "#f3d9fa", "#eebefa", "#e599f7", "#da77f2", "#cc5de8", "#be4bdb", "#ae3ec9", "#9c36b5", "#862e9c"],
  violet: ["#f3f0ff", "#e5dbff", "#d0bfff", "#b197fc", "#9775fa", "#845ef7", "#7950f2", "#7048e8", "#6741d9", "#5f3dc4"],
  indigo: ["#edf2ff", "#dbe4ff", "#bac8ff", "#91a7ff", "#748ffc", "#5c7cfa", "#4c6ef5", "#4263eb", "#3b5bdb", "#364fc7"],
  blue: ["#e8f7ff", "#ccedff", "#a3daff", "#72c3fc", "#4dadf7", "#329af0", "#228ae6", "#1c7cd6", "#1b6ec2", "#1862ab"],
  cyan: ["#e3fafc", "#c5f6fa", "#99e9f2", "#66d9e8", "#3bc9db", "#22b8cf", "#15aabf", "#1098ad", "#0c8599", "#0b7285"],
  teal: ["#e6fcf5", "#c3fae8", "#96f2d7", "#63e6be", "#38d9a9", "#20c997", "#12b886", "#0ca678", "#099268", "#087f5b"],
  green: ["#ebfbee", "#d3f9d8", "#b2f2bb", "#8ce99a", "#69db7c", "#51cf66", "#40c057", "#37b24d", "#2f9e44", "#2b8a3e"],
  lime: ["#f4fce3", "#e9fac8", "#d8f5a2", "#c0eb75", "#a9e34b", "#94d82d", "#82c91e", "#74b816", "#66a80f", "#5c940d"],
  yellow: ["#fff9db", "#fff3bf", "#ffec99", "#ffe066", "#ffd43b", "#fcc419", "#fab005", "#f59f00", "#f08c00", "#e67700"],
  orange: ["#fff4e6", "#ffe8cc", "#ffd8a8", "#ffc078", "#ffa94d", "#ff922b", "#fd7e14", "#f76707", "#e8590c", "#d9480f"],
  gray: ["#f8f9fa", "#f1f3f5", "#e9ecef", "#dee2e6", "#ced4da", "#adb5bd", "#868e96", "#495057", "#343a40", "#212529"]
};
var grayColors = allColors.gray;
var textColor = grayColors[7];
var defaultColors = [allColors.cyan[9], allColors.cyan[3], allColors.yellow[5], allColors.red[4], allColors.grape[8], allColors.grape[5], allColors.pink[9]];
function _extends$9() {
  _extends$9 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$9.apply(this, arguments);
}
var defaultLabelStyles = {
  fontFamily: "-apple-system,BlinkMacSystemFont,Roboto,Helvetica Neue,sans-serif",
  fontWeight: 700,
  fontSize: 12,
  textAnchor: "middle",
  pointerEvents: "none",
  letterSpacing: 0.4
};
function buildChartTheme(config2) {
  var _ref, _ref2, _config$htmlLabel$col, _config$htmlLabel, _config$svgLabelBig, _config$svgLabelSmall;
  var baseSvgLabel = _extends$9({}, defaultLabelStyles, {
    fill: textColor,
    stroke: "none"
  }, config2.svgLabelBig);
  var baseTickLabel = _extends$9({}, defaultLabelStyles, {
    fontWeight: 200,
    fontSize: 11,
    fill: textColor,
    stroke: "none"
  }, config2.svgLabelSmall);
  var baseHtmlLabel = _extends$9({
    color: (_ref = (_ref2 = (_config$htmlLabel$col = (_config$htmlLabel = config2.htmlLabel) == null ? void 0 : _config$htmlLabel.color) != null ? _config$htmlLabel$col : (_config$svgLabelBig = config2.svgLabelBig) == null ? void 0 : _config$svgLabelBig.fill) != null ? _ref2 : (_config$svgLabelSmall = config2.svgLabelSmall) == null ? void 0 : _config$svgLabelSmall.fill) != null ? _ref : textColor
  }, defaultLabelStyles, config2.htmlLabel);
  return {
    backgroundColor: config2.backgroundColor,
    colors: [].concat(config2.colors),
    htmlLabel: _extends$9({}, baseHtmlLabel),
    svgLabelSmall: _extends$9({}, baseTickLabel),
    svgLabelBig: _extends$9({}, baseSvgLabel),
    gridStyles: _extends$9({
      stroke: config2.gridColor,
      strokeWidth: 1
    }, config2.gridStyles),
    axisStyles: {
      x: {
        top: {
          axisLabel: _extends$9({}, baseSvgLabel, {
            dy: "-0.25em"
            // needs to include font-size
          }),
          axisLine: _extends$9({
            stroke: config2.gridColorDark,
            strokeWidth: 2
          }, config2.xAxisLineStyles),
          tickLabel: _extends$9({}, baseTickLabel, {
            dy: "-0.25em"
            // needs to include font-size
          }),
          tickLength: config2.tickLength,
          tickLine: _extends$9({
            strokeWidth: 1,
            stroke: config2.gridColor
          }, config2.xTickLineStyles)
        },
        bottom: {
          axisLabel: _extends$9({}, baseSvgLabel, {
            dy: "-0.25em"
          }),
          axisLine: _extends$9({
            stroke: config2.gridColorDark,
            strokeWidth: 2
          }, config2.xAxisLineStyles),
          tickLabel: _extends$9({}, baseTickLabel, {
            dy: "0.125em"
          }),
          tickLength: config2.tickLength,
          tickLine: _extends$9({
            strokeWidth: 1,
            stroke: config2.gridColor
          }, config2.xTickLineStyles)
        }
      },
      y: {
        left: {
          axisLabel: _extends$9({}, baseSvgLabel, {
            dx: "-1.25em"
          }),
          axisLine: _extends$9({
            stroke: config2.gridColor,
            strokeWidth: 1
          }, config2.yAxisLineStyles),
          tickLabel: _extends$9({}, baseTickLabel, {
            textAnchor: "end",
            dx: "-0.25em",
            dy: "0.25em"
          }),
          tickLength: config2.tickLength,
          tickLine: _extends$9({
            strokeWidth: 1,
            stroke: config2.gridColor
          }, config2.yTickLineStyles)
        },
        right: {
          axisLabel: _extends$9({}, baseSvgLabel, {
            dx: "1.25em"
          }),
          axisLine: _extends$9({
            stroke: config2.gridColor,
            strokeWidth: 1
          }, config2.yAxisLineStyles),
          tickLabel: _extends$9({}, baseTickLabel, {
            textAnchor: "start",
            dx: "0.25em",
            dy: "0.25em"
          }),
          tickLength: config2.tickLength,
          tickLine: _extends$9({
            strokeWidth: 1,
            stroke: config2.gridColor
          }, config2.yTickLineStyles)
        }
      }
    }
  };
}
const lightTheme = buildChartTheme({
  backgroundColor: "#fff",
  colors: defaultColors,
  tickLength: 4,
  svgLabelSmall: {
    fill: grayColors[7]
  },
  svgLabelBig: {
    fill: grayColors[9]
  },
  gridColor: grayColors[5],
  gridColorDark: grayColors[9]
});
var ThemeContext = /* @__PURE__ */ React.createContext(lightTheme);
var DataRegistry = /* @__PURE__ */ function() {
  function DataRegistry2() {
    this.registry = {};
    this.registryKeys = [];
  }
  var _proto = DataRegistry2.prototype;
  _proto.registerData = function registerData(entryOrEntries) {
    var _this = this;
    var entries = Array.isArray(entryOrEntries) ? entryOrEntries : [entryOrEntries];
    entries.forEach(function(currEntry) {
      if (currEntry.key in _this.registry && _this.registry[currEntry.key] != null) {
        console.debug("Overriding data registry key", currEntry.key);
      }
      _this.registry[currEntry.key] = currEntry;
      _this.registryKeys = Object.keys(_this.registry);
    });
  };
  _proto.unregisterData = function unregisterData(keyOrKeys) {
    var _this2 = this;
    var keys = Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys];
    keys.forEach(function(currKey) {
      delete _this2.registry[currKey];
      _this2.registryKeys = Object.keys(_this2.registry);
    });
  };
  _proto.entries = function entries() {
    return Object.values(this.registry);
  };
  _proto.get = function get(key) {
    return this.registry[key];
  };
  _proto.keys = function keys() {
    return this.registryKeys;
  };
  return DataRegistry2;
}();
function useDataRegistry() {
  var _useState = reactExports.useState(Math.random()), forceUpdate = _useState[1];
  var privateRegistry = reactExports.useMemo(function() {
    return new DataRegistry();
  }, []);
  return reactExports.useMemo(function() {
    return {
      registerData: function registerData() {
        privateRegistry.registerData.apply(privateRegistry, arguments);
        forceUpdate(Math.random());
      },
      unregisterData: function unregisterData() {
        privateRegistry.unregisterData.apply(privateRegistry, arguments);
        forceUpdate(Math.random());
      },
      entries: function entries() {
        return privateRegistry.entries();
      },
      get: function get(key) {
        return privateRegistry.get(key);
      },
      keys: function keys() {
        return privateRegistry.keys();
      }
    };
  }, [privateRegistry]);
}
var DEFAULT_DIMS = {
  width: 0,
  height: 0,
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  }
};
function useDimensions(initialDims) {
  var _useState = reactExports.useState({
    width: (initialDims == null ? void 0 : initialDims.width) == null ? DEFAULT_DIMS.width : initialDims.width,
    height: (initialDims == null ? void 0 : initialDims.height) == null ? DEFAULT_DIMS.height : initialDims.height,
    margin: (initialDims == null ? void 0 : initialDims.margin) == null ? DEFAULT_DIMS.margin : initialDims.margin
  }), dimensions = _useState[0], privateSetDimensions = _useState[1];
  var publicSetDimensions = reactExports.useCallback(function(dims) {
    if (dims.width !== dimensions.width || dims.height !== dimensions.height || dims.margin.left !== dimensions.margin.left || dims.margin.right !== dimensions.margin.right || dims.margin.top !== dimensions.margin.top || dims.margin.bottom !== dimensions.margin.bottom) {
      privateSetDimensions(dims);
    }
  }, [dimensions.width, dimensions.height, dimensions.margin.left, dimensions.margin.right, dimensions.margin.bottom, dimensions.margin.top]);
  return [dimensions, publicSetDimensions];
}
function ascending(a2, b) {
  return a2 == null || b == null ? NaN : a2 < b ? -1 : a2 > b ? 1 : a2 >= b ? 0 : NaN;
}
function descending(a2, b) {
  return a2 == null || b == null ? NaN : b < a2 ? -1 : b > a2 ? 1 : b >= a2 ? 0 : NaN;
}
function bisector(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = ascending;
    compare2 = (d, x2) => ascending(f(d), x2);
    delta = (d, x2) => f(d) - x2;
  } else {
    compare1 = f === ascending || f === descending ? f : zero;
    compare2 = f;
    delta = f;
  }
  function left(a2, x2, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x2) < 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right(a2, x2, lo = 0, hi = a2.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a2[mid], x2) <= 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center(a2, x2, lo = 0, hi = a2.length) {
    const i = left(a2, x2, lo, hi - 1);
    return i > lo && delta(a2[i - 1], x2) > -delta(a2[i], x2) ? i - 1 : i;
  }
  return { left, center, right };
}
function zero() {
  return 0;
}
function number(x2) {
  return x2 === null ? NaN : +x2;
}
const ascendingBisect = bisector(ascending);
const bisectLeft = ascendingBisect.left;
bisector(number).center;
function extent(values, valueof) {
  let min2;
  let max2;
  {
    for (const value2 of values) {
      if (value2 != null) {
        if (min2 === void 0) {
          if (value2 >= value2) min2 = max2 = value2;
        } else {
          if (min2 > value2) min2 = value2;
          if (max2 < value2) max2 = value2;
        }
      }
    }
  }
  return [min2, max2];
}
function range(start2, stop2, step2) {
  start2 = +start2, stop2 = +stop2, step2 = (n = arguments.length) < 2 ? (stop2 = start2, start2 = 0, 1) : n < 3 ? 1 : +step2;
  var i = -1, n = Math.max(0, Math.ceil((stop2 - start2) / step2)) | 0, range2 = new Array(n);
  while (++i < n) {
    range2[i] = start2 + i * step2;
  }
  return range2;
}
function isDiscreteScale(scaleConfig) {
  return (scaleConfig == null ? void 0 : scaleConfig.type) === "band" || (scaleConfig == null ? void 0 : scaleConfig.type) === "ordinal" || (scaleConfig == null ? void 0 : scaleConfig.type) === "point";
}
function _extends$8() {
  _extends$8 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$8.apply(this, arguments);
}
function useScales(_ref) {
  var dataRegistry = _ref.dataRegistry, xRange = _ref.xRange, xScaleConfig = _ref.xScaleConfig, yRange = _ref.yRange, yScaleConfig = _ref.yScaleConfig;
  var registryKeys = dataRegistry.keys();
  var xMin = xRange[0], xMax = xRange[1];
  var yMin = yRange[0], yMax = yRange[1];
  var memoizedXScale = reactExports.useMemo(function() {
    var registryEntries = registryKeys.map(function(key) {
      return dataRegistry.get(key);
    });
    var xValues = registryEntries.reduce(function(combined, entry) {
      return entry ? combined.concat(entry.data.map(function(d) {
        return entry.xAccessor(d);
      })) : combined;
    }, []);
    if (xValues.length === 0) return void 0;
    var xDomain = isDiscreteScale(xScaleConfig) ? xValues : extent(xValues);
    var xScale = scaleCanBeZeroed(xScaleConfig) ? createScale(_extends$8({
      range: [xMin, xMax],
      domain: xDomain,
      zero: true
    }, xScaleConfig)) : createScale(_extends$8({
      range: [xMin, xMax],
      domain: xDomain
    }, xScaleConfig));
    registryEntries.forEach(function(entry) {
      if (entry != null && entry.xScale) xScale = entry.xScale(xScale);
    });
    return xScale;
  }, [dataRegistry, xScaleConfig, registryKeys, xMin, xMax]);
  var memoizedYScale = reactExports.useMemo(function() {
    var registryEntries = registryKeys.map(function(key) {
      return dataRegistry.get(key);
    });
    var yValues = registryEntries.reduce(function(combined, entry) {
      return entry ? combined.concat(entry.data.map(function(d) {
        return entry.yAccessor(d);
      })) : combined;
    }, []);
    if (yValues.length === 0) return void 0;
    var yDomain = isDiscreteScale(yScaleConfig) ? yValues : extent(yValues);
    var yScale = scaleCanBeZeroed(yScaleConfig) ? createScale(_extends$8({
      range: [yMin, yMax],
      domain: yDomain,
      zero: true
    }, yScaleConfig)) : createScale(_extends$8({
      range: [yMin, yMax],
      domain: yDomain
    }, yScaleConfig));
    registryEntries.forEach(function(entry) {
      if (entry != null && entry.yScale) yScale = entry.yScale(yScale);
    });
    return yScale;
  }, [dataRegistry, yScaleConfig, registryKeys, yMin, yMax]);
  return {
    xScale: memoizedXScale,
    yScale: memoizedYScale
  };
}
function DataProvider(_ref) {
  var initialDimensions = _ref.initialDimensions, propsTheme = _ref.theme, xScaleConfig = _ref.xScale, yScaleConfig = _ref.yScale, children = _ref.children, _ref$horizontal = _ref.horizontal, initialHorizontal = _ref$horizontal === void 0 ? "auto" : _ref$horizontal, resizeObserverPolyfill = _ref.resizeObserverPolyfill;
  var contextTheme = reactExports.useContext(ThemeContext);
  var theme = propsTheme || contextTheme;
  var _useDimensions = useDimensions(initialDimensions), _useDimensions$ = _useDimensions[0], width = _useDimensions$.width, height = _useDimensions$.height, margin = _useDimensions$.margin, setDimensions = _useDimensions[1];
  var innerWidth = Math.max(0, width - margin.left - margin.right);
  var innerHeight = Math.max(0, height - margin.top - margin.bottom);
  var dataRegistry = useDataRegistry();
  var _useScales = useScales({
    dataRegistry,
    xScaleConfig,
    yScaleConfig,
    xRange: [margin.left, Math.max(0, width - margin.right)],
    yRange: [Math.max(0, height - margin.bottom), margin.top]
  }), xScale = _useScales.xScale, yScale = _useScales.yScale;
  var registryKeys = dataRegistry.keys();
  var colorScale = reactExports.useMemo(function() {
    return _default$1({
      domain: registryKeys,
      range: theme.colors
    });
  }, [registryKeys, theme.colors]);
  var horizontal = initialHorizontal === "auto" ? isDiscreteScale(yScaleConfig) || yScaleConfig.type === "time" || yScaleConfig.type === "utc" : initialHorizontal;
  var value2 = reactExports.useMemo(
    function() {
      return {
        dataRegistry,
        registerData: dataRegistry.registerData,
        unregisterData: dataRegistry.unregisterData,
        xScale,
        yScale,
        colorScale,
        theme,
        width,
        height,
        margin,
        innerWidth,
        innerHeight,
        setDimensions,
        horizontal,
        resizeObserverPolyfill
      };
    },
    // everything here should be memoized between renders
    // to avoid child re-renders
    [colorScale, dataRegistry, height, horizontal, innerHeight, innerWidth, margin, setDimensions, theme, width, xScale, yScale, resizeObserverPolyfill]
  );
  return /* @__PURE__ */ React.createElement(DataContext.Provider, {
    value: value2
  }, children);
}
DataProvider.propTypes = {
  children: _pt.node.isRequired,
  horizontal: _pt.oneOfType([_pt.bool, _pt.oneOf(["auto"])])
};
function usePointerEventEmitters(_ref) {
  var source = _ref.source, _ref$onPointerOut = _ref.onPointerOut, onPointerOut = _ref$onPointerOut === void 0 ? true : _ref$onPointerOut, _ref$onPointerMove = _ref.onPointerMove, onPointerMove = _ref$onPointerMove === void 0 ? true : _ref$onPointerMove, _ref$onPointerUp = _ref.onPointerUp, onPointerUp = _ref$onPointerUp === void 0 ? true : _ref$onPointerUp, _ref$onPointerDown = _ref.onPointerDown, onPointerDown = _ref$onPointerDown === void 0 ? true : _ref$onPointerDown, _ref$onFocus = _ref.onFocus, onFocus = _ref$onFocus === void 0 ? false : _ref$onFocus, _ref$onBlur = _ref.onBlur, onBlur = _ref$onBlur === void 0 ? false : _ref$onBlur;
  var emit = useEventEmitter();
  var emitPointerMove = reactExports.useCallback(function(event) {
    return emit == null ? void 0 : emit("pointermove", event, source);
  }, [emit, source]);
  var emitPointerOut = reactExports.useCallback(function(event) {
    return emit == null ? void 0 : emit("pointerout", event, source);
  }, [emit, source]);
  var emitPointerUp = reactExports.useCallback(function(event) {
    return emit == null ? void 0 : emit("pointerup", event, source);
  }, [emit, source]);
  var emitPointerDown = reactExports.useCallback(function(event) {
    return emit == null ? void 0 : emit("pointerdown", event, source);
  }, [emit, source]);
  var emitFocus = reactExports.useCallback(function(event) {
    return emit == null ? void 0 : emit("focus", event, source);
  }, [emit, source]);
  var emitBlur = reactExports.useCallback(function(event) {
    return emit == null ? void 0 : emit("blur", event, source);
  }, [emit, source]);
  return {
    onPointerMove: onPointerMove ? emitPointerMove : void 0,
    onFocus: onFocus ? emitFocus : void 0,
    onBlur: onBlur ? emitBlur : void 0,
    onPointerOut: onPointerOut ? emitPointerOut : void 0,
    onPointerUp: onPointerUp ? emitPointerUp : void 0,
    onPointerDown: onPointerDown ? emitPointerDown : void 0
  };
}
var GLYPHSERIES_EVENT_SOURCE = "GLYPHSERIES_EVENT_SOURCE";
var LINESERIES_EVENT_SOURCE = "LINESERIES_EVENT_SOURCE";
var XYCHART_EVENT_SOURCE = "XYCHART_EVENT_SOURCE";
function isPointerEvent(event) {
  return !!event && ("clientX" in event || "changedTouches" in event);
}
function isFocusEvent(event) {
  return !!event && !isPointerEvent(event);
}
function findNearestDatumSingleDimension(_ref) {
  var scale = _ref.scale, accessor = _ref.accessor, scaledValue = _ref.scaledValue, data = _ref.data;
  var coercedScale = scale;
  var nearestDatum;
  var nearestDatumIndex;
  if ("invert" in coercedScale && typeof coercedScale.invert === "function") {
    var bisect2 = bisector(accessor).left;
    var dataValue = Number(coercedScale.invert(scaledValue));
    var index2 = bisect2(data, dataValue);
    var nearestDatum0 = data[index2 - 1];
    var nearestDatum1 = data[index2];
    nearestDatum = !nearestDatum0 || Math.abs(dataValue - accessor(nearestDatum0)) > Math.abs(dataValue - accessor(nearestDatum1)) ? nearestDatum1 : nearestDatum0;
    nearestDatumIndex = nearestDatum === nearestDatum0 ? index2 - 1 : index2;
  } else if ("step" in coercedScale && typeof coercedScale.step !== "undefined") {
    var domain2 = scale.domain();
    var range$12 = scale.range().map(Number);
    var sortedRange = [].concat(range$12).sort(function(a2, b) {
      return a2 - b;
    });
    var rangePoints = range(sortedRange[0], sortedRange[1], coercedScale.step());
    var domainIndex = bisectLeft(rangePoints, scaledValue);
    var sortedDomain = range$12[0] < range$12[1] ? domain2 : domain2.reverse();
    var domainValue = sortedDomain[domainIndex - 1];
    var _index3 = data.findIndex(function(d) {
      return String(accessor(d)) === String(domainValue);
    });
    nearestDatum = data[_index3];
    nearestDatumIndex = _index3;
  } else {
    console.warn("[visx/xychart/findNearestDatum] encountered incompatible scale type, bailing");
    return null;
  }
  if (nearestDatum == null || nearestDatumIndex == null) return null;
  var distance = Math.abs(Number(coercedScale(accessor(nearestDatum))) - scaledValue);
  return {
    datum: nearestDatum,
    index: nearestDatumIndex,
    distance
  };
}
function findNearestDatumX(_ref) {
  var scale = _ref.xScale, accessor = _ref.xAccessor, yScale = _ref.yScale, yAccessor = _ref.yAccessor, point2 = _ref.point, data = _ref.data;
  if (!point2) return null;
  var nearestDatum = findNearestDatumSingleDimension({
    scale,
    accessor,
    scaledValue: point2.x,
    data
  });
  return nearestDatum ? {
    datum: nearestDatum.datum,
    index: nearestDatum.index,
    distanceX: nearestDatum.distance,
    distanceY: Math.abs(Number(yScale(yAccessor(nearestDatum.datum))) - point2.y)
  } : null;
}
function findNearestDatumY(_ref) {
  var scale = _ref.yScale, accessor = _ref.yAccessor, xScale = _ref.xScale, xAccessor = _ref.xAccessor, point2 = _ref.point, data = _ref.data;
  if (!point2) return null;
  var nearestDatum = findNearestDatumSingleDimension({
    scale,
    accessor,
    scaledValue: point2.y,
    data
  });
  return nearestDatum ? {
    datum: nearestDatum.datum,
    index: nearestDatum.index,
    distanceY: nearestDatum.distance,
    distanceX: Math.abs(Number(xScale(xAccessor(nearestDatum.datum))) - point2.x)
  } : null;
}
function _extends$7() {
  _extends$7 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$7.apply(this, arguments);
}
var POINTER_EVENTS_ALL = "__POINTER_EVENTS_ALL";
var POINTER_EVENTS_NEAREST = "__POINTER_EVENTS_NEAREST";
function usePointerEventHandlers(_ref) {
  var dataKey = _ref.dataKey, findNearestDatumProps = _ref.findNearestDatum, onBlur = _ref.onBlur, onFocus = _ref.onFocus, onPointerMove = _ref.onPointerMove, onPointerOut = _ref.onPointerOut, onPointerUp = _ref.onPointerUp, onPointerDown = _ref.onPointerDown, allowedSources = _ref.allowedSources;
  var _ref2 = reactExports.useContext(DataContext), width = _ref2.width, height = _ref2.height, horizontal = _ref2.horizontal, dataRegistry = _ref2.dataRegistry, xScale = _ref2.xScale, yScale = _ref2.yScale;
  var findNearestDatum = findNearestDatumProps || (horizontal ? findNearestDatumY : findNearestDatumX);
  var getHandlerParams = reactExports.useCallback(function(params) {
    var _ref3 = params || {}, svgPoint = _ref3.svgPoint, event = _ref3.event;
    var pointerParamsByKey = {};
    var nearestDatumPointerParams = null;
    var nearestDatumDistance = Infinity;
    if (params && event && svgPoint && width && height && xScale && yScale) {
      var _dataRegistry$keys;
      var considerAllKeys = dataKey === POINTER_EVENTS_NEAREST || dataKey === POINTER_EVENTS_ALL;
      var dataKeys = considerAllKeys ? (_dataRegistry$keys = dataRegistry == null ? void 0 : dataRegistry.keys()) != null ? _dataRegistry$keys : [] : Array.isArray(dataKey) ? dataKey : [dataKey];
      dataKeys.forEach(function(key) {
        var entry = dataRegistry == null ? void 0 : dataRegistry.get(key);
        if (entry) {
          var nearestDatum = findNearestDatum({
            dataKey: key,
            data: entry.data,
            height,
            point: svgPoint,
            width,
            xAccessor: entry.xAccessor,
            xScale,
            yAccessor: entry.yAccessor,
            yScale
          });
          if (nearestDatum) {
            pointerParamsByKey[key] = _extends$7({
              key,
              svgPoint,
              event
            }, nearestDatum);
            if (dataKey === POINTER_EVENTS_NEAREST) {
              var _nearestDatum$distanc, _nearestDatum$distanc2;
              var distance = Math.sqrt(((_nearestDatum$distanc = nearestDatum.distanceX) != null ? _nearestDatum$distanc : Math.pow(Infinity, 2)) + ((_nearestDatum$distanc2 = nearestDatum.distanceY) != null ? _nearestDatum$distanc2 : Math.pow(Infinity, 2)));
              nearestDatumPointerParams = distance < nearestDatumDistance ? pointerParamsByKey[key] : nearestDatumPointerParams;
              nearestDatumDistance = Math.min(nearestDatumDistance, distance);
            }
          }
        }
      });
      var pointerParams = dataKey === POINTER_EVENTS_NEAREST ? [nearestDatumPointerParams] : dataKey === POINTER_EVENTS_ALL || Array.isArray(dataKey) ? Object.values(pointerParamsByKey) : [pointerParamsByKey[dataKey]];
      return pointerParams.filter(function(param) {
        return param;
      });
    }
    return [];
  }, [dataKey, dataRegistry, xScale, yScale, width, height, findNearestDatum]);
  var handlePointerMove = reactExports.useCallback(function(params) {
    if (onPointerMove) {
      getHandlerParams(params).forEach(function(p) {
        return onPointerMove(p);
      });
    }
  }, [getHandlerParams, onPointerMove]);
  var handlePointerUp = reactExports.useCallback(function(params) {
    if (onPointerUp) {
      getHandlerParams(params).forEach(function(p) {
        return onPointerUp(p);
      });
    }
  }, [getHandlerParams, onPointerUp]);
  var handlePointerDown = reactExports.useCallback(function(params) {
    if (onPointerDown) {
      getHandlerParams(params).forEach(function(p) {
        return onPointerDown(p);
      });
    }
  }, [getHandlerParams, onPointerDown]);
  var handleFocus = reactExports.useCallback(function(params) {
    if (onFocus) {
      getHandlerParams(params).forEach(function(p) {
        return onFocus(p);
      });
    }
  }, [getHandlerParams, onFocus]);
  var handlePointerOut = reactExports.useCallback(function(params) {
    var event = params == null ? void 0 : params.event;
    if (event && isPointerEvent(event) && onPointerOut) onPointerOut(event);
  }, [onPointerOut]);
  var handleBlur = reactExports.useCallback(function(params) {
    var event = params == null ? void 0 : params.event;
    if (event && isFocusEvent(event) && onBlur) onBlur(event);
  }, [onBlur]);
  useEventEmitter("pointermove", onPointerMove ? handlePointerMove : void 0, allowedSources);
  useEventEmitter("pointerout", onPointerOut ? handlePointerOut : void 0, allowedSources);
  useEventEmitter("pointerup", onPointerUp ? handlePointerUp : void 0, allowedSources);
  useEventEmitter("pointerdown", onPointerDown ? handlePointerDown : void 0, allowedSources);
  useEventEmitter("focus", onFocus ? handleFocus : void 0, allowedSources);
  useEventEmitter("blur", onBlur ? handleBlur : void 0, allowedSources);
}
function _extends$6() {
  _extends$6 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$6.apply(this, arguments);
}
var DEFAULT_MARGIN = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50
};
var allowedEventSources = [XYCHART_EVENT_SOURCE];
function XYChart(props) {
  var _props$accessibilityL = props.accessibilityLabel, accessibilityLabel = _props$accessibilityL === void 0 ? "XYChart" : _props$accessibilityL, _props$captureEvents = props.captureEvents, captureEvents = _props$captureEvents === void 0 ? true : _props$captureEvents, children = props.children, height = props.height, horizontal = props.horizontal, _props$margin = props.margin, margin = _props$margin === void 0 ? DEFAULT_MARGIN : _props$margin, onPointerMove = props.onPointerMove, onPointerOut = props.onPointerOut, onPointerUp = props.onPointerUp, onPointerDown = props.onPointerDown, _props$pointerEventsD = props.pointerEventsDataKey, pointerEventsDataKey = _props$pointerEventsD === void 0 ? "nearest" : _props$pointerEventsD, theme = props.theme, width = props.width, xScale = props.xScale, yScale = props.yScale, resizeObserverPolyfillProp = props.resizeObserverPolyfill;
  var _useContext = reactExports.useContext(DataContext), setDimensions = _useContext.setDimensions, resizeObserverPolyfill = _useContext.resizeObserverPolyfill;
  var tooltipContext = reactExports.useContext(TooltipContext);
  var emit = useEventEmitter();
  reactExports.useEffect(function() {
    if (setDimensions && width != null && height != null && width > 0 && height > 0) {
      setDimensions({
        width,
        height,
        margin
      });
    }
  }, [setDimensions, width, height, margin]);
  var eventEmitters = usePointerEventEmitters({
    source: XYCHART_EVENT_SOURCE
  });
  usePointerEventHandlers({
    dataKey: pointerEventsDataKey === "nearest" ? POINTER_EVENTS_NEAREST : POINTER_EVENTS_ALL,
    onPointerMove,
    onPointerOut,
    onPointerUp,
    onPointerDown,
    allowedSources: allowedEventSources
  });
  if (!setDimensions) {
    if (!xScale || !yScale) {
      console.warn("[@visx/xychart] XYChart: When no DataProvider is available in context, you must pass xScale & yScale config to XYChart.");
      return null;
    }
    return /* @__PURE__ */ React.createElement(DataProvider, {
      xScale,
      yScale,
      theme,
      initialDimensions: {
        width,
        height,
        margin
      },
      horizontal,
      resizeObserverPolyfill: resizeObserverPolyfillProp
    }, /* @__PURE__ */ React.createElement(XYChart, props));
  }
  if (width == null || height == null) {
    return /* @__PURE__ */ React.createElement(_default$2, {
      resizeObserverPolyfill
    }, function(dims) {
      return /* @__PURE__ */ React.createElement(XYChart, _extends$6({}, props, {
        width: props.width == null ? dims.width : props.width,
        height: props.height == null ? dims.height : props.height
      }));
    });
  }
  if (tooltipContext == null) {
    return /* @__PURE__ */ React.createElement(TooltipProvider, null, /* @__PURE__ */ React.createElement(XYChart, props));
  }
  if (emit == null) {
    return /* @__PURE__ */ React.createElement(EventEmitterProvider, null, /* @__PURE__ */ React.createElement(XYChart, props));
  }
  if (width <= 0 || height <= 0) {
    return null;
  }
  return /* @__PURE__ */ React.createElement("svg", {
    width,
    height,
    "aria-label": accessibilityLabel
  }, children, captureEvents && /* @__PURE__ */ React.createElement("rect", _extends$6({
    x: margin.left,
    y: margin.top,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
    fill: "transparent"
  }, eventEmitters)));
}
XYChart.propTypes = {
  accessibilityLabel: _pt.string,
  captureEvents: _pt.bool,
  width: _pt.number,
  height: _pt.number,
  children: _pt.node.isRequired,
  horizontal: _pt.oneOfType([_pt.bool, _pt.oneOf(["auto"])]),
  onPointerMove: _pt.func,
  onPointerOut: _pt.func,
  onPointerUp: _pt.func,
  onPointerDown: _pt.func,
  pointerEventsDataKey: _pt.oneOf(["all", "nearest"])
};
var D3ShapeFactories = {};
const require$$0 = /* @__PURE__ */ getAugmentedNamespace(src$8);
var setNumberOrNumberAccessor$1 = {};
setNumberOrNumberAccessor$1.__esModule = true;
setNumberOrNumberAccessor$1.default = setNumberOrNumberAccessor;
function setNumberOrNumberAccessor(func, value2) {
  if (typeof value2 === "number") func(value2);
  else func(value2);
}
var stackOrder$1 = {};
stackOrder$1.__esModule = true;
stackOrder$1.STACK_ORDER_NAMES = stackOrder$1.STACK_ORDERS = void 0;
stackOrder$1.default = stackOrder;
var _d3Shape$2 = require$$0;
var STACK_ORDERS = {
  ascending: _d3Shape$2.stackOrderAscending,
  descending: _d3Shape$2.stackOrderDescending,
  insideout: _d3Shape$2.stackOrderInsideOut,
  none: _d3Shape$2.stackOrderNone,
  reverse: _d3Shape$2.stackOrderReverse
};
stackOrder$1.STACK_ORDERS = STACK_ORDERS;
var STACK_ORDER_NAMES = Object.keys(STACK_ORDERS);
stackOrder$1.STACK_ORDER_NAMES = STACK_ORDER_NAMES;
function stackOrder(order) {
  return order && STACK_ORDERS[order] || STACK_ORDERS.none;
}
var stackOffset$1 = {};
stackOffset$1.__esModule = true;
stackOffset$1.STACK_OFFSET_NAMES = stackOffset$1.STACK_OFFSETS = void 0;
stackOffset$1.default = stackOffset;
var _d3Shape$1 = require$$0;
var STACK_OFFSETS = {
  expand: _d3Shape$1.stackOffsetExpand,
  diverging: _d3Shape$1.stackOffsetDiverging,
  none: _d3Shape$1.stackOffsetNone,
  silhouette: _d3Shape$1.stackOffsetSilhouette,
  wiggle: _d3Shape$1.stackOffsetWiggle
};
stackOffset$1.STACK_OFFSETS = STACK_OFFSETS;
var STACK_OFFSET_NAMES = Object.keys(STACK_OFFSETS);
stackOffset$1.STACK_OFFSET_NAMES = STACK_OFFSET_NAMES;
function stackOffset(offset) {
  return offset && STACK_OFFSETS[offset] || STACK_OFFSETS.none;
}
D3ShapeFactories.__esModule = true;
D3ShapeFactories.arc = arc;
D3ShapeFactories.area = area;
D3ShapeFactories.line = line;
D3ShapeFactories.pie = pie;
D3ShapeFactories.radialLine = radialLine;
D3ShapeFactories.stack = stack;
var _d3Shape = require$$0;
var _setNumberOrNumberAccessor = _interopRequireDefault$1(setNumberOrNumberAccessor$1);
var _stackOrder = _interopRequireDefault$1(stackOrder$1);
var _stackOffset = _interopRequireDefault$1(stackOffset$1);
function _interopRequireDefault$1(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function arc(_temp) {
  var _ref = _temp === void 0 ? {} : _temp, innerRadius = _ref.innerRadius, outerRadius = _ref.outerRadius, cornerRadius = _ref.cornerRadius, startAngle = _ref.startAngle, endAngle = _ref.endAngle, padAngle = _ref.padAngle, padRadius = _ref.padRadius;
  var path2 = (0, _d3Shape.arc)();
  if (innerRadius != null) (0, _setNumberOrNumberAccessor.default)(path2.innerRadius, innerRadius);
  if (outerRadius != null) (0, _setNumberOrNumberAccessor.default)(path2.outerRadius, outerRadius);
  if (cornerRadius != null) (0, _setNumberOrNumberAccessor.default)(path2.cornerRadius, cornerRadius);
  if (startAngle != null) (0, _setNumberOrNumberAccessor.default)(path2.startAngle, startAngle);
  if (endAngle != null) (0, _setNumberOrNumberAccessor.default)(path2.endAngle, endAngle);
  if (padAngle != null) (0, _setNumberOrNumberAccessor.default)(path2.padAngle, padAngle);
  if (padRadius != null) (0, _setNumberOrNumberAccessor.default)(path2.padRadius, padRadius);
  return path2;
}
function area(_temp2) {
  var _ref2 = _temp2 === void 0 ? {} : _temp2, x2 = _ref2.x, x0 = _ref2.x0, x1 = _ref2.x1, y2 = _ref2.y, y0 = _ref2.y0, y1 = _ref2.y1, defined = _ref2.defined, curve = _ref2.curve;
  var path2 = (0, _d3Shape.area)();
  if (x2) (0, _setNumberOrNumberAccessor.default)(path2.x, x2);
  if (x0) (0, _setNumberOrNumberAccessor.default)(path2.x0, x0);
  if (x1) (0, _setNumberOrNumberAccessor.default)(path2.x1, x1);
  if (y2) (0, _setNumberOrNumberAccessor.default)(path2.y, y2);
  if (y0) (0, _setNumberOrNumberAccessor.default)(path2.y0, y0);
  if (y1) (0, _setNumberOrNumberAccessor.default)(path2.y1, y1);
  if (defined) path2.defined(defined);
  if (curve) path2.curve(curve);
  return path2;
}
function line(_temp3) {
  var _ref3 = _temp3 === void 0 ? {} : _temp3, x2 = _ref3.x, y2 = _ref3.y, defined = _ref3.defined, curve = _ref3.curve;
  var path2 = (0, _d3Shape.line)();
  if (x2) (0, _setNumberOrNumberAccessor.default)(path2.x, x2);
  if (y2) (0, _setNumberOrNumberAccessor.default)(path2.y, y2);
  if (defined) path2.defined(defined);
  if (curve) path2.curve(curve);
  return path2;
}
function pie(_temp4) {
  var _ref4 = _temp4 === void 0 ? {} : _temp4, startAngle = _ref4.startAngle, endAngle = _ref4.endAngle, padAngle = _ref4.padAngle, value2 = _ref4.value, sort2 = _ref4.sort, sortValues = _ref4.sortValues;
  var path2 = (0, _d3Shape.pie)();
  if (sort2 === null) path2.sort(sort2);
  else if (sort2 != null) path2.sort(sort2);
  if (sortValues === null) path2.sortValues(sortValues);
  else if (sortValues != null) path2.sortValues(sortValues);
  if (value2 != null) path2.value(value2);
  if (padAngle != null) (0, _setNumberOrNumberAccessor.default)(path2.padAngle, padAngle);
  if (startAngle != null) (0, _setNumberOrNumberAccessor.default)(path2.startAngle, startAngle);
  if (endAngle != null) (0, _setNumberOrNumberAccessor.default)(path2.endAngle, endAngle);
  return path2;
}
function radialLine(_temp5) {
  var _ref5 = _temp5 === void 0 ? {} : _temp5, angle = _ref5.angle, radius = _ref5.radius, defined = _ref5.defined, curve = _ref5.curve;
  var path2 = (0, _d3Shape.radialLine)();
  if (angle) (0, _setNumberOrNumberAccessor.default)(path2.angle, angle);
  if (radius) (0, _setNumberOrNumberAccessor.default)(path2.radius, radius);
  if (defined) path2.defined(defined);
  if (curve) path2.curve(curve);
  return path2;
}
function stack(_ref6) {
  var keys = _ref6.keys, value2 = _ref6.value, order = _ref6.order, offset = _ref6.offset;
  var path2 = (0, _d3Shape.stack)();
  if (keys) path2.keys(keys);
  if (value2) (0, _setNumberOrNumberAccessor.default)(path2.value, value2);
  if (order) path2.order((0, _stackOrder.default)(order));
  if (offset) path2.offset((0, _stackOffset.default)(offset));
  return path2;
}
var _default = LinePath;
var _react = _interopRequireDefault(reactExports);
var _classnames = _interopRequireDefault(classnamesExports);
var _D3ShapeFactories = D3ShapeFactories;
var _excluded$2 = ["children", "data", "x", "y", "fill", "className", "curve", "innerRef", "defined"];
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}
function _extends$5() {
  _extends$5 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$5.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$2(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function LinePath(_ref) {
  var children = _ref.children, _ref$data = _ref.data, data = _ref$data === void 0 ? [] : _ref$data, x2 = _ref.x, y2 = _ref.y, _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "transparent" : _ref$fill, className = _ref.className, curve = _ref.curve, innerRef = _ref.innerRef, _ref$defined = _ref.defined, defined = _ref$defined === void 0 ? function() {
    return true;
  } : _ref$defined, restProps = _objectWithoutPropertiesLoose$2(_ref, _excluded$2);
  var path2 = (0, _D3ShapeFactories.line)({
    x: x2,
    y: y2,
    defined,
    curve
  });
  if (children) return /* @__PURE__ */ _react.default.createElement(_react.default.Fragment, null, children({
    path: path2
  }));
  return /* @__PURE__ */ _react.default.createElement("path", _extends$5({
    ref: innerRef,
    className: (0, _classnames.default)("visx-linepath", className),
    d: path2(data) || "",
    fill,
    strokeLinecap: "round"
  }, restProps));
}
function _extends$4() {
  _extends$4 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$4.apply(this, arguments);
}
function withRegisteredData(BaseSeriesComponent) {
  function WrappedComponent(props) {
    var dataKey = props.dataKey, data = props.data, xAccessor = props.xAccessor, yAccessor = props.yAccessor;
    var _ref = reactExports.useContext(DataContext), xScale = _ref.xScale, yScale = _ref.yScale, dataRegistry = _ref.dataRegistry;
    reactExports.useEffect(function() {
      if (dataRegistry) dataRegistry.registerData({
        key: dataKey,
        data,
        xAccessor,
        yAccessor
      });
      return function() {
        return dataRegistry == null ? void 0 : dataRegistry.unregisterData(dataKey);
      };
    }, [dataRegistry, dataKey, data, xAccessor, yAccessor]);
    var registryEntry = dataRegistry == null ? void 0 : dataRegistry.get(dataKey);
    if (!xScale || !yScale || !registryEntry) return null;
    var BaseComponent = BaseSeriesComponent;
    return /* @__PURE__ */ React.createElement(BaseComponent, _extends$4({}, props, {
      xScale,
      yScale,
      data: registryEntry.data,
      xAccessor: registryEntry.xAccessor,
      yAccessor: registryEntry.yAccessor
    }));
  }
  return WrappedComponent;
}
function getScaledValueFactory(scale, accessor, align2) {
  if (align2 === void 0) {
    align2 = "center";
  }
  return function(d) {
    var scaledValue = scale(accessor(d));
    if (isValidNumber(scaledValue)) {
      var bandwidthOffset = (align2 === "start" ? 0 : getScaleBandwidth(scale)) / (align2 === "center" ? 2 : 1);
      return scaledValue + bandwidthOffset;
    }
    return NaN;
  };
}
function useSeriesEvents(_ref) {
  var _useContext;
  var dataKey = _ref.dataKey, enableEvents = _ref.enableEvents, findNearestDatum = _ref.findNearestDatum, onBlurProps = _ref.onBlur, onFocusProps = _ref.onFocus, onPointerMoveProps = _ref.onPointerMove, onPointerOutProps = _ref.onPointerOut, onPointerUpProps = _ref.onPointerUp, onPointerDownProps = _ref.onPointerDown, source = _ref.source, allowedSources = _ref.allowedSources;
  var _ref2 = (_useContext = reactExports.useContext(TooltipContext)) != null ? _useContext : {}, showTooltip = _ref2.showTooltip, hideTooltip = _ref2.hideTooltip;
  var onPointerMove = reactExports.useCallback(function(params) {
    showTooltip(params);
    if (onPointerMoveProps) onPointerMoveProps(params);
  }, [showTooltip, onPointerMoveProps]);
  var onFocus = reactExports.useCallback(function(params) {
    showTooltip(params);
    if (onFocusProps) onFocusProps(params);
  }, [showTooltip, onFocusProps]);
  var onPointerOut = reactExports.useCallback(function(event) {
    hideTooltip();
    if (event && onPointerOutProps) onPointerOutProps(event);
  }, [hideTooltip, onPointerOutProps]);
  var onBlur = reactExports.useCallback(function(event) {
    hideTooltip();
    if (event && onBlurProps) onBlurProps(event);
  }, [hideTooltip, onBlurProps]);
  var onPointerDown = reactExports.useCallback(function(params) {
    showTooltip(params);
    if (onPointerDownProps) onPointerDownProps(params);
  }, [showTooltip, onPointerDownProps]);
  usePointerEventHandlers({
    dataKey,
    findNearestDatum,
    onBlur: enableEvents ? onBlur : void 0,
    onFocus: enableEvents ? onFocus : void 0,
    onPointerMove: enableEvents ? onPointerMove : void 0,
    onPointerOut: enableEvents ? onPointerOut : void 0,
    onPointerUp: enableEvents ? onPointerUpProps : void 0,
    onPointerDown: enableEvents ? onPointerDown : void 0,
    allowedSources
  });
  return usePointerEventEmitters({
    source,
    onBlur: !!onBlurProps && enableEvents,
    onFocus: !!onFocusProps && enableEvents,
    onPointerMove: !!onPointerMoveProps && enableEvents,
    onPointerOut: !!onPointerOutProps && enableEvents,
    onPointerUp: !!onPointerUpProps && enableEvents,
    onPointerDown: !!onPointerDownProps && enableEvents
  });
}
function _extends$3() {
  _extends$3 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$3.apply(this, arguments);
}
function BaseGlyphSeries(_ref) {
  var _ref2, _colorScale, _theme$colors;
  var colorAccessor = _ref.colorAccessor, data = _ref.data, dataKey = _ref.dataKey, onBlur = _ref.onBlur, onFocus = _ref.onFocus, onPointerMove = _ref.onPointerMove, onPointerOut = _ref.onPointerOut, onPointerUp = _ref.onPointerUp, onPointerDown = _ref.onPointerDown, _ref$enableEvents = _ref.enableEvents, enableEvents = _ref$enableEvents === void 0 ? true : _ref$enableEvents, renderGlyphs = _ref.renderGlyphs, _ref$size = _ref.size, size = _ref$size === void 0 ? 8 : _ref$size, xAccessor = _ref.xAccessor, xScale = _ref.xScale, yAccessor = _ref.yAccessor, yScale = _ref.yScale;
  var _useContext = reactExports.useContext(DataContext), colorScale = _useContext.colorScale, theme = _useContext.theme, horizontal = _useContext.horizontal;
  var getScaledX = reactExports.useMemo(function() {
    return getScaledValueFactory(xScale, xAccessor);
  }, [xScale, xAccessor]);
  var getScaledY = reactExports.useMemo(function() {
    return getScaledValueFactory(yScale, yAccessor);
  }, [yScale, yAccessor]);
  var color2 = (_ref2 = (_colorScale = colorScale == null ? void 0 : colorScale(dataKey)) != null ? _colorScale : theme == null ? void 0 : (_theme$colors = theme.colors) == null ? void 0 : _theme$colors[0]) != null ? _ref2 : "#222";
  var ownEventSourceKey = GLYPHSERIES_EVENT_SOURCE + "-" + dataKey;
  var eventEmitters = useSeriesEvents({
    dataKey,
    enableEvents,
    onBlur,
    onFocus,
    onPointerMove,
    onPointerOut,
    onPointerUp,
    onPointerDown,
    source: ownEventSourceKey,
    allowedSources: [XYCHART_EVENT_SOURCE, ownEventSourceKey]
  });
  var glyphs = reactExports.useMemo(function() {
    return data.map(function(datum, i) {
      var _colorAccessor;
      var x2 = getScaledX(datum);
      if (!isValidNumber(x2)) return null;
      var y2 = getScaledY(datum);
      if (!isValidNumber(y2)) return null;
      return {
        key: "" + i,
        x: x2,
        y: y2,
        color: (_colorAccessor = colorAccessor == null ? void 0 : colorAccessor(datum, i)) != null ? _colorAccessor : color2,
        size: typeof size === "function" ? size(datum) : size,
        datum
      };
    }).filter(function(point2) {
      return point2;
    });
  }, [color2, colorAccessor, data, getScaledX, getScaledY, size]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, renderGlyphs(_extends$3({
    glyphs,
    xScale,
    yScale,
    horizontal
  }, eventEmitters)));
}
BaseGlyphSeries.propTypes = {
  colorAccessor: _pt.func,
  size: _pt.oneOfType([_pt.number, _pt.func]),
  renderGlyphs: _pt.func.isRequired
};
function defaultRenderGlyph(_ref) {
  var key = _ref.key, color2 = _ref.color, x2 = _ref.x, y2 = _ref.y, size = _ref.size, onBlur = _ref.onBlur, onFocus = _ref.onFocus, onPointerMove = _ref.onPointerMove, onPointerOut = _ref.onPointerOut, onPointerUp = _ref.onPointerUp;
  return /* @__PURE__ */ React.createElement("circle", {
    className: "visx-circle-glyph",
    key,
    tabIndex: onBlur || onFocus ? 0 : void 0,
    fill: color2,
    r: size / 2,
    cx: x2,
    cy: y2,
    onBlur,
    onFocus,
    onPointerMove,
    onPointerOut,
    onPointerUp
  });
}
var _excluded$1 = ["colorAccessor", "curve", "data", "dataKey", "onBlur", "onFocus", "onPointerMove", "onPointerOut", "onPointerUp", "onPointerDown", "enableEvents", "xAccessor", "xScale", "yAccessor", "yScale", "PathComponent"];
function _extends$2() {
  _extends$2 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$2.apply(this, arguments);
}
function _objectWithoutPropertiesLoose$1(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function BaseLineSeries(_ref) {
  var _ref2, _colorScale, _theme$colors;
  var colorAccessor = _ref.colorAccessor, curve = _ref.curve, data = _ref.data, dataKey = _ref.dataKey, onBlur = _ref.onBlur, onFocus = _ref.onFocus, onPointerMove = _ref.onPointerMove, onPointerOut = _ref.onPointerOut, onPointerUp = _ref.onPointerUp, onPointerDown = _ref.onPointerDown, _ref$enableEvents = _ref.enableEvents, enableEvents = _ref$enableEvents === void 0 ? true : _ref$enableEvents, xAccessor = _ref.xAccessor, xScale = _ref.xScale, yAccessor = _ref.yAccessor, yScale = _ref.yScale, _ref$PathComponent = _ref.PathComponent, PathComponent = _ref$PathComponent === void 0 ? "path" : _ref$PathComponent, lineProps = _objectWithoutPropertiesLoose$1(_ref, _excluded$1);
  var _useContext = reactExports.useContext(DataContext), colorScale = _useContext.colorScale, theme = _useContext.theme;
  var getScaledX = reactExports.useMemo(function() {
    return getScaledValueFactory(xScale, xAccessor);
  }, [xScale, xAccessor]);
  var getScaledY = reactExports.useMemo(function() {
    return getScaledValueFactory(yScale, yAccessor);
  }, [yScale, yAccessor]);
  var isDefined = reactExports.useCallback(function(d) {
    return isValidNumber(xScale(xAccessor(d))) && isValidNumber(yScale(yAccessor(d)));
  }, [xScale, xAccessor, yScale, yAccessor]);
  var color2 = (_ref2 = (_colorScale = colorScale == null ? void 0 : colorScale(dataKey)) != null ? _colorScale : theme == null ? void 0 : (_theme$colors = theme.colors) == null ? void 0 : _theme$colors[0]) != null ? _ref2 : "#222";
  var ownEventSourceKey = LINESERIES_EVENT_SOURCE + "-" + dataKey;
  var eventEmitters = useSeriesEvents({
    dataKey,
    enableEvents,
    onBlur,
    onFocus,
    onPointerMove,
    onPointerOut,
    onPointerUp,
    onPointerDown,
    source: ownEventSourceKey,
    allowedSources: [XYCHART_EVENT_SOURCE, ownEventSourceKey]
  });
  var captureFocusEvents = Boolean(onFocus || onBlur);
  var renderGlyphs = reactExports.useCallback(function(_ref3) {
    var glyphs = _ref3.glyphs;
    return captureFocusEvents ? glyphs.map(function(glyph) {
      return /* @__PURE__ */ React.createElement(React.Fragment, {
        key: glyph.key
      }, defaultRenderGlyph(_extends$2({}, glyph, {
        color: "transparent",
        onFocus: eventEmitters.onFocus,
        onBlur: eventEmitters.onBlur
      })));
    }) : null;
  }, [captureFocusEvents, eventEmitters.onFocus, eventEmitters.onBlur]);
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(_default, _extends$2({
    x: getScaledX,
    y: getScaledY,
    defined: isDefined,
    curve
  }, lineProps), function(_ref4) {
    var _colorAccessor;
    var path2 = _ref4.path;
    return /* @__PURE__ */ React.createElement(PathComponent, _extends$2({
      stroke: (_colorAccessor = colorAccessor == null ? void 0 : colorAccessor(dataKey)) != null ? _colorAccessor : color2,
      strokeWidth: 2,
      fill: "transparent",
      strokeLinecap: "round"
      // without this a datum surrounded by nulls will not be visible
    }, lineProps, {
      d: path2(data) || ""
    }, eventEmitters));
  }), captureFocusEvents && /* @__PURE__ */ React.createElement(BaseGlyphSeries, {
    dataKey,
    data,
    xAccessor,
    yAccessor,
    xScale,
    yScale,
    renderGlyphs
  }));
}
BaseLineSeries.propTypes = {
  colorAccessor: _pt.func
};
const BaseLineSeries$1 = withRegisteredData(BaseLineSeries);
function decasteljau(points, t) {
  const left = [];
  const right = [];
  function decasteljauRecurse(points2, t4) {
    if (points2.length === 1) {
      left.push(points2[0]);
      right.push(points2[0]);
    } else {
      const newPoints = Array(points2.length - 1);
      for (let i = 0; i < newPoints.length; i++) {
        if (i === 0) {
          left.push(points2[0]);
        }
        if (i === newPoints.length - 1) {
          right.push(points2[i + 1]);
        }
        newPoints[i] = [
          (1 - t4) * points2[i][0] + t4 * points2[i + 1][0],
          (1 - t4) * points2[i][1] + t4 * points2[i + 1][1]
        ];
      }
      decasteljauRecurse(newPoints, t4);
    }
  }
  if (points.length) {
    decasteljauRecurse(points, t);
  }
  return { left, right: right.reverse() };
}
function pointsToCommand(points) {
  const command = {};
  if (points.length === 4) {
    command.x2 = points[2][0];
    command.y2 = points[2][1];
  }
  if (points.length >= 3) {
    command.x1 = points[1][0];
    command.y1 = points[1][1];
  }
  command.x = points[points.length - 1][0];
  command.y = points[points.length - 1][1];
  if (points.length === 4) {
    command.type = "C";
  } else if (points.length === 3) {
    command.type = "Q";
  } else {
    command.type = "L";
  }
  return command;
}
function splitCurveAsPoints(points, segmentCount) {
  segmentCount = segmentCount || 2;
  const segments = [];
  let remainingCurve = points;
  const tIncrement = 1 / segmentCount;
  for (let i = 0; i < segmentCount - 1; i++) {
    const tRelative = tIncrement / (1 - tIncrement * i);
    const split = decasteljau(remainingCurve, tRelative);
    segments.push(split.left);
    remainingCurve = split.right;
  }
  segments.push(remainingCurve);
  return segments;
}
function splitCurve(commandStart, commandEnd, segmentCount) {
  const points = [[commandStart.x, commandStart.y]];
  if (commandEnd.x1 != null) {
    points.push([commandEnd.x1, commandEnd.y1]);
  }
  if (commandEnd.x2 != null) {
    points.push([commandEnd.x2, commandEnd.y2]);
  }
  points.push([commandEnd.x, commandEnd.y]);
  return splitCurveAsPoints(points, segmentCount).map(pointsToCommand);
}
const commandTokenRegex = /[MLCSTQAHVZmlcstqahv]|-?[\d.e+-]+/g;
const typeMap = {
  M: ["x", "y"],
  L: ["x", "y"],
  H: ["x"],
  V: ["y"],
  C: ["x1", "y1", "x2", "y2", "x", "y"],
  S: ["x2", "y2", "x", "y"],
  Q: ["x1", "y1", "x", "y"],
  T: ["x", "y"],
  A: ["rx", "ry", "xAxisRotation", "largeArcFlag", "sweepFlag", "x", "y"],
  Z: []
};
Object.keys(typeMap).forEach((key) => {
  typeMap[key.toLowerCase()] = typeMap[key];
});
function arrayOfLength(length2, value2) {
  const array2 = Array(length2);
  for (let i = 0; i < length2; i++) {
    array2[i] = value2;
  }
  return array2;
}
function commandToString(command) {
  return `${command.type}${typeMap[command.type].map((p) => command[p]).join(",")}`;
}
function convertToSameType(aCommand, bCommand) {
  const conversionMap = {
    x1: "x",
    y1: "y",
    x2: "x",
    y2: "y"
  };
  const readFromBKeys = ["xAxisRotation", "largeArcFlag", "sweepFlag"];
  if (aCommand.type !== bCommand.type && bCommand.type.toUpperCase() !== "M") {
    const aConverted = {};
    Object.keys(bCommand).forEach((bKey) => {
      const bValue = bCommand[bKey];
      let aValue = aCommand[bKey];
      if (aValue === void 0) {
        if (readFromBKeys.includes(bKey)) {
          aValue = bValue;
        } else {
          if (aValue === void 0 && conversionMap[bKey]) {
            aValue = aCommand[conversionMap[bKey]];
          }
          if (aValue === void 0) {
            aValue = 0;
          }
        }
      }
      aConverted[bKey] = aValue;
    });
    aConverted.type = bCommand.type;
    aCommand = aConverted;
  }
  return aCommand;
}
function splitSegment(commandStart, commandEnd, segmentCount) {
  let segments = [];
  if (commandEnd.type === "L" || commandEnd.type === "Q" || commandEnd.type === "C") {
    segments = segments.concat(
      splitCurve(commandStart, commandEnd, segmentCount)
    );
  } else {
    const copyCommand = Object.assign({}, commandStart);
    if (copyCommand.type === "M") {
      copyCommand.type = "L";
    }
    segments = segments.concat(
      arrayOfLength(segmentCount - 1).map(() => copyCommand)
    );
    segments.push(commandEnd);
  }
  return segments;
}
function extend(commandsToExtend, referenceCommands, excludeSegment) {
  const numSegmentsToExtend = commandsToExtend.length - 1;
  const numReferenceSegments = referenceCommands.length - 1;
  const segmentRatio = numSegmentsToExtend / numReferenceSegments;
  const countPointsPerSegment = arrayOfLength(numReferenceSegments).reduce(
    (accum, d, i) => {
      let insertIndex = Math.floor(segmentRatio * i);
      accum[insertIndex] = (accum[insertIndex] || 0) + 1;
      return accum;
    },
    []
  );
  const extended = countPointsPerSegment.reduce((extended2, segmentCount, i) => {
    if (i === commandsToExtend.length - 1) {
      const lastCommandCopies = arrayOfLength(
        segmentCount,
        Object.assign({}, commandsToExtend[commandsToExtend.length - 1])
      );
      if (lastCommandCopies[0].type === "M") {
        lastCommandCopies.forEach((d) => {
          d.type = "L";
        });
      }
      return extended2.concat(lastCommandCopies);
    }
    return extended2.concat(
      splitSegment(commandsToExtend[i], commandsToExtend[i + 1], segmentCount)
    );
  }, []);
  extended.unshift(commandsToExtend[0]);
  return extended;
}
function pathCommandsFromString(d) {
  const tokens2 = (d || "").match(commandTokenRegex) || [];
  const commands = [];
  let commandArgs;
  let command;
  for (let i = 0; i < tokens2.length; ++i) {
    commandArgs = typeMap[tokens2[i]];
    if (commandArgs) {
      command = {
        type: tokens2[i]
      };
      for (let a2 = 0; a2 < commandArgs.length; ++a2) {
        command[commandArgs[a2]] = +tokens2[i + a2 + 1];
      }
      i += commandArgs.length;
      commands.push(command);
    }
  }
  return commands;
}
function interpolatePathCommands(aCommandsInput, bCommandsInput, excludeSegment) {
  let aCommands = aCommandsInput == null ? [] : aCommandsInput.slice();
  let bCommands = bCommandsInput == null ? [] : bCommandsInput.slice();
  if (!aCommands.length && !bCommands.length) {
    return function nullInterpolator() {
      return [];
    };
  }
  const addZ = (aCommands.length === 0 || aCommands[aCommands.length - 1].type === "Z") && (bCommands.length === 0 || bCommands[bCommands.length - 1].type === "Z");
  if (aCommands.length > 0 && aCommands[aCommands.length - 1].type === "Z") {
    aCommands.pop();
  }
  if (bCommands.length > 0 && bCommands[bCommands.length - 1].type === "Z") {
    bCommands.pop();
  }
  if (!aCommands.length) {
    aCommands.push(bCommands[0]);
  } else if (!bCommands.length) {
    bCommands.push(aCommands[0]);
  }
  const numPointsToExtend = Math.abs(bCommands.length - aCommands.length);
  if (numPointsToExtend !== 0) {
    if (bCommands.length > aCommands.length) {
      aCommands = extend(aCommands, bCommands);
    } else if (bCommands.length < aCommands.length) {
      bCommands = extend(bCommands, aCommands);
    }
  }
  aCommands = aCommands.map(
    (aCommand, i) => convertToSameType(aCommand, bCommands[i])
  );
  const interpolatedCommands = aCommands.map((aCommand) => ({ ...aCommand }));
  if (addZ) {
    interpolatedCommands.push({ type: "Z" });
  }
  return function pathCommandInterpolator(t) {
    if (t === 1) {
      return bCommandsInput == null ? [] : bCommandsInput;
    }
    if (t > 0) {
      for (let i = 0; i < interpolatedCommands.length; ++i) {
        const aCommand = aCommands[i];
        const bCommand = bCommands[i];
        const interpolatedCommand = interpolatedCommands[i];
        for (const arg of typeMap[interpolatedCommand.type]) {
          interpolatedCommand[arg] = (1 - t) * aCommand[arg] + t * bCommand[arg];
          if (arg === "largeArcFlag" || arg === "sweepFlag") {
            interpolatedCommand[arg] = Math.round(interpolatedCommand[arg]);
          }
        }
      }
    }
    return interpolatedCommands;
  };
}
function interpolatePath(a2, b, excludeSegment) {
  let aCommands = pathCommandsFromString(a2);
  let bCommands = pathCommandsFromString(b);
  if (!aCommands.length && !bCommands.length) {
    return function nullInterpolator() {
      return "";
    };
  }
  const commandInterpolator = interpolatePathCommands(
    aCommands,
    bCommands
  );
  return function pathStringInterpolator(t) {
    if (t === 1) {
      return b == null ? "" : b;
    }
    const interpolatedCommands = commandInterpolator(t);
    let interpolatedString = "";
    for (const interpolatedCommand of interpolatedCommands) {
      interpolatedString += commandToString(interpolatedCommand);
    }
    return interpolatedString;
  };
}
var _excluded = ["d", "stroke", "fill"];
function _extends$1() {
  _extends$1 = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends$1.apply(this, arguments);
}
function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}
function AnimatedPath(_ref) {
  var d = _ref.d, _ref$stroke = _ref.stroke, stroke = _ref$stroke === void 0 ? "transparent" : _ref$stroke, _ref$fill = _ref.fill, fill = _ref$fill === void 0 ? "transparent" : _ref$fill, lineProps = _objectWithoutPropertiesLoose(_ref, _excluded);
  var previousD = reactExports.useRef(d);
  var setPreviousD = reactExports.useCallback(
    debounce(function(dValue) {
      previousD.current = dValue;
    }, 50),
    []
    // create once
  );
  var interpolator = interpolatePath(previousD.current, d);
  setPreviousD(d);
  var _useSpring = useSpring({
    from: {
      t: 0
    },
    to: {
      t: 1
    },
    reset: true,
    delay: 0
  }), t = _useSpring.t;
  var tweened = useSpring({
    stroke,
    fill
  });
  return /* @__PURE__ */ React.createElement(animated.path, _extends$1({
    className: "visx-path",
    d: t.to(interpolator),
    stroke: tweened.stroke,
    fill: tweened.fill
  }, lineProps));
}
const AnimatedPath$1 = /* @__PURE__ */ reactExports.memo(AnimatedPath);
function _extends() {
  _extends = Object.assign ? Object.assign.bind() : function(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];
      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }
    return target;
  };
  return _extends.apply(this, arguments);
}
function AnimatedLineSeries(props) {
  return /* @__PURE__ */ React.createElement(BaseLineSeries$1, _extends({}, props, {
    PathComponent: AnimatedPath$1
  }));
}
const accessors = {
  xAccessor: (d) => d.x,
  yAccessor: (d) => d.y
};
const customTheme = buildChartTheme({
  colors: ["hsl(var(--system-color-12))"],
  backgroundColor: "hsl(var(--muted))",
  gridColor: "hsl(var(--system-color-12))",
  gridColorDark: "hsl(var(--system-color-12))",
  htmlLabel: {
    color: "hsl(var(--system-color-12))"
  },
  tickLength: 8,
  yTickLineStyles: {
    strokeWidth: 1
  },
  xAxisLineStyles: {
    strokeWidth: 1
  }
});
const UsageChart = ({ label, dataset }) => {
  const containerRef = reactExports.useRef(null);
  const [width, setWidth] = reactExports.useState(0);
  const isMobile = useIsMobile();
  reactExports.useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: containerRef,
      className: "p-2 lg:p-8 border border-border/30 rounded-lg w-full",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-lg", children: label }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(InfoIcon, { className: "text-foreground/50 cursor-pointer hover:text-foreground" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          XYChart,
          {
            height: isMobile ? 300 : 400,
            width,
            xScale: { type: "band" },
            yScale: { type: "linear" },
            theme: customTheme,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AnimatedAxis,
                {
                  orientation: "bottom",
                  hideTicks: true,
                  tickTransform: "translate(50 0)",
                  tickLabelProps: { className: "text-sm" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AnimatedAxis,
                {
                  orientation: "left",
                  hideTicks: true,
                  tickLabelProps: { className: "text-sm" }
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                AnimatedLineSeries,
                {
                  className: "stroke-ring",
                  curve: curveCardinal,
                  strokeWidth: isMobile ? 2 : 4,
                  dataKey: "usage",
                  data: dataset,
                  ...accessors
                }
              )
            ]
          }
        ) })
      ]
    }
  );
};
function Dashboard() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ec, {
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(GeneralLayout, {
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(UpgradeAccountBanner, {}), /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CurrentUsageIcon, {
          className: "text-foreground w-8 h-8"
        }),
        title: "Current Usage"
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx(UsageCard, {
          label: "Storage",
          currentUsage: 120,
          monthlyUsage: 130,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {
            className: "text-ring"
          })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(UsageCard, {
          label: "Download",
          currentUsage: 2,
          monthlyUsage: 10,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudDownloadIcon, {
            className: "text-ring"
          })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(UsageCard, {
          label: "Upload",
          currentUsage: 5,
          monthlyUsage: 15,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUploadSolidIcon, {
            className: "text-ring"
          })
        })]
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(SectionTitle, {
        icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CurrentUsageIcon, {
          className: "text-foreground w-8 h-8"
        }),
        title: "Historical Usage"
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "grid gap-8 grid-cols-1 lg:grid-cols-2 ",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx(UsageChart, {
          dataset: [{
            x: "3/2",
            y: "50"
          }, {
            x: "3/3",
            y: "10"
          }, {
            x: "3/4",
            y: "20"
          }],
          label: "Storage"
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(UsageChart, {
          dataset: [{
            x: "3/2",
            y: "50"
          }, {
            x: "3/3",
            y: "10"
          }, {
            x: "3/4",
            y: "20"
          }],
          label: "Download"
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(UsageChart, {
          dataset: [{
            x: "3/2",
            y: "50"
          }, {
            x: "3/3",
            y: "10"
          }, {
            x: "3/4",
            y: "20"
          }],
          label: "Upload"
        })]
      })]
    })
  }, "dashboard");
}
export {
  Dashboard as default
};
