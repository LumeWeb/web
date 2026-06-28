"use client";

import type { Identity } from "@lumeweb/portal-framework-core";

import { Avatar, AvatarFallback, AvatarImage, Button, DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { Link, useGetIdentity, useLogout } from "@refinedev/core";

import React from "react";

import { useAvatar } from "@/hooks/useAvatar";
const LayoutGrid = lazyIcon("LayoutGrid");
const LogOut = lazyIcon("LogOut");
const User = lazyIcon("User");


export function UserNav() {
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity<Identity>();
  const { avatarUrl, displayName, isLoading } = useAvatar();

  const firstName = identity?.firstName || "";
  const lastName = identity?.lastName || "";
  const email = identity?.email || "";

  const getAvatarAltText = () => {
    if (isLoading) {
      return "User avatar";
    }

    if (displayName) {
      return displayName;
    }

    return "";
  };

  const getAvatarFallback = () => {
    if (isLoading) {
      return "?";
    }

    if (firstName || lastName) {
      return (firstName || lastName).charAt(0).toUpperCase();
    }

    if (email) {
      return email.charAt(0).toUpperCase();
    }

    return "?";
  };

  return (
    <DropdownMenu>
      <TooltipProvider disableHoverableContent>
        <Tooltip delayDuration={100}>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                aria-label={
                  isLoading ? "User avatar" : displayName || "User profile"
                }
                className="relative h-8 w-8 rounded-full"
                variant="outline">
                <Avatar className="h-8 w-8">
                  <AvatarImage alt={getAvatarAltText()} src={avatarUrl} />
                  <AvatarFallback className="bg-transparent">
                    {getAvatarFallback()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="bottom">Profile</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <DropdownMenuContent align="end" className="w-56" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {firstName} {lastName}
            </p>
            <p className="text-muted-foreground text-xs leading-none">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="hover:cursor-pointer">
            <Link className="flex items-center" to="/dashboard">
              <LayoutGrid className="text-muted-foreground mr-3 h-4 w-4" />
              Dashboard
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="hover:cursor-pointer">
            <Link className="flex items-center" to="/account">
              <User className="text-muted-foreground mr-3 h-4 w-4" />
              Account
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="hover:cursor-pointer"
          onClick={() => logout()}>
          <LogOut className="text-muted-foreground mr-3 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
