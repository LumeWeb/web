import { useEffect, useState } from "react";

// Create a mapping from Tailwind CSS breakpoint names to their pixel values
const tailwindBreakpoints: Record<string, number> = {
  "xs": 0,      // 0px and up
  "sm": 640,    // 640px and up
  "md": 768,    // 768px and up
  "lg": 1024,   // 1024px and up
  "xl": 1280,   // 1280px and up
  "2xl": 1536,  // 1536px and up
};

interface UseMobileDetectionProps {
  breakpoint?: number | string; // number for pixels, string for Tailwind breakpoint names
  useMatchMedia?: boolean; // default true for better performance
}

interface UseMobileDetectionReturn {
  isMobile: boolean;
  currentBreakpoint: string;
  currentWidth: number;
}

/**
 * Hook to detect mobile viewport based on breakpoints
 * @param props.breakpoint - The breakpoint at which to consider the viewport mobile (default: "sm")
 * @param props.useMatchMedia - Whether to use matchMedia API for better performance (default: true)
 * @returns isMobile state, current breakpoint name, and current viewport width
 */
export function useMobileDetection({
  breakpoint = "sm",
  useMatchMedia = true,
}: UseMobileDetectionProps = {}): UseMobileDetectionReturn {
  // State to track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);
  // State to track current breakpoint
  const [currentBreakpoint, setCurrentBreakpoint] = useState("xs");
  // State to track current viewport width
  const [currentWidth, setCurrentWidth] = useState(0);

  useEffect(() => {
    // Convert breakpoint to pixel value if needed
    const breakpointValue = 
      typeof breakpoint === "string" 
        ? tailwindBreakpoints[breakpoint] || tailwindBreakpoints.sm 
        : breakpoint;

    // Function to determine current breakpoint based on viewport width
    const getCurrentBreakpoint = (width: number): string => {
      let breakpoint = "xs";
      for (const [bp, value] of Object.entries(tailwindBreakpoints)) {
        if (width >= value) {
          breakpoint = bp;
        }
      }
      return breakpoint;
    };

    // Function to check if current viewport is mobile
    const checkIsMobile = () => {
      const width = window.innerWidth;
      setCurrentWidth(width);
      setCurrentBreakpoint(getCurrentBreakpoint(width));
      setIsMobile(width < breakpointValue);
    };

    // Initial check
    checkIsMobile();

    // Use matchMedia API if available and requested
    if (useMatchMedia && window.matchMedia) {
      // Create media query for the breakpoint
      const mq = window.matchMedia(`(max-width: ${breakpointValue - 1}px)`);
      
      // Handler for matchMedia changes
      const handleChange = () => {
        setIsMobile(mq.matches);
        const width = window.innerWidth;
        setCurrentWidth(width);
        setCurrentBreakpoint(getCurrentBreakpoint(width));
      };

      // Add listener
      mq.addEventListener("change", handleChange);
      
      // Set initial value
      setIsMobile(mq.matches);

      // Cleanup
      return () => {
        mq.removeEventListener("change", handleChange);
      };
    } else {
      // Fallback to resize events
      window.addEventListener("resize", checkIsMobile);
      
      // Cleanup
      return () => {
        window.removeEventListener("resize", checkIsMobile);
      };
    }
  }, [breakpoint, useMatchMedia]);

  return { isMobile, currentBreakpoint, currentWidth };
}
