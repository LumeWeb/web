import { z } from "zod";
import {
  ComponentSize,
  DialogTypes,
  FormDialogConfig,
  FormFieldConfig,
  useFormContext,
} from "@lumeweb/portal-framework-ui";

import { forwardRef, useCallback, useMemo, useState } from "react";
import { Badge, Button, cn, Input, Label, ScrollArea, lazyIcon } from "@lumeweb/portal-framework-ui-core";
const AlertCircle = lazyIcon("AlertCircle");
const CheckCircle = lazyIcon("CheckCircle");
const Hash = lazyIcon("Hash");
const X = lazyIcon("X");


// Schema for pin dialog
const pinSchema = z.object({
  sd_hashes: z.array(z.string()).min(1, "At least one SD hash is required"),
});

export type PinFormData = z.infer<typeof pinSchema>;

interface SdHashTag {
  id: string;
  sd_hash: string;
  isValid: boolean;
  isAlreadyPinned: boolean;
}

// Pre-compile regex for SD hash validation - LBRY SD hashes are 96 hex characters
const SD_HASH_REGEX = /^[0-9a-fA-F]{96}$/;

const isValidSdHash = (hash: string): boolean => {
  return SD_HASH_REGEX.test(hash.trim());
};

// Format SD hash for display
const formatHashForDisplay = (hash: string): string => {
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
};

// SD hash input component
const SdHashInputComponent = forwardRef<
  HTMLDivElement,
  {
    existingPinnedHashes?: string[];
  }
