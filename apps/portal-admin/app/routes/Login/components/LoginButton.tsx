import { Button } from "~/components/ui/button.js";
import usePortalMeta from "~/hooks/usePortalMeta";

export default function LoginButton() {
  const portalMeta = usePortalMeta();

  if (!portalMeta) {
    return <div>Loading...</div>;
  }

  const clickHandler = () => {
    window.location.href = `https://account.${portalMeta.domain}/login?admin=true`;
  };

  return <Button onClick={clickHandler}>Login</Button>;
}
