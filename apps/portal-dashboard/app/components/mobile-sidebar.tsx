import { Link, useLocation } from '@remix-run/react';
import { ChevronDownIcon, CircleLockIcon, ClockIcon, CloudUploadIcon, CurrentUsageIcon, DriveIcon, HamburgerMenuIcon, ThemeIcon } from './icons';
import LumeLogo from './lume-logo';
import NavigationButton from './navigation-button';
import { Button } from './ui/button';
import { UploadFileForm } from './general-layout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Avatar } from './ui/avatar';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "./ui/sheet"
import { ExitIcon } from '@radix-ui/react-icons';
import { useLogout } from '@refinedev/core';


const navigationLinks = [
    { path: "/dashboard", label: "Dashboard", icon: ClockIcon },
    { path: "/file-manager", label: "File Manager", icon: DriveIcon },
    { path: "/account", label: "Account", icon: CircleLockIcon },
];

export default function MobileSidebar() {
    const location = useLocation();
    const { mutate: logout } = useLogout();
    return (
        <>
            <header className="flex flex-row w-full max-h-30 items-center justify-between p-4  bg-secondary border-b">
                <LumeLogo />
                <nav className="relative">
                    <div className="flex items-center justify-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    className='bg-none outline-none h-full flex flex-row gap-2'>
                                    <Avatar className="bg-ring h-10 w-10 rounded-full" />
                                    <ChevronDownIcon />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => logout()}>
                                        <ExitIcon className="mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Sheet
                        >
                            <SheetTrigger>
                                <Button
                                    size="lg"
                                    className='h-full p-2 border border-border bg-none'
                                >
                                    <CloudUploadIcon className='w-7 h-7 text-foreground' />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="bottom"
                            >
                                <div className="w-full flex flex-col items-start justify-between my-auto">
                                    <div className="w-full flex flex-col">
                                        <UploadFileForm />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                        <Sheet>
                            <SheetTrigger>
                                <Button
                                    size="lg"
                                    className='h-full p-2 border border-border bg-none'
                                >
                                    <HamburgerMenuIcon className='text-foreground' />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetDescription>
                                        <div className="w-full flex flex-col items-start justify-between my-auto">
                                            <div className="w-full flex flex-col items-start justify-between ">
                                                {navigationLinks.map((link) => (
                                                    <Link
                                                        key={link.path}
                                                        to={link.path}>
                                                        <NavigationButton
                                                            active={location.pathname.includes(link.path)}
                                                        >
                                                            {link.icon && <link.icon className="w-5 h-5 mr-2" />}
                                                            {link.label}
                                                        </NavigationButton>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </SheetDescription>
                                </SheetHeader>
                            </SheetContent>
                        </Sheet>
                    </div>
                </nav>
            </header>
        </>
    );
}
