import { u as useSdk } from "./useSdk-Bpz5OkDI.js";
import { c as $e, o as oo, J as useMutation } from "./index-C-G3KncW.js";
import { r as reactExports } from "./jsx-runtime-IZdvEyt_.js";
import { a as useSearchParams } from "./index-CVd92JJe.js";
function useEmailVerification() {
  var _a;
  const sdk = useSdk();
  const { open } = $e();
  const [alreadyVerified, setAlreadyVerified] = reactExports.useState(false);
  const user = oo();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");
  reactExports.useEffect(() => {
    var _a2;
    if ((_a2 = user.data) == null ? void 0 : _a2.verified) {
      setAlreadyVerified(true);
    }
  }, [(_a = user.data) == null ? void 0 : _a.verified]);
  const verifyAgain = useMutation({
    mutationFn: async () => {
      let ret = await sdk.account().requestEmailVerification({
        email: user.data.email || email
      });
      if (ret instanceof Error) {
        throw ret;
      }
    },
    onSuccess() {
      open == null ? void 0 : open({
        type: "success",
        message: "Email sent",
        description: "Please check your email inbox and click the link"
      });
    },
    onError(error) {
      if (error == null ? void 0 : error.toString().toLowerCase().includes("already verified")) {
        setAlreadyVerified(true);
        open == null ? void 0 : open({
          type: "error",
          message: "Email already verified",
          description: "You can now login"
        });
        return;
      }
      open == null ? void 0 : open({
        type: "error",
        message: "Failed to send email",
        description: "Please try again later"
      });
    }
  });
  const handleResendVerification = async () => verifyAgain.mutate();
  return {
    alreadyVerified,
    resendVerification: handleResendVerification,
    isLoading: verifyAgain.isLoading || user.isLoading
  };
}
export {
  useEmailVerification as u
};
