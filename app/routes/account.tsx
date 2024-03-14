import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { useState } from "react";
import { z } from "zod";
import { Field } from "~/components/forms";
import { GeneralLayout } from "~/components/general-layout";
import { AddIcon, CloudIcon } from "~/components/icons";
import { ManagementCard } from "~/components/management-card";
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
        <ManagementCard isAvatarCard />
        <ManagementCard
          title="Email Address"
          value="bsimpson@springfield.oh.gov.com"
          buttonText="Change Email Address"
          buttonOnClick={() => setModal({ ...openModal, changeEmail: true })}
        />
        <ManagementCard
          title="Account Type"
          value="Lite Premium Account"
          buttonText="Upgrade to Premium"
        />
      </div>
      <h2 className="font-bold my-8">Security</h2>
      <div className="grid grid-cols-3 gap-x-8">
        <ManagementCard
          isPasswordCard
          title="Password"
          buttonText="Change Password"
          buttonOnClick={() => setModal({ ...openModal, changePassword: true })}
        />
        <ManagementCard
          title="Two-Factor Authentication"
          subtitle="Improve security by enabling 2FA."
          buttonText="Enable Two-Factor Authorization"
          buttonOnClick={() => setModal({ ...openModal, setupTwoFactor: true })}
        />
        <ManagementCard
          title="Backup Key"
          subtitle="Never share this code with anyone."
          buttonText="Export Backup Key"
        />
      </div>
      <h2 className="font-bold my-8">More</h2>
      <div className="grid grid-cols-3 gap-x-8">
        <ManagementCard
          isInviteCard
          title="Invite a Friend"
          subtitle="Get 1 GB per friend invited for free (max 5 GB)."
          buttonText="Send Invitation"
        />
        <ManagementCard
          title="Read our Resources"
          subtitle="Navigate helpful articles or get assistance."
          buttonText="Open Support Centre"
        />
        <ManagementCard
          isDeleteCard
          title="Delete Account"
          subtitle="Once initiated, this action cannot be undone."
          buttonText="Delete my Account"
        />
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
