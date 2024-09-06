import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog.js";
import { Input } from "@/components/ui/input";
import QRImg from "@/images/QR.png";

export default function SetupTwoFactorDialog({ close }: { close: () => void }) {
  const [continueModal, setContinue] = useState<boolean>(false);

  return (
    <>
      <DialogHeader>
        <DialogTitle className="mb-8">Setup Two-Factor</DialogTitle>
      </DialogHeader>
      <div className="flex flex-col gap-y-6">
        {continueModal ? (
          <>
            <p className="text-sm">
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
              Don't have access to scan? Use this code instead.
            </p>
            <div className="p-4 border text-center font-bold">
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
}
