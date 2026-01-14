import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, core_dashboard__loadShare__react__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-D-EDec9Y.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-ImaNZ9yu.js';
import { core_dashboard__mf_v__runtimeInit__mf_v__ } from './core_dashboard__mf_v__runtimeInit__mf_v__-BS5DE-ec.js';
import { core_dashboard__loadShare__react_mf_2_router__loadShare__ } from './core_dashboard__loadShare__react_mf_2_router__loadShare__-BFaT_n3N.js';

// dev uses dynamic import to separate chunks
    
    const {initPromise} = core_dashboard__mf_v__runtimeInit__mf_v__;
    const res = initPromise.then(runtime => runtime.loadShare("@tanstack/react-query", {
      customShareInfo: {shareConfig:{
        singleton: true,
        strictVersion: false,
        requiredVersion: "^5.90.16"
      }}
    }));
    const exportModule = await res.then(factory => factory());
    var core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ = exportModule;

function useEmailVerification() {
  const sdk = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useSdk();
  const { open } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useNotification();
  const [alreadyVerified, setAlreadyVerified] = core_dashboard__loadShare__react__loadShare__.useState(false);
  const user = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useGetIdentity();
  const [searchParams] = core_dashboard__loadShare__react_mf_2_router__loadShare__.useSearchParams();
  const email = searchParams.get("email");
  core_dashboard__loadShare__react__loadShare__.useEffect(() => {
    if (user.data?.verified) {
      setAlreadyVerified(true);
    }
  }, [user.data?.verified]);
  const verifyAgain = core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__.useMutation({
    mutationFn: async () => {
      const emailToVerify = user.data?.email ?? email;
      if (!emailToVerify) {
        open?.({
          description: "No email address found",
          message: "Email verification failed",
          type: "error"
        });
        return;
      }
      try {
        const ret = await sdk.account().requestEmailVerification({
          email: emailToVerify
        });
        if (ret instanceof Error) {
          throw ret;
        }
      } catch (error) {
        open?.({
          description: "Please try again later",
          message: "Failed to send email",
          type: "error"
        });
        throw error;
      }
    },
    onError(error) {
      if (error?.toString().toLowerCase().includes("already verified")) {
        setAlreadyVerified(true);
        open?.({
          description: "You can now login",
          message: "Email already verified",
          type: "error"
        });
        return;
      }
    },
    onSuccess() {
      open?.({
        description: "Please check your email inbox and click the link",
        message: "Email sent",
        type: "success"
      });
    }
  });
  if (!sdk) {
    return {};
  }
  const handleResendVerification = async () => verifyAgain.mutate();
  return {
    alreadyVerified,
    isLoading: verifyAgain.isLoading || user.isLoading,
    resendVerification: handleResendVerification
  };
}

export { core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__, useEmailVerification };
