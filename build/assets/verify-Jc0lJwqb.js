import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-IZdvEyt_.js";
import { B as Button } from "./button-CzfLTIHt.js";
import { L as Le, o as oo, M as Mr, I as useQuery } from "./index-DU1IfKY5.js";
import { l as logoPng } from "./lume-logo-ChvyOqr_.js";
import { u as useSdk } from "./useSdk-Bk9IxULM.js";
import { u as useEmailVerification } from "./useEmailVerification-CG_UnQY0.js";
import { a as useSearchParams } from "./index-CfDxhBvB.js";
import "./usePortalUrl-Bjyn0q0k.js";
import "./index-BpxO7BrF.js";
import "./index-BquAYmyk.js";
import "./index-O1NGHMyc.js";
const lumeBgPng = "/assets/lume-bg-image-CeL50W8O.png";
const meta = () => {
  return [{
    title: "Verify Email"
  }];
};
function Verify() {
  var _a;
  const go = Le();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const sdk = useSdk();
  const user = oo();
  const [isVerified, setIsVerified] = reactExports.useState(false);
  const {
    resendVerification,
    isLoading: isResendingVerification,
    alreadyVerified
  } = useEmailVerification();
  const {
    data: isAuthenticated,
    isLoading: isAuthLoading
  } = Mr();
  const userEmail = ((_a = user.data) == null ? void 0 : _a.email) || email;
  const exchangeToken = useQuery({
    queryKey: ["exchange-token", token],
    retry: false,
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
    }
  });
  const handleRedirect = () => {
    if (isAuthenticated) {
      go({
        to: "/dashboard"
      });
    } else {
      go({
        to: "/login"
      });
    }
  };
  reactExports.useEffect(() => {
    if (alreadyVerified) {
      setIsVerified(true);
    }
  }, [alreadyVerified]);
  if (isAuthLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      children: "Loading..."
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "p-10 h-screen relative",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("header", {
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
        src: logoPng,
        alt: "Lume logo",
        className: "h-10"
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("main", {
      className: "flex flex-col items-center justify-center h-full",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("h1", {
        className: "text-2xl mb-4",
        children: [exchangeToken.isLoading ? "Verifying your email." : null, isVerified ? "Your email has been verified" : null, !isVerified && exchangeToken.isError ? "Something went wrong, please try again" : null]
      }), !isVerified && exchangeToken.isError && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex flex-col items-center",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "opacity-60 mb-4",
          children: exchangeToken.error.message
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
          onClick: resendVerification,
          disabled: isResendingVerification,
          children: isResendingVerification ? "Sending..." : "Send verification email again"
        })]
      }), isVerified && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        className: "flex flex-col items-center",
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "opacity-60 mb-4",
          children: "Your email has been verified successfully."
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
          onClick: handleRedirect,
          children: isAuthenticated ? "Go to Dashboard" : "Go to Login"
        })]
      })]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "fixed inset-0 -z-10 overflow-clip",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
        src: lumeBgPng,
        alt: "Lume background",
        className: "absolute top-0 left-0 right-0 object-cover z-[-1]"
      })
    })]
  });
}
export {
  Verify as default,
  meta
};
