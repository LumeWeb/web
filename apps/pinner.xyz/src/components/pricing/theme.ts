export const themeStyles = {
  dark: {
    card: "bg-home-card-bg border-home-card-bg",
    title: "text-home-text",
    description: "text-home-text-muted",
    price: "text-home-text",
    priceSub: "text-home-text-muted",
    toggleBg: "bg-home-card-bg",
    toggleActive: "bg-white text-content-text",
    toggleInactive: "text-home-text-muted",
    skeleton: "bg-home-card-bg/60",
    errorText: "text-home-text-muted",
  },
  light: {
    card: "bg-content-section-gray border-content-section-gray",
    title: "text-content-text",
    description: "text-content-text-muted",
    price: "text-content-text",
    priceSub: "text-content-text-muted",
    toggleBg: "bg-content-section-gray",
    toggleActive: "bg-content-text text-white",
    toggleInactive: "text-content-text-muted",
    skeleton: "bg-content-section-gray/60",
    errorText: "text-content-text-muted",
  },
} as const;

export type ThemeConfig = (typeof themeStyles)[keyof typeof themeStyles];
