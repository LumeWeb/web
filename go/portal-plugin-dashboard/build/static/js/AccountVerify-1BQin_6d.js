import { jsxRuntimeExports } from './jsx-runtime-ta0kGoHj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-CequMnfU.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-2mQxKAcF.js';
import { core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ } from './core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__-DVwYt3d-.js';
import { core_dashboard__loadShare__react__loadShare__ } from './core_dashboard__loadShare__react__loadShare__-mOMo2i32.js';
import { core_dashboard__loadShare__react_mf_2_router__loadShare__ } from './core_dashboard__loadShare__react_mf_2_router__loadShare__-BiEltBUg.js';
import { useEmailVerification } from './useEmailVerification-Cq2zbvCo.js';

function AccountVerify() {
  const go = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGo();
  const [searchParams] = core_dashboard__loadShare__react_mf_2_router__loadShare__.useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const sdk = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useSdk();
  const user = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
  const [isVerified, setIsVerified] = core_dashboard__loadShare__react__loadShare__.useState(false);
  const {
    alreadyVerified,
    isLoading: isResendingVerification,
    resendVerification
  } = useEmailVerification();
  const { data: isAuthenticated, isLoading: isAuthLoading } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useIsAuthenticated();
  const userEmail = user.data?.email || email;
  const exchangeToken = core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    enabled: !isAuthLoading && !!userEmail && !!token,
    queryFn: async () => {
      const ret = await sdk.account().verifyEmail({
        email: userEmail,
        token
      });
      if (ret instanceof Error) {
        return Promise.reject(ret);
      }
      setIsVerified(true);
      return ret;
    },
    queryKey: ["exchange-token", token],
    retry: false
  });
  const handleRedirect = () => {
    if (isAuthenticated) {
      go({ to: "/dashboard" });
    } else {
      go({ to: "/login" });
    }
  };
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (alreadyVerified) {
      setIsVerified(true);
    }
  }, [alreadyVerified]);
  if (isAuthLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading..." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 h-screen relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { alt: "Lume logo", className: "h-10", src: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.logoPng }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex flex-col items-center justify-center h-full", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl mb-4", children: [
        exchangeToken.isLoading ? "Verifying your email." : null,
        isVerified ? "Your email has been verified" : null,
        !isVerified && exchangeToken.isError ? "Something went wrong, please try again" : null
      ] }),
      !isVerified && exchangeToken.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-60 mb-4", children: exchangeToken.error.message }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button,
          {
            disabled: isResendingVerification,
            onClick: resendVerification,
            children: isResendingVerification ? "Sending..." : "Send verification email again"
          }
        )
      ] }),
      isVerified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-60 mb-4", children: "Your email has been verified successfully." }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.Button, { onClick: handleRedirect, children: isAuthenticated ? "Go to Dashboard" : "Go to Login" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 -z-10 overflow-clip", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        alt: "Lume background",
        className: "absolute top-0 left-0 right-0 object-cover z-[-1]",
        src: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.lumeBgPng
      }
    ) })
  ] });
}

export { AccountVerify as default };
