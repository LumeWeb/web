import type { Identity } from "@lumeweb/portal-framework-core";
import { useGetIdentity } from "@refinedev/core";

interface UseAvatarReturn {
  avatarUrl: string;
  displayName: string;
  isLoading: boolean;
}

export const useAvatar = (): UseAvatarReturn => {
  const { data: identity, isLoading } = useGetIdentity<Identity>();
  
  if (isLoading) {
    return {
      avatarUrl: "/placeholder.svg",
      displayName: "",
      isLoading: true,
    };
  }

  const avatarUrl = identity?.avatar 
    ? `${identity.avatar}?t=${Date.now()}`
    : "/placeholder.svg";
  const displayName = `${identity?.firstName || ""} ${identity?.lastName || ""}`.trim();

  return {
    avatarUrl,
    displayName,
    isLoading: false,
  };
};
