import React, { useState } from "react";
import { useForm } from "@refinedev/react-hook-form";
import { useDelete, useLogout, useNavigation } from "@refinedev/core";
import {
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const stepOneSchema = z.object({
  confirmText: z.literal("DELETE", {
    errorMap: () => ({ message: "Please type DELETE to confirm" }),
  }),
});

const stepTwoSchema = z.object({
  confirmText: z.literal("I UNDERSTAND", {
    errorMap: () => ({ message: "Please type I UNDERSTAND to confirm" }),
  }),
});

type StepOneValues = z.infer<typeof stepOneSchema>;
type StepTwoValues = z.infer<typeof stepTwoSchema>;

type DeleteAccountDialogProps = {
  close: () => void;
};

export default function DeleteAccountDialog({
  close,
}: DeleteAccountDialogProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { mutate: logout } = useLogout();
  const { push } = useNavigation();
  const deleteMutator = useDelete();

  const stepOneForm = useForm<StepOneValues>({
    resolver: zodResolver(stepOneSchema),
    defaultValues: {
      confirmText: "",
    },
  });

  const stepTwoForm = useForm<StepTwoValues>({
    resolver: zodResolver(stepTwoSchema),
    defaultValues: {
      confirmText: "",
    },
  });

  const onStepOneSubmit = (data: StepOneValues) => {
    setStep(2);
  };

  const onStepTwoSubmit = (data: StepTwoValues) => {
    deleteMutator.mutate(
      {
        resource: "account",
        id: "",
        successNotification: false, // Disable default success notification
      },
      {
        onSuccess: () => {
          setStep(3);
        },
      },
    );
  };

  const handleClose = () => {
    setStep(1);
    stepOneForm.reset();
    stepTwoForm.reset();
    close();
  };

  const handleLogout = () => {
    logout();
    push("/");
  };

  const renderStepOne = () => (
    <form onSubmit={stepOneForm.handleSubmit(onStepOneSubmit)}>
      <Alert variant="destructive">
        <AlertDescription>
          Are you sure you want to delete your account? This action cannot be
          undone.
        </AlertDescription>
      </Alert>
      <p className="mt-4">Type "DELETE" to confirm:</p>
      <Input {...stepOneForm.register("confirmText")} className="mt-2" />
      {stepOneForm.formState.errors.confirmText && (
        <p className="text-sm text-red-500 mt-1">
          {stepOneForm.formState.errors.confirmText.message}
        </p>
      )}
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive">
          Proceed
        </Button>
      </DialogFooter>
    </form>
  );

  const renderStepTwo = () => (
    <form onSubmit={stepTwoForm.handleSubmit(onStepTwoSubmit)}>
      <Alert variant="destructive">
        <AlertDescription>
          This is your final chance to reconsider. Your account will be
          permanently deleted.
        </AlertDescription>
      </Alert>
      <Label htmlFor="finalConfirm" className="mt-4 block">
        Type "I UNDERSTAND" to proceed with account deletion:
      </Label>
      <Input
        id="finalConfirm"
        {...stepTwoForm.register("confirmText")}
        className="mt-2"
      />
      {stepTwoForm.formState.errors.confirmText && (
        <p className="text-sm text-red-500 mt-1">
          {stepTwoForm.formState.errors.confirmText.message}
        </p>
      )}
      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button type="submit" variant="destructive">
          Delete Account
        </Button>
      </DialogFooter>
    </form>
  );

  const renderSuccessScreen = () => (
    <>
      <Alert>
        <AlertDescription>
          Your account will be deleted within 48 hours. If this is an error,
          please contact support as soon as possible.
        </AlertDescription>
      </Alert>
      <DialogFooter className="mt-6">
        <Button onClick={handleLogout}>OK</Button>
      </DialogFooter>
    </>
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {step === 1 && "Delete Account"}
          {step === 2 && "Final Confirmation"}
          {step === 3 && "Account Deletion Scheduled"}
        </DialogTitle>
      </DialogHeader>
      {step === 1 && renderStepOne()}
      {step === 2 && renderStepTwo()}
      {step === 3 && renderSuccessScreen()}
    </>
  );
}
