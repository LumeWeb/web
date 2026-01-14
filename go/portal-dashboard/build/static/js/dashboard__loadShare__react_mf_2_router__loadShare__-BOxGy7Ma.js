import { dashboard__mf_v__runtimeInit__mf_v__ } from './dashboard__mf_v__runtimeInit__mf_v__-BgQBwuY5.js';
import { dashboard__loadShare__react__loadShare__ } from './dashboard__loadShare__react__loadShare__-CpgLq0wn.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise: initPromise$1} = dashboard__mf_v__runtimeInit__mf_v__;
    const res$1 = initPromise$1.then(runtime => runtime.loadShare("@lumeweb/portal-framework-ui-core", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^0.1.0"
      }}
    }));
    const exportModule$1 = await res$1.then(factory => factory());
    var dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ = exportModule$1;

const h = dashboard__loadShare__react__loadShare__.createContext(null), c = {
  didCatch: false,
  error: null
};
class m extends dashboard__loadShare__react__loadShare__.Component {
  constructor(t) {
    super(t), this.resetErrorBoundary = this.resetErrorBoundary.bind(this), this.state = c;
  }
  static getDerivedStateFromError(t) {
    return { didCatch: true, error: t };
  }
  resetErrorBoundary(...t) {
    const { error: e } = this.state;
    e !== null && (this.props.onReset?.({
      args: t,
      reason: "imperative-api"
    }), this.setState(c));
  }
  componentDidCatch(t, e) {
    this.props.onError?.(t, e);
  }
  componentDidUpdate(t, e) {
    const { didCatch: o } = this.state, { resetKeys: n } = this.props;
    o && e.error !== null && C(t.resetKeys, n) && (this.props.onReset?.({
      next: n,
      prev: t.resetKeys,
      reason: "keys"
    }), this.setState(c));
  }
  render() {
    const { children: t, fallbackRender: e, FallbackComponent: o, fallback: n } = this.props, { didCatch: s, error: a } = this.state;
    let i = t;
    if (s) {
      const u = {
        error: a,
        resetErrorBoundary: this.resetErrorBoundary
      };
      if (typeof e == "function")
        i = e(u);
      else if (o)
        i = dashboard__loadShare__react__loadShare__.createElement(o, u);
      else if (n !== void 0)
        i = n;
      else
        throw a;
    }
    return dashboard__loadShare__react__loadShare__.createElement(
      h.Provider,
      {
        value: {
          didCatch: s,
          error: a,
          resetErrorBoundary: this.resetErrorBoundary
        }
      },
      i
    );
  }
}
function C(r = [], t = []) {
  return r.length !== t.length || r.some((e, o) => !Object.is(e, t[o]));
}

// dev uses dynamic import to separate chunks
    
    const {initPromise} = dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("react-router", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^7.12.0"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var dashboard__loadShare__react_mf_2_router__loadShare__ = exportModule;

export { dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__, dashboard__loadShare__react_mf_2_router__loadShare__, m };
