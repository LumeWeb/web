import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, core_dashboard__loadShare__react__loadShare__, jsxRuntimeExports } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { logoPng, lumeBgPng } from './images-D17WGACk.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-CUREaEX2.js';
import { useEmailVerification, core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ } from './useEmailVerification-CuFmSrml.js';
import { core_dashboard__loadShare__react_mf_2_router__loadShare__ } from './core_dashboard__loadShare__react_mf_2_router__loadShare__-CShhB-Ww.js';

const VerificationStatus = ({
  alreadyVerified,
  error,
  isAuthenticated,
  isError,
  isLoading,
  isResendingVerification,
  isVerified,
  onRedirect,
  onResend
}) => {
  if (isLoading && !alreadyVerified) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(VerificationLoading, {});
  }
  if (isVerified && !alreadyVerified) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      NewVerificationSuccess,
      {
        isAuthenticated,
        onRedirect
      }
    );
  }
  if (alreadyVerified) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      AlreadyVerified,
      {
        isAuthenticated,
        onRedirect
      }
    );
  }
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      VerificationError,
      {
        error,
        isResending: isResendingVerification,
        onResend
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(VerificationDefault, { onResend });
};
const VerificationLoading = () => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl mb-4", children: "Verifying your email" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-60", children: "Please wait while we verify your email..." })
] });
const NewVerificationSuccess = ({
  isAuthenticated,
  onRedirect
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl mb-4", children: "Your email has been verified" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-60 mb-4", children: "Your email has been verified successfully." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { onClick: onRedirect, children: isAuthenticated ? "Go to Dashboard" : "Go to Login" })
] });
const AlreadyVerified = ({
  isAuthenticated,
  onRedirect
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl mb-4", children: "Email already verified" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-60 mb-4", children: "This email address was already verified." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { onClick: onRedirect, children: isAuthenticated ? "Go to Dashboard" : "Go to Login" })
] });
const VerificationError = ({
  error,
  isResending,
  onResend
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl mb-4", children: "Something went wrong" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-60 mb-4", children: typeof error === "string" ? error : error?.message ?? "An unexpected error occurred" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { disabled: isResending, onClick: onResend, children: isResending ? "Sending..." : "Send verification email again" })
] });
const VerificationDefault = ({ onResend }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl mb-4", children: "Verify your email" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-60 mb-4", children: "Click below to receive a new verification email" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { onClick: onResend, children: "Send verification email" })
] });
const MissingParametersError = ({
  email,
  token,
  onResend
}) => {
  const go = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGo();
  let message = "The verification link is missing required information.";
  if (!email && !token) {
    message = "The verification link is missing both email and verification code.";
  } else if (!email) {
    message = "The verification link is missing the email address.";
  } else if (!token) {
    message = "The verification link is missing the verification code.";
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl mb-4", children: "Invalid verification link" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-60 mb-4", children: message }),
    !token && email ? /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { onClick: onResend, children: "Resend Verification Email" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { onClick: () => go({ to: "/dashboard" }), children: "Go to Dashboard" })
  ] });
};
function AccountVerify() {
  const go = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGo();
  const [searchParams] = core_dashboard__loadShare__react_mf_2_router__loadShare__.useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const sdk = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useSdk();
  const user = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
  const [isVerified, setIsVerified] = core_dashboard__loadShare__react__loadShare__.useState(false);
  const [alreadyVerified, setAlreadyVerified] = core_dashboard__loadShare__react__loadShare__.useState(false);
  const {
    alreadyVerified: emailAlreadyVerified,
    isLoading: isResendingVerification,
    resendVerification
  } = useEmailVerification();
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (emailAlreadyVerified) {
      setAlreadyVerified(true);
    }
  }, [emailAlreadyVerified]);
  const { data: isAuthenticated, isLoading: isAuthLoading } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useIsAuthenticated();
  const userEmail = user.data?.email || email;
  const exchangeToken = core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    enabled: !isAuthLoading && !!userEmail && !!token && !alreadyVerified && !emailAlreadyVerified,
    queryFn: async () => {
      const ret = await sdk.account().verifyEmail({
        email: userEmail,
        token
      });
      if (ret.error) {
        if (ret.error.statusCode === 409) {
          setAlreadyVerified(true);
          return ret;
        }
        return Promise.reject(ret.error);
      }
      setIsVerified(true);
      setAlreadyVerified(false);
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
  if (isAuthLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Loading..." });
  }
  if (!userEmail || !token) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 h-screen relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("header", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { alt: "Lume logo", className: "h-10", src: logoPng }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex flex-col items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MissingParametersError,
        {
          email: userEmail,
          token,
          onResend: resendVerification
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 -z-10 overflow-clip", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          alt: "Lume background",
          className: "absolute top-0 left-0 right-0 object-cover z-[-1]",
          src: lumeBgPng
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-10 h-screen relative", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { alt: "Lume logo", className: "h-10", src: logoPng }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex flex-col items-center justify-center h-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      VerificationStatus,
      {
        alreadyVerified,
        error: exchangeToken.error,
        isAuthenticated,
        isError: exchangeToken.isError,
        isLoading: exchangeToken.isLoading,
        isResendingVerification,
        isVerified,
        onRedirect: handleRedirect,
        onResend: resendVerification
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 -z-10 overflow-clip", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      "img",
      {
        alt: "Lume background",
        className: "absolute top-0 left-0 right-0 object-cover z-[-1]",
        src: lumeBgPng
      }
    ) })
  ] });
}
const account_verify = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.withTheme(AccountVerify);

export { account_verify as default };
