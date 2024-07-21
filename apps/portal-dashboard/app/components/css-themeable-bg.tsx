interface CssThemeableBgProps {
  varName: string;
  className?: string;
}

export const CssThemeableBg: React.FC<CssThemeableBgProps> = ({
  varName,
  className,
}) => (
  <div className={`fixed inset-0 -z-10 overflow-clip ${className || ""}`}>
    <div
      className={
        "absolute top-0 right-0 w-full h-full object-cover z-[-1] !bg-cover lg:!bg-contain"
      }
      style={{
        background: `var(${varName})`,
        backgroundPosition: "right",
        backgroundRepeat: "no-repeat",
      }}
    />
  </div>
);
