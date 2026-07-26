import type { ComponentType } from "react";
import SiteLogo from "@/assets/site-logo.svg";
import SiteLogoDark from "@/assets/site-logo-dark.svg";
import { Button } from "@/components/ui/button";
import { TrackedButton } from "@/components/TrackedButton";
import { TrackedLink } from "@/components/TrackedLink";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { appendUTMsToURL } from "@/lib/utm";
import { config } from "@/lib/config";
import contactsData from "@/data/contacts.json";
import { products, resources, staticNav, siaNav } from "@/data/navLinks";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ChevronDown, Globe, Pin, BookOpen, Newspaper, Github, Cpu, Tag, Info, ExternalLink } from "lucide-react";

/** Icon map for nav links: dynamically render lucide icons by name */
const iconMap: Record<string, ComponentType<{ className?: string }>> = {
  Globe,
  Pin,
  BookOpen,
  Newspaper,
  Github,
  Cpu,
  Tag,
  Info,
};

const NavIcon = ({ name }: { name?: string }) => {
  if (!name) return null;
  const Icon = iconMap[name];
  if (!Icon) return null;
  return <Icon className="w-4 h-4 opacity-70" />;
};

type MenuState = 0 | 1;

const menuStates: Record<MenuState, string> = {
	0: "opacity-0 lg:opacity-100 visible-hidden hidden lg:visible",
	1: "flex justify-between flex-col pb-16 md:pb-10 visible",
};

interface NavProps {
  theme?: "dark" | "light";
}

