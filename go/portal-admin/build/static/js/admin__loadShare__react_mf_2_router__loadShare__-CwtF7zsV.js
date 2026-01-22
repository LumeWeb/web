import { admin__mf_v__runtimeInit__mf_v__ } from './admin__mf_v__runtimeInit__mf_v__-B2PJI9hS.js';
import { admin__loadShare__react__loadShare__ } from './admin__loadShare__react__loadShare__-BY1INpNu.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise: initPromise$1} = admin__mf_v__runtimeInit__mf_v__;
    const res$1 = initPromise$1.then(runtime => runtime.loadShare("@lumeweb/portal-framework-ui-core", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^0.1.0"
      }}
    }));
    const exportModule$1 = await res$1.then(factory => factory());
    var admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ = exportModule$1;

const h = admin__loadShare__react__loadShare__.createContext(null), c = {
  didCatch: false,
  error: null
};
class m extends admin__loadShare__react__loadShare__.Component {
  constructor(e) {
    super(e), this.resetErrorBoundary = this.resetErrorBoundary.bind(this), this.state = c;
  }
  static getDerivedStateFromError(e) {
    return { didCatch: true, error: e };
  }
  resetErrorBoundary(...e) {
    const { error: t } = this.state;
    t !== null && (this.props.onReset?.({
      args: e,
      reason: "imperative-api"
    }), this.setState(c));
  }
  componentDidCatch(e, t) {
    this.props.onError?.(e, t);
  }
  componentDidUpdate(e, t) {
    const { didCatch: o } = this.state, { resetKeys: s } = this.props;
    o && t.error !== null && C(e.resetKeys, s) && (this.props.onReset?.({
      next: s,
      prev: e.resetKeys,
      reason: "keys"
    }), this.setState(c));
  }
  render() {
    const { children: e, fallbackRender: t, FallbackComponent: o, fallback: s } = this.props, { didCatch: n, error: a } = this.state;
    let i = e;
    if (n) {
      const u = {
        error: a,
        resetErrorBoundary: this.resetErrorBoundary
      };
      if (typeof t == "function")
        i = t(u);
      else if (o)
        i = admin__loadShare__react__loadShare__.createElement(o, u);
      else if (s !== void 0)
        i = s;
      else
        throw a;
    }
    return admin__loadShare__react__loadShare__.createElement(
      h.Provider,
      {
        value: {
          didCatch: n,
          error: a,
          resetErrorBoundary: this.resetErrorBoundary
        }
      },
      i
    );
  }
}
function C(r = [], e = []) {
  return r.length !== e.length || r.some((t, o) => !Object.is(t, e[o]));
}

// dev uses dynamic import to separate chunks
    
    const {initPromise} = admin__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("react-router", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^7.12.0"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var admin__loadShare__react_mf_2_router__loadShare__ = exportModule;

export { admin__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__, admin__loadShare__react_mf_2_router__loadShare__, m };
