import {
  ManagementCard,
  ManagementCardContent,
  ManagementCardFooter,
  ManagementCardTitle,
} from "@/ui/components/ManagementCard";
import ManagementGrid from "@/ui/components/ManagementGrid";
import { Identity } from "@lumeweb/portal-framework-core";
import {
  AddIcon,
  Button,
  Dialog,
  DialogContent,
  DialogTrigger,
  RemoveIcon,
} from "@lumeweb/portal-framework-ui";
import { useGetIdentity } from "@refinedev/core";
import "@lumeweb/portal-framework-ui-core/tailwind.css";
import React, { useState } from "react";

import DisableTwoFactorDialog from "../components/account/DisableTwoFactorDialog";
import SetupTwoFactorDialog from "../components/account/SetupTwoFactorDialog";

interface ModalState {
  disableTwoFactor: boolean;
  setupTwoFactor: boolean;
}

function Security() {
  const { data: identity } = useGetIdentity<Identity>();
  const [openModal, setModal] = useState<ModalState>({
    disableTwoFactor: false,
    setupTwoFactor: false,
  });

  const closeModal = () => {
    setModal({
      disableTwoFactor: false,
      setupTwoFactor: false,
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
      <div className="mt-10"></div>
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

export default Security;
