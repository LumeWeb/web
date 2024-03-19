import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  BaseKey,
  useGetIdentity,
  useUpdate,
  useUpdatePassword,
} from "@refinedev/core";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Field } from "~/components/forms";
import { GeneralLayout } from "~/components/general-layout";
import {
  AddIcon,
  CloudCheckIcon,
  CloudIcon,
  CloudUploadIcon,
  CrownIcon,
  EditIcon,
} from "~/components/icons";
import { useUppy } from "~/components/lib/uppy";
import {
  ManagementCard,
  ManagementCardAvatar,
  ManagementCardContent,
  ManagementCardFooter,
  ManagementCardTitle,
} from "~/components/management-card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { UsageCard } from "~/components/usage-card";

import QRImg from "~/images/QR.png";

export default function MyAccount() {
  const { data: identity } = useGetIdentity<{ email: string }>();

  const [openModal, setModal] = useState({
    changeEmail: false,
    changePassword: false,
    setupTwoFactor: false,
    changeAvatar: false,
  });

  return (
    <GeneralLayout>
      <h1 className="text-lg font-bold mb-4">My Account</h1>
      <Dialog
        onOpenChange={(open) => {
          if (!open) {
            setModal({
              changeEmail: false,
              changePassword: false,
              setupTwoFactor: false,
              changeAvatar: false,
            });
          }
        }}>
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
            <ManagementCardAvatar
              button={
                <DialogTrigger className="absolute bottom-0 right-0 z-50">
                  <Button
                    onClick={() => setModal({ ...openModal, changeAvatar: true })}
                    variant="outline"
                    className=" flex items-center w-10 h-10 p-0 border-white rounded-full justiyf-center hover:bg-secondary-2">
                    <EditIcon />
                  </Button>
                </DialogTrigger>
              }
            />
          </ManagementCard>
          <ManagementCard>
            <ManagementCardTitle>Email Address</ManagementCardTitle>
            <ManagementCardContent className="text-ring font-semibold">
              {identity?.email}
            </ManagementCardContent>
            <ManagementCardFooter>
              <DialogTrigger>
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
              <DialogTrigger>
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
          <ManagementCard>
            <ManagementCardTitle>Two-Factor Authentication</ManagementCardTitle>
            <ManagementCardContent>
              Improve security by enabling 2FA.
            </ManagementCardContent>
            <ManagementCardFooter>
              <DialogTrigger>
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
          </ManagementCard>
        </div>
        <h2 className="font-bold my-8">More</h2>
        <div className="grid grid-cols-3 gap-x-8">
          <ManagementCard variant="accent">
            <ManagementCardTitle>Invite a Friend</ManagementCardTitle>
            <ManagementCardContent>
              Get 1 GB per friend invited for free (max 5 GB).
            </ManagementCardContent>
            <ManagementCardFooter>
              <Button variant="accent" className="h-12 gap-x-2">
                <AddIcon />
                Send Invitation
              </Button>
            </ManagementCardFooter>
          </ManagementCard>
          <ManagementCard>
            <ManagementCardTitle>Read our Resources</ManagementCardTitle>
            <ManagementCardContent>
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
            <ManagementCardContent>
              Once initiated, this action cannot be undone.
            </ManagementCardContent>
            <ManagementCardFooter>
              <Button className="h-12 gap-x-2" variant="destructive">
                <AddIcon />
                Delete my Account
              </Button>
            </ManagementCardFooter>
          </ManagementCard>
        </div>
        <DialogContent>
          {openModal.changeAvatar && <ChangeAvatarForm />}
          {openModal.changeEmail && (
            <ChangeEmailForm currentValue={identity?.email || ""} />
          )}
          {openModal.changePassword && <ChangePasswordForm />}
          {openModal.setupTwoFactor && <SetupTwoFactorDialog />}
        </DialogContent>
      </Dialog>
    </GeneralLayout>
  );
}

const ChangeEmailSchema = z
  .object({
    email: z.string().email(),
    password: z.string(),
    retypePassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.retypePassword) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["retypePassword"],
        message: "Passwords do not match",
      });
    }
    return true;
  });

