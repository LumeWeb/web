import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 640; // Define a breakpoint for mobile devices

export function useMobile(breakpoint = MOBILE_BREAKPOINT) {
  const [mobile, setMobile] = useState<boolean>(
    window.innerWidth <= breakpoint,
  );

  useEffect(() => {
    const handleResize = () => {
      setMobile(window.innerWidth <= breakpoint);
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [breakpoint]);

  return mobile;
}
