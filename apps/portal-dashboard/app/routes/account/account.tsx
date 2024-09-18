import { useGetIdentity } from "@refinedev/core";
import { useState } from "react";
import {
  AddIcon,
  CloudIcon,
  CrownIcon,
  EditIcon,
  RemoveIcon,
} from "@/components/icons.js";
import {
  ManagementCard,
  ManagementCardAvatar,
  ManagementCardContent,
  ManagementCardFooter,
  ManagementCardTitle,
} from "@/components/ManagementCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.js";
import { UsageCard } from "@/components/UsageCard";
import PasswordDots from "./components/PasswordDots";
import ChangeAvatarForm from "./components/ChangeAvatarForm";
import ChangeEmailForm from "./components/ChangeEmailForm";
import ChangePasswordForm from "./components/ChangePasswordForm";
import SetupTwoFactorDialog from "./components/SetupTwoFactorDialog";
import DisableTwoFactorDialog from "./components/DisableTwoFactorDialog";
import DeleteAccountDialog from "@/routes/account/components/DeleteAccountDialog.js";

interface ModalState {
  changeEmail: boolean;
  changePassword: boolean;
  setupTwoFactor: boolean;
  disableTwoFactor: boolean;
  changeAvatar: boolean;
  deleteAccount: boolean;
}

