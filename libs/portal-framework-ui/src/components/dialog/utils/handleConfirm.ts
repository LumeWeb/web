import { DialogConfig } from "../Dialog.types";

export async function handleConfirm(
  dialog: DialogConfig | undefined,
  closeDialog: (source?: "programmatic" | "user") => void
): Promise<void> {
  if (!dialog) return;

  try {
    const isConfirmLike = dialog.type === "confirm" || dialog.type === "alert";
    if (isConfirmLike && dialog.onConfirm) {
      await dialog.onConfirm();
      // success: close regardless of dismissable (programmatic close)
      closeDialog();
      return;
    }
  } catch (error) {
    if (!dialog.dismissable) {
      throw error;
    }
    // Optionally log error here if needed
  } finally {
    // On error or no-op: only close if dismissable and confirm/alert
    if (
      (dialog.type === "confirm" || dialog.type === "alert") &&
      dialog.dismissable
    ) {
      closeDialog();
    }
  }
}
