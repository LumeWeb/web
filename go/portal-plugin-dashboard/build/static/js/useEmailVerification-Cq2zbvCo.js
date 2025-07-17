import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__-CequMnfU.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-2mQxKAcF.js';
import { core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__ } from './core_dashboard__loadShare___mf_0_tanstack_mf_1_react_mf_2_query__loadShare__-DVwYt3d-.js';
import { core_dashboard__loadShare__react__loadShare__ } from './core_dashboard__loadShare__react__loadShare__-mOMo2i32.js';
import { core_dashboard__loadShare__react_mf_2_router__loadShare__ } from './core_dashboard__loadShare__react_mf_2_router__loadShare__-BiEltBUg.js';

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
      let ret = await sdk.account().requestEmailVerification({
        email: user.data.email || email
      });
      if (ret instanceof Error) {
        throw ret;
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
      open?.({
        description: "Please try again later",
        message: "Failed to send email",
        type: "error"
      });
    },
    onSuccess() {
      open?.({
        description: "Please check your email inbox and click the link",
        message: "Email sent",
        type: "success"
      });
    }
  });
  const handleResendVerification = async () => verifyAgain.mutate();
  return {
    alreadyVerified,
    isLoading: verifyAgain.isPending || user.isLoading,
    resendVerification: handleResendVerification
  };
}

export { useEmailVerification };
