import {Authenticated} from "@refinedev/core";
import {Navigate} from "@remix-run/react";

export default function Index() {
    return (
        <Authenticated v3LegacyAuthProviderCompatible key={"index"} loading={
            <>Checking Login Status</>
        }>
            <Navigate to="/dashboard" replace/>
        </Authenticated>
    )
}
