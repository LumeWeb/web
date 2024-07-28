import { ClockIcon } from "@radix-ui/react-icons";
import { CircleLockIcon, DriveIcon } from "./icons";
import {
  Navigation,
  NavigationItem,
  NavigationItemContent,
  NavigationSubItem,
} from "./ui/navigation-menu";

const navigationLinks = [
  { path: "/dashboard", label: "Dashboard", icon: ClockIcon },
  { path: "/file-manager", label: "File Manager", icon: DriveIcon },
  {
    path: "/account",
    label: "Account",
    icon: CircleLockIcon,
    children: [
      { path: "/account/subscription", label: "Subscription" },
      { path: "/account/security", label: "Security" },
      { path: "/account/other", label: "Other" },
    ],
  },
];

export const MainNavigation = () => {
  return (
    <Navigation>
      {navigationLinks.map((link) => (
        <NavigationItem
          key={link.path}
          href={link.path}
          active={location.pathname.includes(link.path)}>
          <NavigationItemContent>
            {link.icon && <link.icon className="w-5 h-5 mr-2" />}
            {link.label}
          </NavigationItemContent>
          {link.children?.map((subItem) => (
            <NavigationSubItem key={subItem.path} href={subItem.path}>
              {subItem.label}
            </NavigationSubItem>
          ))}
        </NavigationItem>
      ))}
    </Navigation>
  );
};
