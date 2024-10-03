import AccountUsage from "@/routes/account/components/AccountUsage.js";
import ManagementGrid from "@/components/ManagementGrid.js";
import { useState } from "react";
import {
  ManagementCard,
  ManagementCardContent,
  ManagementCardFooter,
  ManagementCardTitle,
} from "@/components/ManagementCard.js";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog.js";
import { Button } from "@/components/ui/button.js";
import { AddIcon, RemoveIcon } from "@/components/icons.js";
import { useGetIdentity } from "@refinedev/core";
import SetupTwoFactorDialog from "@/routes/account/components/SetupTwoFactorDialog.js";
import DisableTwoFactorDialog from "@/routes/account/components/DisableTwoFactorDialog.js";

interface ModalState {
  setupTwoFactor: boolean;
  disableTwoFactor: boolean;
}

export default function Security() {
  const { data: identity } = useGetIdentity<{ email: string }>();
  const [openModal, setModal] = useState<ModalState>({
    setupTwoFactor: false,
    disableTwoFactor: false,
  });

  const closeModal = () => {
    setModal({
      setupTwoFactor: false,
      disableTwoFactor: false,
    });
  };
  const isModalOpen = Object.values(openModal).some((isOpen) => isOpen);

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          closeModal();
        }
      }}
      open={isModalOpen}>
      <div className="mt-10">
        <AccountUsage />
      </div>
      <div className={"mt-10"}>
        <ManagementGrid>
          <ManagementCard>
            <ManagementCardTitle>Two-Factor Authentication</ManagementCardTitle>
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
        </ManagementGrid>
        <DialogContent>
          {openModal.setupTwoFactor && (
            <SetupTwoFactorDialog close={closeModal} />
          )}
          {openModal.disableTwoFactor && (
            <DisableTwoFactorDialog close={closeModal} />
          )}
        </DialogContent>
      </div>
    </Dialog>
  );
}
