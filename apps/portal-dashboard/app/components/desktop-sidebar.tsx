import { Dialog, DialogTrigger, DialogContent } from '@radix-ui/react-dialog'
import { Link } from '@remix-run/react'
import React from 'react'
import { CircleLockIcon, ClockIcon, CloudUploadIcon, DriveIcon } from './icons'
import LumeLogo from './lume-logo'
import NavigationButton from './navigation-button'
import { Button } from './ui/button'
import { UploadFileForm } from './general-layout'
import { UploadFileButton } from './upload-file-button'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'


const navigationLinks = [
  { path: "/dashboard", label: "Dashboard", icon: ClockIcon },
  { path: "/file-manager", label: "File Manager", icon: DriveIcon },
  { path: "/account", label: "Account", icon: CircleLockIcon },
];

export default function DesktopSidebar() {
  return (
    <header className="p-10 pr-0 flex flex-col w-[240px] h-full scroll-m-0 overflow-hidden">
      <LumeLogo />
      <nav className="my-10 flex-1">
        {
          navigationLinks.map((link) => (
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
          ))
        }
      </nav>
      <span className="text-foreground/60 mb-3 space-y-1 ">
        <p
        >Freedom</p>
        <p>Privacy</p>
        <p>Ownership</p>
      </span>

      <Sheet>
        <SheetTrigger>
          <UploadFileButton />
        </SheetTrigger>
        <SheetContent>
          <UploadFileForm />
        </SheetContent>
      </Sheet>
      {/* <Dialog>
        <DialogTrigger asChild>
          <Button size={"lg"} className="w-full text-base font-semibold bg-[#FFE478] hover:bg-current/60 text-gray-800 mt-10 lg:mt-4">
            <CloudUploadIcon className="mr-1" />
            Upload
          </Button>
        </DialogTrigger>
        <DialogContent className="border rounded-lg p-8">
          <UploadFileForm />
        </DialogContent>
      </Dialog> */}
    </header>
  )
}
