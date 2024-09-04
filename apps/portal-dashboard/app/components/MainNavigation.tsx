import { ClockIcon } from "@radix-ui/react-icons";
import { CircleLockIcon, DriveIcon } from "./icons";
import {
  Navigation,
  NavigationItem,
  NavigationItemContent,
  NavigationSubItem,
} from "./ui/navigation-menu";
import { useGetToPath, useList, useMenu } from "@refinedev/core";
import { createElement } from "react";
// @ts-ignore
import { TreeMenuItem } from "@refinedev/core/src/hooks/menu/useMenu.js";
import { ServiceItem } from "~/dataProviders/serviceProvider.js";

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

const NavItemContent: React.FC<{
  item: TreeMenuItem;
  active: boolean;
  subItems?: TreeMenuItem[];
}> = ({ item, active, subItems }) => {
  return (
    <NavigationItem active={active} key={item.key} href={item.route}>
      <NavigationItemContent>
        {item.icon &&
          createElement(item.icon, {
            className: "w-5 h-5 mr-2",
          })}
        {item.label}
      </NavigationItemContent>
      {subItems?.map((subItem) => {
        return (
          <NavigationSubItem href={subItem.route} key={subItem.key}>
            {subItem.label}
          </NavigationSubItem>
        );
      })}
    </NavigationItem>
  );
};

const DynamicNavItem: React.FC<{ item: TreeMenuItem; active: boolean }> = ({
  item,
  active,
}) => {
  const resource = useList<ServiceItem>({
    resource: item.name,
  });
  const getToPath = useGetToPath();

  if (resource.isLoading) {
    return null;
  }

  const items =
    resource.data?.data
      .map((subItem) => {
        if (!item.meta?.dynamicToItem) return null;
        let res = item.meta.dynamicToItem(subItem);
        if (res) {
          res.route = getToPath({
            resource: item,
            action: "show",
            meta: res.meta,
          });
        }
        return res;
      })
      .filter(Boolean) || [];

  return <NavItemContent item={item} active={active} subItems={items} />;
};

const StaticNavItem: React.FC<{ item: TreeMenuItem; active: boolean }> = ({
  item,
  active,
}) => <NavItemContent item={item} active={active} subItems={item.children} />;

const NavItem: React.FC<{ item: TreeMenuItem; active: boolean }> = ({
  item,
  active,
}) => {
  return item.meta?.dynamic ? (
    <DynamicNavItem item={item} active={active} />
  ) : (
    <StaticNavItem item={item} active={active} />
  );
};

export const MainNavigation = () => {
  const { menuItems, selectedKey } = useMenu({ hideOnMissingParameter: false });

  const keyTree = selectedKey.split("/").slice(1);

  const renderNavigationItem = (item: any) => {
    const normalizedKey = item.key.split("/").slice(1).pop();
    return (
      <NavItem
        key={item.key}
        item={item}
        active={keyTree[0] === normalizedKey}
      />
    );
  };

  return <Navigation>{menuItems.map(renderNavigationItem)}</Navigation>;
};
