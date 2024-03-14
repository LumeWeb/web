import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { z } from "zod";
import { Field } from "~/components/forms";
import { GeneralLayout } from "~/components/general-layout";
import { AddIcon, CloudIcon, CrownIcon } from "~/components/icons";
import { ManagementCard, ManagementCardAvatar, ManagementCardContent, ManagementCardFooter, ManagementCardTitle } from "~/components/management-card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { UsageCard } from "~/components/usage-card";

import QRImg from "~/images/QR.png";

export default function MyAccount() {
  const isLogged = true;
  if (!isLogged) {
    window.location.href = "/login";
  }

  const [openModal, setModal] = useState({
    changeEmail: false,
    changePassword: false,
    setupTwoFactor: false,
  });

  return (
    <GeneralLayout>
      <h1 className="text-lg font-bold mb-4">My Account</h1>
      <UsageCard
        label="Usage"
        currentUsage={2}
        monthlyUsage={10}
        icon={<CloudIcon className="text-ring" />}
        button={
          <Button variant="accent" className="gap-x-2 h-12">
            <AddIcon />
            Upgrade to Premium
          </Button>
        }
      />
      <h2 className="font-bold my-8">Account Management</h2>
      <div className="grid grid-cols-3 gap-x-8">
        <ManagementCard>
          <ManagementCardAvatar />
        </ManagementCard>
        <ManagementCard>
          <ManagementCardTitle>Email Address</ManagementCardTitle>
          <ManagementCardContent className="text-ring font-semibold">
          bsimpson@springfield.oh.gov.com
          </ManagementCardContent>
          <ManagementCardFooter>
            <Button className="h-12 gap-x-2" onClick={() => setModal({ ...openModal, changeEmail: true })}>
              <AddIcon />
              Change Email Address
            </Button>
          </ManagementCardFooter>
        </ManagementCard>
        <ManagementCard>
          <ManagementCardTitle>Account Type</ManagementCardTitle>
          <ManagementCardContent className="text-ring font-semibold flex gap-x-2">
          Lite Premium Account
          <CrownIcon />
          </ManagementCardContent>
          <ManagementCardFooter>
            <Button className="h-12 gap-x-2">
              <AddIcon />
              Upgrade to Premium
            </Button>
          </ManagementCardFooter>
        </ManagementCard>
      </div>
      <h2 className="font-bold my-8">Security</h2>
      <div className="grid grid-cols-3 gap-x-8">
        <ManagementCard>
          <ManagementCardTitle>Password</ManagementCardTitle>
          <ManagementCardContent>
            <PasswordDots className="mt-6" />
          </ManagementCardContent>
          <ManagementCardFooter>
            <Button className="h-12 gap-x-2" onClick={() => setModal({ ...openModal, changePassword: true })}>
              <AddIcon />
              Change Password
            </Button>
          </ManagementCardFooter>
        </ManagementCard>
        <ManagementCard>
          <ManagementCardTitle>Two-Factor Authentication</ManagementCardTitle>
          <ManagementCardContent>
          Improve security by enabling 2FA.
          </ManagementCardContent>
          <ManagementCardFooter>
            <Button className="h-12 gap-x-2" onClick={() => setModal({ ...openModal, setupTwoFactor: true })}>
              <AddIcon />
              Enable Two-Factor Authorization
            </Button>
          </ManagementCardFooter>
        </ManagementCard>
        <ManagementCard>
          <ManagementCardTitle>Backup Key</ManagementCardTitle>
          <ManagementCardContent>
          Never share this code with anyone.
          </ManagementCardContent>
          <ManagementCardFooter>
            <Button className="h-12 gap-x-2">
              <AddIcon />
              Export Backup Key
            </Button>
          </ManagementCardFooter>
        </ManagementCard>
      </div>
      <h2 className="font-bold my-8">More</h2>
      <div className="grid grid-cols-3 gap-x-8">
        <ManagementCard variant="accent">
          <ManagementCardTitle>Invite a Friend</ManagementCardTitle>
          <ManagementCardContent>Get 1 GB per friend invited for free (max 5 GB).</ManagementCardContent>
          <ManagementCardFooter>
          <Button variant="accent" className="h-12 gap-x-2">
              <AddIcon />
              Send Invitation
            </Button>
          </ManagementCardFooter>
        </ManagementCard>
        <ManagementCard>
          <ManagementCardTitle>Read our Resources</ManagementCardTitle>
          <ManagementCardContent>Navigate helpful articles or get assistance.</ManagementCardContent>
          <ManagementCardFooter>
            <Button className="h-12 gap-x-2">
              <AddIcon />
              Open Support Centre
            </Button>
          </ManagementCardFooter>
        </ManagementCard>
        <ManagementCard>
          <ManagementCardTitle>Delete Account</ManagementCardTitle>
          <ManagementCardContent>Once initiated, this action cannot be undone.</ManagementCardContent>
          <ManagementCardFooter>
            <Button className="h-12 gap-x-2" variant="destructive">
              <AddIcon />
              Delete my Account
            </Button>
          </ManagementCardFooter>
        </ManagementCard>
      </div>
      {/* Dialogs must be near to body as possible to open the modal, otherwise will be restricted to parent height-width */}
      <ChangeEmailForm
        open={openModal.changeEmail}
        setOpen={(value: boolean) =>
          setModal({ ...openModal, changeEmail: value })
        }
        currentValue="bsimpson@springfield.oh.gov.com"
      />
      <ChangePasswordForm
        open={openModal.changePassword}
        setOpen={(value: boolean) =>
          setModal({ ...openModal, changePassword: value })
        }
      />
      <SetupTwoFactorDialog
        open={openModal.setupTwoFactor}
        setOpen={(value: boolean) =>
          setModal({ ...openModal, setupTwoFactor: value })
        }
      />
    </GeneralLayout>
  );
}

const ChangeEmailSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  retypePassword: z.string(),
});

const ChangeEmailForm = ({
  open,
  setOpen,
  currentValue,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  currentValue: string;
}) => {
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(ChangeEmailSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ChangeEmailSchema });
    },
    shouldValidate: "onSubmit",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle className="mb-8">Change Email</DialogTitle>
          <div className="rounded-full px-4 py-2 w-fit text-sm bg-ring font-bold text-secondary-1">
            {currentValue}
          </div>
          <form {...getFormProps(form)}>
            <Field
              className="mt-8"
              inputProps={{ name: fields.email.name }}
              labelProps={{ children: "New Email Address" }}
              errors={fields.email.errors}
            />
            <Field
              inputProps={{ name: fields.password.name, type: "password" }}
              labelProps={{ children: "Password" }}
              errors={fields.password.errors}
            />
            <Field
              inputProps={{
                name: fields.retypePassword.name,
                type: "password",
              }}
              labelProps={{ children: "Retype Password" }}
              errors={fields.retypePassword.errors}
            />
            <Button className="w-full h-14">Change Email Address</Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const ChangePasswordSchema = z.object({
  currentPassword: z.string().email(),
  newPassword: z.string(),
  retypePassword: z.string(),
});

const ChangePasswordForm = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(ChangeEmailSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ChangePasswordSchema });
    },
    shouldValidate: "onSubmit",
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle className="mb-8">Change Password</DialogTitle>
          <form {...getFormProps(form)}>
            <Field
              inputProps={{
                name: fields.currentPassword.name,
                type: "password",
              }}
              labelProps={{ children: "Current Password" }}
              errors={fields.currentPassword.errors}
            />
            <Field
              inputProps={{ name: fields.newPassword.name, type: "password" }}
              labelProps={{ children: "Password" }}
              errors={fields.newPassword.errors}
            />
            <Field
              inputProps={{
                name: fields.retypePassword.name,
                type: "password",
              }}
              labelProps={{ children: "Retype Password" }}
              errors={fields.retypePassword.errors}
            />
            <Button className="w-full h-14">Change Password</Button>
          </form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

const SetupTwoFactorDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  const [continueModal, setContinue] = useState<boolean>(false);

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        setContinue(false);
      }}>
      <DialogContent className="p-8">
        <DialogHeader>
          <DialogTitle className="mb-8">Setup Two-Factor</DialogTitle>
          <div className="flex flex-col gap-y-6">
            {continueModal ? (
              <>
                <p className="text-sm text-primary-2">
                  Enter the authentication code generated in your two-factor
                  application to confirm your setup.
                </p>
                <Input fullWidth className="text-center" />
                <Button className="w-full h-14">Confirm</Button>
              </>
            ) : (
              <>
                <div className="p-6 flex justify-center border bg-secondary-2">
                  <img src={QRImg} alt="QR" className="h-36 w-36" />
                </div>
                <p className="font-semibold">
                  Don’t have access to scan? Use this code instead.
                </p>
                <div className="p-4 border text-primary-2 text-center font-bold">
                  HHH7MFGAMPJ44OM44FGAMPJ44O232
                </div>
                <Button
                  className="w-full h-14"
                  onClick={() => setContinue(true)}>
                  Continue
                </Button>
              </>
            )}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
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
      className={className}>
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