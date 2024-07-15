import logoPng from "apps/portal-dashboard/app/images/lume-logo.png?url";
import { Link } from "@remix-run/react";

export default function LumeLogo() {
  return (
    <Link
      to="/apps/portal-dashboard/public"
      className="flex items-center space-x-2">
      <img src={logoPng} alt="Lume logo" className="h-10" />
    </Link>
  );
}
