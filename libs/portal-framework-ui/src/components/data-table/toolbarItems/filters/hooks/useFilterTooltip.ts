import React, { useState, useRef } from "react";

interface ActiveTooltip {
  content: string;
  x: number;
  y: number;
}

interface UseFilterTooltipReturn {
  activeTooltip: ActiveTooltip | null;
  tooltipRef: React.RefObject<HTMLDivElement>;
  handleItemHover: (content: string, e: React.MouseEvent, containerRef?: React.RefObject<HTMLElement>) => void;
  handleItemLeave: () => void;
  closeTooltip: () => void;
}

export function useFilterTooltip(): UseFilterTooltipReturn {
  const [activeTooltip, setActiveTooltip] = useState<ActiveTooltip | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleItemHover = (content: string, e: React.MouseEvent, containerRef?: React.RefObject<HTMLElement>) => {
    if (content && containerRef?.current) {
      const containerRect = containerRef.current.getBoundingClientRect();

      const x = (e.clientX - containerRect.width) / 2;
      const y = ((e.clientY - containerRect.height) / 2) * 0.85;

      setActiveTooltip({
        content,
        x,
        y,
      });
    } else {
      setActiveTooltip(null);
    }
  };

  const handleItemLeave = () => {
    setActiveTooltip(null);
  };

  const closeTooltip = () => {
    setActiveTooltip(null);
  };

  return {
    activeTooltip,
    tooltipRef,
    handleItemHover,
    handleItemLeave,
    closeTooltip,
  };
}