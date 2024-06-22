import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 640; // Define a breakpoint for mobile devices

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= MOBILE_BREAKPOINT);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isMobile;
};

export default useIsMobile;