>(({ existingPinnedHashes = [] }, ref) => {
  const formContext = useFormContext<PinFormData>();
  const { formInstance } = formContext;
  const [inputValue, setInputValue] = useState("");
  const [hashTags, setHashTags] = useState<SdHashTag[]>([]);

  // Convert existing hashes to Set for O(1) lookup
  const existingPinnedSet = useMemo(
    () => new Set(existingPinnedHashes),
    [existingPinnedHashes],
  );

  // Add SD hash tag
  const addHashTag = useCallback(
    (hash: string) => {
      const trimmedHash = hash.trim();
      if (!trimmedHash) return;

      // Check for duplicates
      if (hashTags.some((tag) => tag.sd_hash === trimmedHash)) return;

      const newTag: SdHashTag = {
        id: crypto.randomUUID(),
        sd_hash: trimmedHash,
        isValid: isValidSdHash(trimmedHash),
        isAlreadyPinned: existingPinnedSet.has(trimmedHash),
      };

      setHashTags((prev) => [...prev, newTag]);

      // Update form with valid hashes
      const validHashes = hashTags
        .filter((tag) => tag.isValid && !tag.isAlreadyPinned)
        .map((tag) => tag.sd_hash);

      if (newTag.isValid && !newTag.isAlreadyPinned) {
        formInstance.setValue("sd_hashes", [...validHashes, newTag.sd_hash]);
      }

      setInputValue("");
    },
    [hashTags, existingPinnedSet, formInstance],
  );

  // Remove SD hash tag
  const removeHashTag = useCallback(
    (tagId: string) => {
      const updatedTags = hashTags.filter((tag) => tag.id !== tagId);
      setHashTags(updatedTags);

      // Update form with remaining valid hashes
      const validHashes = updatedTags
        .filter((tag) => tag.isValid && !tag.isAlreadyPinned)
        .map((tag) => tag.sd_hash);

      formInstance.setValue("sd_hashes", validHashes);
    },
    [hashTags, formInstance],
  );

  // Handle input key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addHashTag(inputValue);
      }
    },
    [inputValue, addHashTag],
  );

  // Clear all tags
  const clearAllTags = useCallback(() => {
    setHashTags([]);
    formInstance.setValue("sd_hashes", []);
  }, [formInstance]);

  // Memoize stats calculation
  const stats = useMemo(() => {
    const total = hashTags.length;
    const valid = hashTags.filter((tag) => tag.isValid).length;
    const invalid = total - valid;
    const alreadyPinned = hashTags.filter((tag) => tag.isAlreadyPinned).length;
    const newToPin = valid - alreadyPinned;

    return { total, valid, invalid, alreadyPinned, newToPin };
  }, [hashTags]);

  return (
    <div ref={ref} className="space-y-4">
      {/* Description */}
      <div className="text-muted-foreground text-justify text-sm">
        <p>
          Pin streams to your account by entering Stream Descriptor (SD) hashes.
        </p>
        <p className="mt-1">
          Pinned streams remain available and accessible through your account on
          the LBRY network.
        </p>
        <p className="mt-1">
          SD hashes must be exactly 96 hexadecimal characters.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Label htmlFor="sd-hash-input" className="text-foreground">
          Enter SD Hash
        </Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="sd-hash-input"
              placeholder="96-character hex hash (e.g., 1234567890abcdef...)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground h-10 w-full"
            />
          </div>
          <Button
            onClick={() => addHashTag(inputValue)}
            disabled={!inputValue.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10">
            Add
          </Button>
        </div>
      </div>

      {/* Hash Tags */}
      {hashTags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground">
              SD Hashes to Pin ({hashTags.length})
            </Label>
            {hashTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllTags}
                className="text-muted-foreground hover:text-foreground">
                Clear All
              </Button>
            )}
          </div>

          <ScrollArea className="max-h-48">
            <div className="space-y-2">
              {hashTags.map((tag) => (
                <div
                  key={tag.id}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2",
                    tag.isValid
                      ? tag.isAlreadyPinned
                        ? "border-yellow-400/20 bg-yellow-400/5"
                        : "border-green-400/20 bg-green-400/5"
                      : "border-red-400/20 bg-red-400/5",
                  )}>
                  {/* Status Icon */}
                  {tag.isValid ? (
                    tag.isAlreadyPinned ? (
                      <Hash className="h-4 w-4 flex-shrink-0 text-yellow-400" />
                    ) : (
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-400" />
                    )
                  ) : (
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                  )}

                  {/* SD Hash */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-sm">
                      {formatHashForDisplay(tag.sd_hash)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {!tag.isValid &&
                        "Invalid SD hash format (must be 96 hex chars)"}
                      {tag.isValid && tag.isAlreadyPinned && "Already pinned"}
                      {tag.isValid && !tag.isAlreadyPinned && "Ready to pin"}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      tag.isValid
                        ? tag.isAlreadyPinned
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive",
                    )}>
                    {!tag.isValid && "Invalid"}
                    {tag.isValid && tag.isAlreadyPinned && "Pinned"}
                    {tag.isValid && !tag.isAlreadyPinned && "New"}
                  </Badge>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHashTag(tag.id)}
                    className="text-muted-foreground hover:text-destructive h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Summary */}
          {stats.total > 0 && (
            <div className="border-border bg-background rounded-lg border p-3">
              <div className="text-muted-foreground mb-2 text-sm">Summary:</div>
              <div className="flex flex-wrap gap-3 text-xs">
                {stats.newToPin > 0 && (
                  <span className="text-success">
                    {stats.newToPin} new to pin
                  </span>
                )}
                {stats.alreadyPinned > 0 && (
                  <span className="text-warning">
                    {stats.alreadyPinned} already pinned
                  </span>
                )}
                {stats.invalid > 0 && (
                  <span className="text-destructive">
                    {stats.invalid} invalid
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export function createPinDialogConfig(
  onPin: (sdHashes: string[]) => Promise<void>,
  open?: (options: any) => void,
): FormDialogConfig<PinFormData> {
  return {
    type: DialogTypes.FORM,
    title: "Pin Streams to Account",
    description: "Enter SD hashes to pin streams to your account",
    formConfig: {
      defaultValues: {
        sd_hashes: [],
      },
      fields: [
        {
          name: "sd_hashes",
          type: "custom",
          component: SdHashInputComponent,
          required: true,
        } as FormFieldConfig<PinFormData>,
      ],
      validationSchema: pinSchema,
      submitLabel: "Pin to Account",
    },
    onSubmit: async (data) => {
      try {
        await onPin(data.sd_hashes);
        return { success: true };
      } catch (error) {
        open?.({
          type: "error",
          message: "Failed to pin streams",
          description: "An error occurred while pinning the streams",
        });
        throw error;
      }
    },
    onSuccess: () => {
      open?.({
        type: "success",
        message: "Stream pinning queued",
        description: "The streams have been queued for pinning to your account",
      });
    },
    size: ComponentSize.TWO_XL,
  };
}
