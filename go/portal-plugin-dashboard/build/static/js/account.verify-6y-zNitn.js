import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, core_dashboard__loadShare__react__loadShare__, jsxRuntimeExports } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-D-EDec9Y.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-BRPNVk8X.js';
import { logoPng, lumeBgPng } from './images-D17WGACk.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-ImaNZ9yu.js';
import { useEmailVerification, core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ } from './useEmailVerification-C0SkifwU.js';
import { core_dashboard__loadShare__react_mf_2_router__loadShare__ } from './core_dashboard__loadShare__react_mf_2_router__loadShare__-BFaT_n3N.js';

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
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-2xl", children: "Verifying your email" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "opacity-60", children: "Please wait while we verify your email..." })
] });
const NewVerificationSuccess = ({
  isAuthenticated,
  onRedirect
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-2xl", children: "Your email has been verified" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 opacity-60", children: "Your email has been verified successfully." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { onClick: onRedirect, children: isAuthenticated ? "Go to Dashboard" : "Go to Login" })
] });
const AlreadyVerified = ({
  isAuthenticated,
  onRedirect
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-2xl", children: "Email already verified" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 opacity-60", children: "This email address was already verified." }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { onClick: onRedirect, children: isAuthenticated ? "Go to Dashboard" : "Go to Login" })
] });
const VerificationError = ({
  error,
  isResending,
  onResend
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-2xl", children: "Something went wrong" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 opacity-60", children: typeof error === "string" ? error : error?.message ?? "An unexpected error occurred" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { disabled: isResending, onClick: onResend, children: isResending ? "Sending..." : "Send verification email again" })
] });
const VerificationDefault = ({ onResend }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-2xl", children: "Verify your email" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 opacity-60", children: "Click below to receive a new verification email" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { onClick: onResend, children: "Send verification email" })
] });
const MissingParametersError = ({
  email,
  onResend,
  token
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
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "mb-4 text-2xl", children: "Invalid verification link" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mb-4 opacity-60", children: message }),
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
  const {
    data: isAuthenticated,
    isLoading: isAuthLoading,
    refetch: refetchAuth
  } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useIsAuthenticated();
  const userEmail = email || user.data?.email;
  const exchangeToken = core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useQuery({
    enabled: !isAuthLoading && !!userEmail && !!token && !alreadyVerified && !emailAlreadyVerified,
    queryFn: async () => {
      const ret = await sdk.account().verifyEmail(
        {
          email: userEmail,
          token
        },
        true
      );
      if (ret.error) {
        if (ret.error.statusCode === 409) {
          setAlreadyVerified(true);
          return ret;
        }
        return Promise.reject(ret.error);
      }
      setIsVerified(true);
      await Promise.all([sdk.account().ping(), refetchAuth()]);
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
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-screen p-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("header", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { alt: "Lume logo", className: "h-10", src: logoPng }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex h-full flex-col items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        MissingParametersError,
        {
          email: userEmail,
          onResend: resendVerification,
          token
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 -z-10 overflow-clip", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          alt: "Lume background",
          className: "absolute left-0 right-0 top-0 z-[-1] object-cover",
          src: lumeBgPng
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-screen p-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { alt: "Lume logo", className: "h-10", src: logoPng }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex h-full flex-col items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
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
        className: "absolute left-0 right-0 top-0 z-[-1] object-cover",
        src: lumeBgPng
      }
    ) })
  ] });
}
const account_verify = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.withTheme(AccountVerify);

export { account_verify as default };