const Nav = ({ theme = "dark" }: NavProps) => {
  const isDark = theme === "dark";
  const textColor = isDark ? "text-home-text" : "text-content-text";
  const hoverColor = isDark ? "hover:text-white" : "hover:text-content-text";
  const borderColor = isDark ? "border-border-dark" : "border-content-divider";
  const bgColor = isDark ? "bg-content-text" : "bg-white";
  const headerLogo = isDark ? SiteLogo : SiteLogoDark;
  const hamburgerColor = isDark ? "bg-white" : "bg-content-text";

  const [toggleMenu, setToggleMenu] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);

  const handleToggleMenu = () => {
    const newState = !toggleMenu;
    setToggleMenu(newState);

    if (newState) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      window.posthog?.capture("nav_mobile_menu_opened");
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return (
    <>
      {/* Original header className preserved: pt-[58px] pb-[18px] for top spacing */}
      <header className="pt-[58px] pb-[18px] md:py-10 absolute w-full top-0 left-0 z-40">
        <div className="xl:container px-6">
          <div className="flex gap-[30px] justify-between items-center">
            <div className="flex items-center xl:gap-[36px] 2xl:gap-[60px]">
              <div className="relative z-40 min-w-24 flex items-center">
                <a href="/" aria-label="Pinner home">
                  <img src={headerLogo.src} alt="Pinner logo" width={160} height={40} className="h-10 w-auto" loading="eager" fetchPriority="high" />
                </a>
              </div>
              <nav
                className={cn(
                  menuStates[Number(toggleMenu) as MenuState],
                  "transition-all duration-300 ease-in-out fixed w-full top-0 pt-[130px] lg:pt-0 lg:block left-0",
                  bgColor,
                  "lg:static lg:bg-transparent md:px-0 h-dvh lg:h-auto"
                )}>
                <ul className="flex flex-col py-5 px-6 lg:flex-row lg:py-0 space-x-0 lg:space-x-6 xl:space-x-8 container">

                  {/* Products dropdown: desktop */}
                  <li className="hidden lg:block">
                    <NavigationMenu>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger
                            className={cn(
                              "bg-transparent border-none px-0 py-0 h-auto font-medium text-lg",
                              textColor,
                              "hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent",
                              "dark:hover:bg-transparent dark:focus:bg-transparent dark:data-[state=open]:bg-transparent"
                            )}
                          >
                            Products
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className={cn("rounded-lg border", isDark ? "bg-home-card-bg border-home-text/10" : "bg-white border-content-divider/50")}>
                            <ul className="grid w-[220px] gap-1 p-3">
                              {products.map((item) => (
                                <li key={item.href}>
                                  <NavigationMenuLink
                                    href={item.href}
                                    className={cn(
                                      "flex items-center gap-2.5 select-none rounded-md px-3 py-2 text-sm no-underline transition-colors",
                                      textColor,
                                      isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-black/5"
                                    )}
                                  >
                                    <NavIcon name={item.icon} />
                                    {item.label}
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  </li>

                  {/* Products: mobile accordion */}
                  <li className="lg:hidden">
                    <button
                      type="button"
                      onClick={() => setProductsOpen(!productsOpen)}
                      className={cn(
                        "w-full flex items-center justify-between leading-[50px] border-b",
                        borderColor,
                        "text-left text-[15px] font-medium transition ease-in-out duration-300",
                        textColor
                      )}
                      aria-expanded={productsOpen}
                    >
                      <span>Products</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          productsOpen && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    {productsOpen && (
                      <ul className="pl-4">
                        {products.map((item) => (
                          <li key={item.href}>
                            <a
                              href={item.href}
                              className={cn(
                                textColor,
                                "flex items-center gap-2 leading-[40px] border-b",
                                borderColor,
                                "text-[14px] font-medium transition ease-in-out duration-300"
                              )}
                            >
                              <NavIcon name={item.icon} />
                              {item.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>

                  {/* Resources dropdown: desktop */}
                  <li className="hidden lg:block">
                    <NavigationMenu>
                      <NavigationMenuList>
                        <NavigationMenuItem>
                          <NavigationMenuTrigger
                            className={cn(
                              "bg-transparent border-none px-0 py-0 h-auto font-medium text-lg",
                              textColor,
                              "hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent",
                              "dark:hover:bg-transparent dark:focus:bg-transparent dark:data-[state=open]:bg-transparent"
                            )}
                          >
                            Resources
                          </NavigationMenuTrigger>
                          <NavigationMenuContent className={cn("rounded-lg border", isDark ? "bg-home-card-bg border-home-text/10" : "bg-white border-content-divider/50")}>
                            <ul className="grid w-[220px] gap-1 p-3">
                              {resources.map((item) => (
                                <li key={item.label}>
                                  <NavigationMenuLink
                                    href={item.href}
                                    target={item.external ? "_blank" : undefined}
                                    rel={item.external ? "noopener noreferrer" : undefined}
                                    className={cn(
                                      "flex items-center gap-2.5 select-none rounded-md px-3 py-2 text-sm no-underline transition-colors",
                                      textColor,
                                      isDark ? "hover:bg-white/10 hover:text-white" : "hover:bg-black/5"
                                    )}
                                  >
                                    <NavIcon name={item.icon} />
                                    {item.label}
                                    {item.external && <ExternalLink className="w-3 h-3 ml-auto opacity-50" />}
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </NavigationMenuItem>
                      </NavigationMenuList>
                    </NavigationMenu>
                  </li>

                  {/* Resources: mobile accordion */}
                  <li className="lg:hidden">
                    <button
                      type="button"
                      onClick={() => setResourcesOpen(!resourcesOpen)}
                      className={cn(
                        "w-full flex items-center justify-between leading-[50px] border-b",
                        borderColor,
                        "text-left text-[15px] font-medium transition ease-in-out duration-300",
                        textColor
                      )}
                      aria-expanded={resourcesOpen}
                    >
                      <span>Resources</span>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform duration-200",
                          resourcesOpen && "rotate-180"
                        )}
                        aria-hidden="true"
                      />
                    </button>
                    {resourcesOpen && (
                      <ul className="pl-4">
                        {resources.map((item) => (
                          <li key={item.label}>
                            <a
                              href={item.href}
                              target={item.external ? "_blank" : undefined}
                              rel={item.external ? "noopener noreferrer" : undefined}
                              className={cn(
                                textColor,
                                "flex items-center gap-2 leading-[40px] border-b",
                                borderColor,
                                "text-[14px] font-medium transition ease-in-out duration-300"
                              )}
                            >
                              <NavIcon name={item.icon} />
                              {item.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>

                  {/* Static nav items */}
                  {staticNav.map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className={cn(
                          textColor,
                          "flex items-center gap-2 leading-[50px] border-b whitespace-nowrap",
                          borderColor,
                          "lg:border-transparent lg:leading-5 text-[15px] lg:text-lg font-medium transition ease-in-out duration-300 hover:border-b",
                          isDark ? "hover:border-home-text" : "hover:border-content-text"
                        )}>
                        <NavIcon name={item.icon} />
                        {item.label}
                        {item.external && <ExternalLink className="w-3 h-3 ml-1 opacity-50" />}
                      </a>
                    </li>
                  ))}

                  {/* Sia Network: custom heart icon link */}
                  <li>
                    <a
                      href={siaNav.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Learn about the Sia decentralized storage network"
                      className={cn(
                        "flex gap-2 items-center leading-[50px] border-b whitespace-nowrap",
                        borderColor,
                        "lg:border-transparent lg:leading-5 text-[15px] lg:text-lg font-medium transition ease-in-out duration-300",
                        textColor
                      )}>
                      {/* Sia heart SVG */}
                      <svg
                        height="18px"
                        width="18px"
                        version="1.1"
                        viewBox="0 0 512 512"
                        className="shrink-0">
                        <path
                          style={{ fill: isDark ? "var(--color-orange)" : "var(--color-orange-dark)" }}
                          d="M474.655,74.503C449.169,45.72,413.943,29.87,375.467,29.87c-30.225,0-58.5,12.299-81.767,35.566
	c-15.522,15.523-28.33,35.26-37.699,57.931c-9.371-22.671-22.177-42.407-37.699-57.931c-23.267-23.267-51.542-35.566-81.767-35.566
	c-38.477,0-73.702,15.851-99.188,44.634C13.612,101.305,0,137.911,0,174.936c0,44.458,13.452,88.335,39.981,130.418
	c21.009,33.324,50.227,65.585,86.845,95.889c62.046,51.348,123.114,78.995,125.683,80.146c2.203,0.988,4.779,0.988,6.981,0
	c2.57-1.151,63.637-28.798,125.683-80.146c36.618-30.304,65.836-62.565,86.845-95.889C498.548,263.271,512,219.394,512,174.936
	C512,137.911,498.388,101.305,474.655,74.503z"
                        />
                        <path
                          style={{ fill: isDark ? "var(--color-orange-dark)" : "var(--color-orange)" }}
                          d="M160.959,401.243c-36.618-30.304-65.836-62.565-86.845-95.889
	c-26.529-42.083-39.981-85.961-39.981-130.418c0-37.025,13.612-73.631,37.345-100.433c21.44-24.213,49.775-39.271,81.138-43.443
	c-5.286-0.786-10.653-1.189-16.082-1.189c-38.477,0-73.702,15.851-99.188,44.634C13.612,101.305,0,137.911,0,174.936
	c0,44.458,13.452,88.335,39.981,130.418c21.009,33.324,50.227,65.585,86.845,95.889c62.046,51.348,123.114,78.995,125.683,80.146
	c2.203,0.988,4.779,0.988,6.981,0c0.689-0.308,5.586-2.524,13.577-6.588C251.254,463.709,206.371,438.825,160.959,401.243z"
                        />
                      </svg>
                      Sia Network
                      <ExternalLink className="w-3 h-3 ml-1 opacity-50" />
                    </a>
                  </li>
                </ul>

                {/* Mobile footer inside drawer */}
                <div className="lg:hidden container text-center flex flex-col items-center gap-6 py-8">
                  <ul className="flex gap-8 items-center justify-center">
                    <li>
                      <a
                        href={contactsData.community.discord.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "text-base leading-[34px] transition ease-in-out duration-300 flex items-center gap-2",
                          textColor,
                          hoverColor
                        )}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M18.1031 2.625C18.3482 2.62302 18.5912 2.66949 18.8182 2.76172C19.0453 2.85396 19.2518 2.99015 19.4261 3.16247C19.6003 3.33479 19.7388 3.53983 19.8335 3.76583C19.9282 3.99183 19.9774 4.23432 19.9781 4.47938V20.625L18.0187 18.915L16.9106 17.9062L15.75 16.8356L16.2338 18.5006H5.89688C5.65183 18.5026 5.40881 18.4561 5.18178 18.3639C4.95474 18.2717 4.74818 18.1355 4.57394 17.9632C4.39971 17.7908 4.26124 17.5858 4.1665 17.3598C4.07176 17.1338 4.02261 16.8913 4.02188 16.6462V4.47938C4.02261 4.23432 4.07176 3.99183 4.1665 3.76583C4.26124 3.53983 4.39971 3.33479 4.57394 3.16247C4.74818 2.99015 4.95474 2.85396 5.18178 2.76172C5.40881 2.66949 5.65183 2.62302 5.89688 2.625H18.1031ZM18.1031 1.40625H5.89688C5.08064 1.40575 4.29753 1.72901 3.71932 2.30511C3.1411 2.88122 2.81498 3.66315 2.8125 4.47938V16.6481C2.81498 17.4647 3.14136 18.2469 3.71998 18.823C4.2986 19.3992 5.08219 19.7222 5.89875 19.7212H17.0869L17.19 19.8169L17.2013 19.8262H17.2125L19.1719 21.5362L21.1875 23.3062V4.47938C21.185 3.66315 20.8589 2.88122 20.2807 2.30511C19.7025 1.72901 18.9194 1.40575 18.1031 1.40625Z" fill={isDark ? "var(--color-home-text)" : "var(--color-content-text)"} />
                          <path d="M13.9314 13.7081C14.2051 14.0512 14.5332 14.4374 14.5332 14.4374C16.547 14.3737 17.3214 13.0687 17.3214 13.0687C17.2914 11.2413 16.8423 9.4452 16.0089 7.81869C15.2718 7.25161 14.3785 6.92438 13.4495 6.88119L13.322 7.02557C14.8707 7.49432 15.5907 8.16932 15.5907 8.16932C14.7413 7.70716 13.8104 7.41364 12.8495 7.30494C12.2378 7.23864 11.6204 7.24493 11.0101 7.32369C10.9578 7.32544 10.9057 7.33171 10.8545 7.34244C10.142 7.42177 9.44614 7.61154 8.79199 7.90494C8.44699 8.06244 8.25012 8.16557 8.25012 8.16557C8.25012 8.16557 9.00012 7.45494 10.6464 6.98619L10.5545 6.87744C9.62552 6.92063 8.73218 7.24786 7.99512 7.81494C7.16164 9.44145 6.71261 11.2376 6.68262 13.0649C6.68262 13.0649 7.44762 14.3774 9.46137 14.4337C9.46137 14.4337 9.79887 14.0287 10.0726 13.6837C8.91574 13.3424 8.47887 12.6224 8.47887 12.6224C8.47887 12.6224 8.57074 12.6862 8.73387 12.7762C8.7441 12.787 8.75616 12.7959 8.76949 12.8024C8.79762 12.8212 8.82387 12.8287 8.85199 12.8474C9.06665 12.9643 9.28905 13.0665 9.51762 13.1531C9.95131 13.3219 10.3994 13.4512 10.8564 13.5393C11.636 13.6841 12.4355 13.6841 13.2151 13.5393C13.6658 13.4606 14.1061 13.331 14.5276 13.1531C14.8958 13.0161 15.2474 12.8381 15.5757 12.6224C15.5757 12.6224 15.1257 13.3762 13.9314 13.7081ZM10.5564 12.4537C10.0501 12.4537 9.63387 11.9906 9.63387 11.4243C9.6183 11.2941 9.63051 11.162 9.66971 11.0368C9.70891 10.9116 9.77421 10.7962 9.86129 10.698C9.94837 10.5999 10.0553 10.5214 10.1749 10.4676C10.2946 10.4138 10.4242 10.386 10.5554 10.386C10.6866 10.386 10.8163 10.4138 10.936 10.4676C11.0556 10.5214 11.1625 10.5999 11.2496 10.698C11.3367 10.7962 11.4019 10.9116 11.4411 11.0368C11.4803 11.162 11.4926 11.2941 11.477 11.4243C11.4843 11.5528 11.4662 11.6815 11.4237 11.8029C11.3811 11.9244 11.315 12.0362 11.2291 12.1321C11.1432 12.2279 11.0392 12.3058 10.9232 12.3613C10.8071 12.4168 10.6811 12.4489 10.5526 12.4556L10.5564 12.4537ZM13.8545 12.4537C13.3464 12.4556 12.9376 11.9999 12.9376 11.4262C12.9572 11.248 12.9474 11.0741 12.9138 10.9006C12.9386 10.9985 12.9744 11.0936 13.019 11.1843C13.0761 11.2987 13.1536 11.4016 13.2467 11.4875C13.3681 11.6115 13.5211 11.7015 13.6933 11.751C13.8655 11.8006 14.0484 11.8076 14.224 11.7723C14.3996 11.737 14.5627 11.6613 14.7004 11.5517C14.8329 11.4432 14.9433 11.3098 15.0253 11.1589C15.1082 11.0059 15.1618 10.8374 15.1831 10.6628C15.2044 10.4882 15.1929 10.3115 15.148 10.1413C15.1076 9.9711 15.0344 9.81071 14.9327 9.66848C14.832 9.5262 14.7041 9.40416 14.5563 9.30811C14.4149 9.21113 14.2571 9.14025 14.0895 9.09719C14.0169 9.07869 13.9422 9.07066 13.8672 9.07227C14.1798 8.61537 14.3951 8.10521 14.4945 7.57227C14.6183 6.90438 14.5321 6.21524 14.2428 5.59319C13.9534 4.97113 13.4722 4.43977 12.8502 4.06303C12.2282 3.68629 11.5071 3.48419 10.7666 3.48296C10.0261 3.48174 9.3042 3.68171 8.68066 4.05648C8.05711 4.43125 7.57399 4.96083 7.28246 5.58175C6.99092 6.20267 6.9023 6.89151 7.0231 7.55901C7.1439 8.22651 7.46991 8.73922 7.75432 9.1161C7.99317 9.43465 8.32017 9.67928 8.69796 9.82448C8.35364 9.93947 8.02812 10.1045 7.7313 10.3138C7.03597 10.797 6.51946 11.4857 6.24846 12.2836C6.02951 12.9203 6.00866 13.6067 6.18924 14.2537C6.45854 15.1471 7.07184 15.9233 7.90553 16.4511C9.08875 17.2087 10.5466 17.4114 11.9088 17.0106C12.2517 16.9117 12.5789 16.7624 12.8836 16.5675C12.9063 16.5532 12.9293 16.5395 12.9525 16.5264C13.0364 16.4784 13.1181 16.427 13.1972 16.3721C13.2562 16.3312 13.3137 16.2889 13.3697 16.2451C13.7968 16.4968 14.2516 16.7048 14.7182 16.878C15.6023 17.2102 16.5482 17.3871 17.5016 17.396C18.4911 17.4052 19.4706 17.2199 20.3811 16.8505C21.2916 16.4811 22.1145 15.9347 22.8029 15.2421C22.9352 15.1087 23.0626 14.9708 23.1846 14.8285C22.935 15.269 22.6413 15.6838 22.3074 16.0672C22.0422 16.371 21.7523 16.6542 21.4405 16.9146L21.6789 17.9205C22.2338 17.6027 22.7511 17.2246 23.2214 16.7965C23.824 16.2468 24.344 15.6105 24.772 14.904C24.9313 14.6395 25.0795 14.3667 25.2161 14.0864C25.7957 12.9069 26.0982 11.6132 26.1023 10.3004C26.1023 5.33932 22.0265 1.56872 16.9468 1.47968C11.8671 1.39063 7.64546 5.0208 7.46716 9.978C5.8916 9.21677 4.52722 8.0912 3.49776 6.69475C2.46831 5.2983 1.80436 3.67156 1.56509 1.94807C1.40889 0.820583 2.64284 -0.189627 3.7469 0.0773194L4.49874 0.259669C5.6028 0.526615 6.79051 0.515088 7.88868 0.226152C8.98685 -0.0627842 9.96097 -0.619232 10.702 -0.378867L12.3677 0.166272C13.1087 0.406637 13.7253 1.16925 13.7253 1.16925C22.1003 1.60772 23.9955 6.80273 24.0258 10.3141C24.0273 10.3304 24.0273 10.3467 24.0273 10.363C24.0273 10.3793 24.27 17.4198 15.7738 18.6058C15.849 18.5976 15.8681 18.5926 15.9033 18.5914C15.9385  path truncated...  13.1563 13.5393L13.8564 13.5393C13.6658 13.4606 14.1061 13.331 14.5276 13.1531Z" fill={isDark ? "var(--color-home-text)" : "var(--color-content-text)"} />
                        </svg>
                        {contactsData.socialMeta.discord.handle}
                      </a>
                    </li>
                    <li>
                      <a
                        href={contactsData.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "text-base leading-[34px] transition ease-in-out duration-300 flex items-center gap-2",
                          textColor,
                          hoverColor
                        )}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M16.3011 5.74875C16.7938 5.75552 17.2802 5.86143 17.7312 6.06019C18.1822 6.25895 18.5886 6.54647 18.9261 6.90563C18.9261 6.90563 20.3586 6.62438 21.1498 6.0675C21.1498 6.0675 20.9511 7.17 19.6329 8.01375H19.6442C19.7454 8.01375 20.4842 7.995 21.6467 7.45125C21.6467 7.45125 21.4236 8.08688 19.9029 9.29625C19.9948 12.1575 18.5792 17.4469 13.3404 19.3294C12.1899 19.7503 10.9749 19.9679 9.7498 19.9725C7.787 19.9815 5.8644 19.4164 4.21855 18.3469C4.4998 18.375 4.75293 18.375 5.00605 18.375C8.10355 18.375 9.60355 16.785 9.52105 16.785H9.40668C6.78168 16.785 6.1423 14.2725 6.1423 14.2725C6.35254 14.3996 6.59646 14.4598 6.84168 14.445C7.15864 14.4384 7.47356 14.3924 7.77918 14.3081C4.81668 13.6069 4.9273 10.7644 4.9273 10.7644C5.32765 11.0316 5.79609 11.1786 6.2773 11.1881C6.35646 11.189 6.43553 11.1827 6.51355 11.1694C3.80793 9.02813 5.4373 6.4725 5.4373 6.4725C8.48605 10.0106 12.2342 10.1363 12.7498 10.1363H12.8117C12.5342 8.475 13.2186 6.87938 15.0617 6.01125C15.4462 5.83468 15.8649 5.74506 16.2879 5.74875M22.8748 3.375L20.4504 5.0775C20.0801 5.29945 19.6798 5.4668 19.2617 5.57438C18.4131 4.91177 17.3701 4.54675 16.2936 4.53563C15.6917 4.53006 15.0961 4.65814 14.5498 4.91063C12.8286 5.71875 11.7823 7.11375 11.5742 8.78813C9.53647 8.36786 7.70041 7.27177 6.36355 5.6775L5.2948 4.43813L4.41355 5.8125C3.84543 6.74839 3.62008 7.85258 3.77605 8.93625L3.70668 10.7231C3.69111 11.8574 4.068 12.9623 4.77355 13.8506L4.96105 14.5819C5.22998 15.5262 5.77602 16.3681 6.52855 16.9988C6.02789 17.1083 5.51668 17.1624 5.00418 17.16C4.78105 17.16 4.55043 17.1506 4.31793 17.1319L0.0185547 16.7738L3.49668 19.3294C5.35279 20.5506 7.528 21.197 9.7498 21.1875C11.1172 21.1838 12.7361 20.9427 14.7586 20.475C16.3362 19.5551 18.4633 17.6823 19.7023 15.2419C20.5593 13.5754 21.0437 11.7424 21.1217 9.87C22.3648 8.79938 22.7061 8.11688 22.7979 7.85625L23.7579 5.12438L22.4454 5.73563L22.8748 3.375Z" fill={isDark ? "var(--color-home-text)" : "var(--color-content-text)"} />
                        </svg>
                        {contactsData.socialMeta.twitter.handle}
                      </a>
                    </li>
                  </ul>
                  <a
                    href={`mailto:${contactsData.contact.email}`}
                    className={cn(
                      "underline text-base leading-[34px] transition ease-in-out duration-300",
                      textColor,
                      hoverColor
                    )}>
                    {contactsData.contact.email}
                  </a>
                </div>
              </nav>
            </div>

            {/* Desktop CTAs */}
            <div className="flex items-center space-x-5 whitespace-nowrap hidden lg:flex">
              <TrackedLink
                href={appendUTMsToURL(`${config.accountBaseUrl}/login`)}
                target="_blank"
                rel="noopener noreferrer"
                trackEvent="nav_sign_in_clicked"
                className={cn(
                  "font-medium text-lg transition ease-in-out duration-300",
                  textColor,
                  hoverColor
                )}>
                Sign In
              </TrackedLink>
              <TrackedButton
                label="Create account"
                url={config.registerUrl()}
                target="_blank"
                buttonStyle={isDark ? "default" : "outline-dark"}
                trackEvent="nav_create_account_clicked"
              />
            </div>

            {/* Mobile toggle */}
            <div className="lg:hidden flex items-center space-x-4 relative z-40">
              <Button label="Sign In" size="sm" url={`${config.accountBaseUrl}/login`} target="_blank" buttonStyle={isDark ? "default" : "outline-dark"} />
              <div
                className="relative cursor-pointer"
                onClick={handleToggleMenu}>
                <span className={cn("block w-6 h-0.5 my-1.5", hamburgerColor)}></span>
                <span className={cn("block w-6 h-0.5 my-1.5", hamburgerColor)}></span>
                <span className={cn("block w-6 h-0.5 my-1.5", hamburgerColor)}></span>
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Nav;