export default function MyAccount() {
  const { data: identity } = useGetIdentity<{ email: string }>();

  const [openModal, setModal] = useState<ModalState>({
    changeEmail: false,
    changePassword: false,
    setupTwoFactor: false,
    disableTwoFactor: false,
    changeAvatar: false,
    deleteAccount: false,
  });

  const closeModal = () => {
    setModal({
      changeEmail: false,
      changePassword: false,
      setupTwoFactor: false,
      disableTwoFactor: false,
      changeAvatar: false,
      deleteAccount: false,
    });
  };
  const isModalOpen = Object.values(openModal).some((isOpen) => isOpen);

  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
        open={isModalOpen}>
        <div className="mt-10">
          <UsageCard
            label="Usage"
            currentUsage={2}
            monthlyUsage={10}
            icon={<CloudIcon className="text-foreground" />}
            button={
              <Button variant="accent" className="gap-x-2 h-12 text-foreground">
                <AddIcon />
                Upgrade to Premium
              </Button>
            }
          />
        </div>
        <h2 className="font-bold my-8">Account Management</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4">
          <ManagementCard>
            <ManagementCardAvatar
              button={
                <DialogTrigger
                  asChild
                  className="absolute bottom-0 right-0 z-50">
                  <Button
                    onClick={() =>
                      setModal({ ...openModal, changeAvatar: true })
                    }
                    variant="outline"
                    className=" flex items-center w-10 h-10 p-0 border-border rounded-full justify-center hover:bg-ring">
                    <EditIcon />
                  </Button>
                </DialogTrigger>
              }
            />
          </ManagementCard>
          <ManagementCard>
            <ManagementCardTitle>Email Address</ManagementCardTitle>
            <ManagementCardContent className="text-foreground font-semibold">
              {identity?.email}
            </ManagementCardContent>
            <ManagementCardFooter>
              <DialogTrigger asChild>
                <Button
                  className="h-12 gap-x-2"
                  onClick={() => setModal({ ...openModal, changeEmail: true })}>
                  <AddIcon />
                  Change Email Address
                </Button>
              </DialogTrigger>
            </ManagementCardFooter>
          </ManagementCard>
          <ManagementCard>
            <ManagementCardTitle>Account Type</ManagementCardTitle>
            <ManagementCardContent className="text-foreground font-semibold flex gap-x-2">
              Lite Premium Account
              <CrownIcon />
            </ManagementCardContent>
            <ManagementCardFooter>
              <Button className="h-12 gap-x-2 text-foreground">
                <AddIcon />
                Upgrade to Premium
              </Button>
            </ManagementCardFooter>
          </ManagementCard>
        </div>
        <h2 className="font-bold my-8">Security</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4">
          <ManagementCard>
            <ManagementCardTitle>Password</ManagementCardTitle>
            <ManagementCardContent className="text-foreground">
              <PasswordDots className="mt-6" />
            </ManagementCardContent>
            <ManagementCardFooter>
              <DialogTrigger asChild>
                <Button
                  className="h-12 gap-x-2"
                  onClick={() =>
                    setModal({ ...openModal, changePassword: true })
                  }>
                  <AddIcon />
                  Change Password
                </Button>
              </DialogTrigger>
            </ManagementCardFooter>
          </ManagementCard>
          {
            <ManagementCard>
              <ManagementCardTitle>
                Two-Factor Authentication
              </ManagementCardTitle>
              <ManagementCardContent className="text-foreground">
                Improve security by enabling 2FA.
              </ManagementCardContent>
              {!identity?.otp && (
                <ManagementCardFooter>
                  <DialogTrigger asChild>
                    <Button
                      className="h-12 gap-x-2"
                      onClick={() =>
                        setModal({ ...openModal, setupTwoFactor: true })
                      }>
                      <AddIcon />
                      Enable Two-Factor Authorization
                    </Button>
                  </DialogTrigger>
                </ManagementCardFooter>
              )}
              {identity?.otp && (
                <ManagementCardFooter>
                  <DialogTrigger asChild>
                    <Button
                      className="h-12 gap-x-2"
                      onClick={() =>
                        setModal({ ...openModal, disableTwoFactor: true })
                      }>
                      <RemoveIcon />
                      Disable Two-Factor Authorization
                    </Button>
                  </DialogTrigger>
                </ManagementCardFooter>
              )}
            </ManagementCard>
          }
        </div>
        <h2 className="font-bold my-8">More</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-4">
          <ManagementCard>
            <ManagementCardTitle>Invite a Friend</ManagementCardTitle>
            <ManagementCardContent className="text-foreground">
              Get 1 GB per friend invited for free (max 5 GB).
            </ManagementCardContent>
            <ManagementCardFooter>
              <Button variant="accent" className="h-12 gap-x-2 text-foreground">
                <AddIcon />
                Send Invitation
              </Button>
            </ManagementCardFooter>
          </ManagementCard>
          <ManagementCard>
            <ManagementCardTitle>Read our Resources</ManagementCardTitle>
            <ManagementCardContent className="text-foreground">
              Navigate helpful articles or get assistance.
            </ManagementCardContent>
            <ManagementCardFooter>
              <Button className="h-12 gap-x-2">
                <AddIcon />
                Open Support Centre
              </Button>
            </ManagementCardFooter>
          </ManagementCard>
          <ManagementCard>
            <ManagementCardTitle>Delete Account</ManagementCardTitle>
            <ManagementCardContent className="text-foreground">
              Once initiated, this action cannot be undone.
            </ManagementCardContent>
            <ManagementCardFooter>
              <Button
                className="h-12 gap-x-2"
                variant="destructive"
                onClick={() => setModal({ ...openModal, deleteAccount: true })}>
                <AddIcon />
                Delete my Account
              </Button>
            </ManagementCardFooter>
          </ManagementCard>
        </div>
        <DialogContent>
          {openModal.changeAvatar && <ChangeAvatarForm close={closeModal} />}
          {openModal.changeEmail && (
            <ChangeEmailForm
              currentValue={identity?.email || ""}
              close={closeModal}
            />
          )}
          {openModal.changePassword && (
            <ChangePasswordForm close={closeModal} />
          )}
          {openModal.setupTwoFactor && (
            <SetupTwoFactorDialog close={closeModal} />
          )}
          {openModal.disableTwoFactor && (
            <DisableTwoFactorDialog close={closeModal} />
          )}
          {openModal.deleteAccount && (
            <DeleteAccountDialog close={closeModal} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
