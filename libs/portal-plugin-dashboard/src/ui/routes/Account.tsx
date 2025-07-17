import {
  AddIcon,
  Button,
  CrownIcon,
  Dialog,
  DialogContent,
  DialogTrigger,
  usePluginMeta,
} from "@lumeweb/portal-framework-ui";
import { useGetIdentity } from "@refinedev/core";
import React, { useState } from "react";
import { Link } from "react-router";
import ChangeEmailForm from "src/ui/components/account/ChangeEmailForm";
import ChangePasswordForm from "src/ui/components/account/ChangePasswordForm";
import DeleteAccountDialog from "src/ui/components/account/DeleteAccountDialog";
import DisableTwoFactorDialog from "src/ui/components/account/DisableTwoFactorDialog";
import PasswordDots from "src/ui/components/account/PasswordDots";
import SetupTwoFactorDialog from "src/ui/components/account/SetupTwoFactorDialog";
import {
  ManagementCard,
  ManagementCardContent,
  ManagementCardFooter,
  ManagementCardTitle,
} from "src/ui/components/ManagementCard";
import ManagementGrid from "src/ui/components/ManagementGrid";

interface ModalState {
  changeAvatar: boolean;
  changeEmail: boolean;
  changePassword: boolean;
  deleteAccount: boolean;
  disableTwoFactor: boolean;
  setupTwoFactor: boolean;
}

function Account() {
  const { data: identity } = useGetIdentity<{ email: string }>();
  const [openModal, setModal] = useState<ModalState>({
    changeAvatar: false,
    changeEmail: false,
    changePassword: false,
    deleteAccount: false,
    disableTwoFactor: false,
    setupTwoFactor: false,
  });

  const closeModal = () => {
    setModal({
      changeAvatar: false,
      changeEmail: false,
      changePassword: false,
      deleteAccount: false,
      disableTwoFactor: false,
      setupTwoFactor: false,
    });
  };
  const isModalOpen = Object.values(openModal).some((isOpen) => isOpen);

  const billingEnabled = false;
  const paidBillingEnabled = false;
  const supportEnabled = false;

  const supportPortalUrl = usePluginMeta("support", "support_portal");
  const supportPortalMailboxID = usePluginMeta("support", "mailbox_id");

  const supportPortalUrlSSO = `${supportPortalUrl}/help/${supportPortalMailboxID}/oauth`;

  const subscription = {} as any;

  return (
    <>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            closeModal();
          }
        }}
        open={isModalOpen}>
        <div className="mt-10"></div>
        <div className={"mt-10"}>
          <ManagementGrid>
            <ManagementCard>
              <ManagementCardTitle>Email Address</ManagementCardTitle>
              <ManagementCardContent className="text-foreground font-semibold">
                {identity?.email}
              </ManagementCardContent>
              <ManagementCardFooter>
                <DialogTrigger asChild>
                  <Button
                    className="h-12 gap-x-2"
                    onClick={() =>
                      setModal({ ...openModal, changeEmail: true })
                    }>
                    <AddIcon />
                    Change Email Address
                  </Button>
                </DialogTrigger>
              </ManagementCardFooter>
            </ManagementCard>
            {billingEnabled && paidBillingEnabled && (
              <ManagementCard>
                <ManagementCardTitle>Account Type</ManagementCardTitle>
                <ManagementCardContent className="text-foreground font-semibold flex gap-x-2">
                  <span>{subscription?.subscriptionData?.plan?.name}</span>
                  <CrownIcon />
                </ManagementCardContent>
                <ManagementCardFooter>
                  {paidBillingEnabled && (
                    <Link to="/account/subscription">
                      <Button className="h-12 gap-x-2 text-foreground">
                        <AddIcon />
                        Change Plan
                      </Button>
                    </Link>
                  )}
                </ManagementCardFooter>
              </ManagementCard>
            )}
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
            {supportEnabled && (
              <ManagementCard>
                <ManagementCardTitle>Read our Resources</ManagementCardTitle>
                <ManagementCardContent className="text-foreground">
                  Navigate helpful articles or get assistance.
                </ManagementCardContent>
                <ManagementCardFooter>
                  <Link target="_blank" to={supportPortalUrlSSO}>
                    <Button className="h-12 gap-x-2">
                      <AddIcon />
                      Open Help Center
                    </Button>
                  </Link>
                </ManagementCardFooter>
              </ManagementCard>
            )}
            <ManagementCard>
              <ManagementCardTitle>Delete Account</ManagementCardTitle>
              <ManagementCardContent className="text-foreground">
                Once initiated, this action cannot be undone.
              </ManagementCardContent>
              <ManagementCardFooter>
                <Button
                  className="h-12 gap-x-2"
                  onClick={() =>
                    setModal({ ...openModal, deleteAccount: true })
                  }
                  variant="destructive">
                  <AddIcon />
                  Delete my Account
                </Button>
              </ManagementCardFooter>
            </ManagementCard>
          </ManagementGrid>
        </div>
        <DialogContent>
          {openModal.changeEmail && (
            <ChangeEmailForm
              close={closeModal}
              currentValue={identity?.email || ""}
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
export default Account;
