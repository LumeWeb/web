import { cn } from "@/lib/utils";
import { themeStyles } from "./theme";

interface SkeletonCardProps {
  variant: "dark" | "light";
}

export function SkeletonCard({ variant }: SkeletonCardProps) {
  const theme = themeStyles[variant];

  return (
    <div
      className={cn(
        "py-[28px] lg:py-[50px] px-[30px] lg:px-[40px] border rounded-lg animate-pulse"
      )}
    >
      <div className={cn(theme.skeleton, "h-8 w-32 rounded mb-4")} />
      <div className={cn(theme.skeleton, "h-5 w-48 rounded mb-6")} />
      <div className={cn(theme.skeleton, "h-12 w-24 rounded mb-2")} />
      <div className={cn(theme.skeleton, "h-4 w-32 rounded mb-8")} />
      <div className={cn(theme.skeleton, "h-12 w-36 rounded-full")} />
    </div>
  );
}
