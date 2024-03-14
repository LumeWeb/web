import { cn } from "~/utils";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { AddIcon, EditIcon, FingerPrintIcon } from "./icons";
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { DialogContent, Portal } from "@radix-ui/react-dialog";

interface ManagementCardProps {
    title?: string;
    value?: string;
    subtitle?: string;
    isInviteCard?: boolean;
    isPasswordCard?: boolean;
    isAvatarCard?: boolean;
    isDeleteCard?: boolean
    buttonText?: string;
    buttonOnClick?: () => void
    dialogNode?: React.ReactNode
}

export const ManagementCard = ({
    title,
    isAvatarCard,
    isInviteCard,
    isPasswordCard,
    isDeleteCard,
    subtitle,
    value,
    buttonText,
    buttonOnClick,
    dialogNode
}: ManagementCardProps) => {
    const buttonVariant: string = isInviteCard ? "accent" : isDeleteCard ? "destructive" : "default";
    return (
        <div
            className={cn(
                "rounded-lg p-8 border w-full",
                isInviteCard && "border-ring",
                isAvatarCard && "flex justify-center items-center"
            )}
        >
            {isAvatarCard ? (
                <div className="relative w-fit h-fit">
                    <Avatar className="border-2 border-ring h-28 w-28" />
                    <Button
                        variant="outline"
                        className="h-10 w-10 rounded-full hover:bg-secondary-2 border-white absolute bottom-0 right-0 z-50"
                    >
                        <EditIcon />
                    </Button>
                </div>
            ) : (
                <>
                    <div className="flex gap-x-2 items-center">
                        <FingerPrintIcon className="text-ring" />
                        <h4 className="font-bold">{title}</h4>
                    </div>
                    {subtitle && (
                        <span className="text-primary-2 mt-4 mb-8 block text-sm">{subtitle}</span>
                    )}
                    {value && (
                        <span className="text-ring font-bold mt-4 mb-8 block text-sm">{value}</span>
                    )}
                    {isPasswordCard && <PasswordDots className="mt-6 mb-8 text-primary-2" />}
                    {!dialogNode ? (
                        <Button
                            onClick={buttonOnClick}
                            className={`h-12 gap-x-2`}
                            variant={buttonVariant}
                        >
                            <AddIcon />
                            {buttonText}
                        </Button>
                    ): (
                        <Dialog>
                            <DialogTrigger>Open</DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                <DialogTitle>Are you absolutely sure?</DialogTitle>
                                <DialogDescription>
                                    This action cannot be undone. This will permanently delete your account
                                    and remove your data from our servers.
                                </DialogDescription>
                                </DialogHeader>
                            </DialogContent>
                        </Dialog>

                    )}
                </>
            )}
        </div>
    );
};

const PasswordDots = ({ className }: { className?: string }) => {
    return (
        <svg
            width="219"
            height="7"
            viewBox="0 0 219 7"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <circle cx="3.7771" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="31.7771" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="45.7771" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="17.7771" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="59.7771" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="73.7771" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="87.7771" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="101.777" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="131.5" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="117.5" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="145.5" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="159.5" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="173.5" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="187.5" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="201.5" cy="3.5" r="3.5" fill="currentColor" />
            <circle cx="215.5" cy="3.5" r="3.5" fill="currentColor" />
        </svg>
    );
};
