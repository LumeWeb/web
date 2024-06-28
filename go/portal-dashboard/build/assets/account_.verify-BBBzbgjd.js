import { j as jsxRuntimeExports, r as reactExports } from "./index-DVnsepjX.js";
import { B as Button } from "./button-DaxcZJYV.js";
import { l as logoPng } from "./lume-logo-ChvyOqr_.js";
import { q as qu, g as ge, w as we, $ as $r, u as useQuery, b as useMutation } from "./index-DajgEckg.js";
import { u as useSdk } from "./sdk-context-DS7Hx_ov.js";
import { a as useSearchParams } from "./index-BPJinGo7.js";
import "./utils-DrdLlttq.js";
const lumeBgPng = "/assets/lume-bg-image-CeL50W8O.png";
const meta = () => {
  return [{
    title: "Verify Email"
  }];
};
function Verify() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(qu, {
    v3LegacyAuthProviderCompatible: true,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(VerifyAuthenticated, {})
  }, "");
}
function VerifyAuthenticated() {
  var _a;
  const go = ge();
  const {
    open
  } = we();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const sdk = useSdk();
  const user = $r();
  const exchangeToken = useQuery({
    queryKey: ["exchange-token", token],
    retry: false,
    enabled: !!((_a = user.data) == null ? void 0 : _a.email) && !!token,
    queryFn: async () => {
      var _a2;
      const ret = await sdk.account().verifyEmail({
        email: (_a2 = user.data) == null ? void 0 : _a2.email,
        token
      });
      if (ret instanceof Error) {
        return Promise.reject(ret);
      }
      return ret;
    }
  });
  const verifyAgain = useMutation({
    mutationFn: () => {
      return sdk.account().requestEmailVerification();
    },
    onMutate() {
      open == null ? void 0 : open({
        type: "success",
        message: "Email sent",
        description: "Please check your email inbox and click the link"
      });
    }
  });
  reactExports.useEffect(() => {
    if (exchangeToken.isSuccess) {
      go({
        to: "/dashboard"
      });
    }
  }, [go, exchangeToken.isSuccess]);
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
        className: "text-2xl",
        children: [exchangeToken.isLoading ? "Verifying your email." : null, exchangeToken.isSuccess && !exchangeToken.isLoading ? "Your email has been verified" : null, exchangeToken.isError && !exchangeToken.isLoading ? "Something went wrong, please try again" : null]
      }), exchangeToken.isError ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "opacity-60",
          children: exchangeToken.error.message
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
          onClick: () => {
            verifyAgain.mutate();
          },
          children: "Send verification email again"
        })]
      }) : null, exchangeToken.isSuccess ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
        className: "opacity-60",
        children: "Redirecting to your dashboard"
      }) : null]
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
