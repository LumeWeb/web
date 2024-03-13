import Login from "./login";
import {useGo, useIsAuthenticated} from "@refinedev/core";
import {useEffect} from "react";

export default function Index() {
    const {isLoading, data} = useIsAuthenticated();

    const go = useGo();

    useEffect(() => {
        if (!isLoading) {
            if (data?.authenticated) {
                go({to: "/dashboard", type: "replace"});
            } else {
                go({to: "/login", type: "replace"});
            }
        }
    }, [isLoading, data]);

    if (isLoading) {
        return <>Checking Login Status</> || null;
    }

    return (<>Redirecting</>) || null;
}