const ChangeEmailForm = ({ currentValue }: { currentValue: string }) => {
  const { data: identity } = useGetIdentity<{ id: BaseKey }>();
  const { mutate: updateEmail } = useUpdate();
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(ChangeEmailSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ChangeEmailSchema });
    },
    shouldValidate: "onSubmit",
    onSubmit(e) {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      console.log(identity);
      updateEmail({
        resource: "users",
        id: identity?.id || "",
        values: {
          email: data.email.toString(),
        },
      });
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle className="mb-8">Change Email</DialogTitle>
      </DialogHeader>
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
    </>
  );
};

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().email(),
    newPassword: z.string(),
    retypePassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword !== data.retypePassword) {
      return ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["retypePassword"],
        message: "Passwords do not match",
      });
    }
    return true;
  });

const ChangePasswordForm = () => {
  const { mutate: updatePassword } = useUpdatePassword<{ password: string }>();
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(ChangeEmailSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: ChangePasswordSchema });
    },
    shouldValidate: "onSubmit",
    onSubmit(e) {
      e.preventDefault();

      const data = Object.fromEntries(new FormData(e.currentTarget).entries());

      updatePassword({
        password: data.newPassword.toString(),
      });
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle className="mb-8">Change Password</DialogTitle>
      </DialogHeader>
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
          labelProps={{ children: "New Password" }}
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
    </>
  );
};

const SetupTwoFactorDialog = () => {
  const [continueModal, setContinue] = useState<boolean>(false);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="mb-8">Setup Two-Factor</DialogTitle>
      </DialogHeader>
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
            <Button className="w-full h-14" onClick={() => setContinue(true)}>
              Continue
            </Button>
          </>
        )}
      </div>
    </>
  );
};

const ChangeAvatarForm = () => {
  const {
    getRootProps,
    getInputProps,
    getFiles,
    upload,
    state,
    removeFile,
    cancelAll,
  } = useUppy({
    uploader: "tus",
    endpoint: import.meta.env.VITE_PUBLIC_TUS_ENDPOINT,
  });

  console.log({ state, files: getFiles() });

  const isUploading = state === "uploading";
  const isCompleted = state === "completed";
  const hasStarted = state !== "idle" && state !== "initializing";

  const file = getFiles()?.[0];

  const imagePreview = useMemo(() => {
    if (file) {
      return URL.createObjectURL(file.data);
    }
  }, [file]);

  return (
    <>
      <DialogHeader className="mb-6">
        <DialogTitle>Edit Avatar</DialogTitle>
      </DialogHeader>
      {!hasStarted && !getFiles().length ? (
        <div
          {...getRootProps()}
          className="border border-border rounded text-primary-2 bg-primary-dark h-48 flex flex-col items-center justify-center">
          <input
            hidden
            aria-hidden
            name="uppyFiles[]"
            key={new Date().toISOString()}
            multiple
            {...getInputProps()}
          />
          <CloudUploadIcon className="w-24 h-24 stroke stroke-primary-dark" />
          <p>Drag & Drop Files or Browse</p>
        </div>
      ) : null}

      {!hasStarted && file && (
        <div className="border border-border rounded p-4 bg-primary-dark relative">
          <Button
            className="absolute top-1/2 right-1/2 rounded-full bg-gray-800/50 hover:bg-primary p-2 text-sm"
            onClick={() => removeFile(file?.id)}>
            <Cross2Icon className="size-4" />
          </Button>
          <img
            className="w-full h-48 object-contain"
            src={imagePreview}
            alt="New Avatar Preview"
          />
        </div>
      )}

      {hasStarted ? (
        <div className="flex flex-col items-center gap-y-2 w-full text-primary-1">
          <CloudCheckIcon className="w-32 h-32" />
          {isCompleted ? "Upload completed" : `0% completed`}
        </div>
      ) : null}

      {isUploading ? (
        <DialogClose asChild onClick={cancelAll}>
          <Button size={"lg"} className="mt-6">
            Cancel
          </Button>
        </DialogClose>
      ) : null}

      {isCompleted ? (
        <DialogClose asChild>
          <Button size={"lg"} className="mt-6">
            Close
          </Button>
        </DialogClose>
      ) : null}

      {!hasStarted && !isCompleted && !isUploading ? (
        <Button size={"lg"} className="mt-6" onClick={upload}>
          Upload
        </Button>
      ) : null}
    </>
  );
};

const PasswordDots = ({ className }: { className?: string }) => {
  return (
    <svg
      aria-hidden="true"
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
