import { useMobileDetection } from "./useMobileDetection";
import { TableLayoutType } from "./DataTable.types";

interface UseTableLayoutSelectorProps {
  responsive?: boolean;
  mobileLayout?: TableLayoutType;
  mobileBreakpoint?: string;
}

function useTableLayoutSelector({
  responsive = false,
  mobileLayout = TableLayoutType.AUTO,
  mobileBreakpoint = 'sm'
}: UseTableLayoutSelectorProps) {
  const { isMobile } = useMobileDetection({ mobileBreakpoint });
  
  // Determine if we should show stacked layout
  const shouldShowStackedLayout = 
    responsive && 
    isMobile && 
    (mobileLayout === TableLayoutType.STACKED || mobileLayout === TableLayoutType.AUTO);
  
  return shouldShowStackedLayout ? TableLayoutType.STACKED : TableLayoutType.TABLE;
}

export { useTableLayoutSelector };
