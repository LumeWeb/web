import { z } from "zod";
import {
  ComponentSize,
  DialogTypes,
  FormDialogConfig,
  FormFieldConfig,
  useFormContext,
} from "@lumeweb/portal-framework-ui";

import { forwardRef, useState, useMemo, useCallback } from "react";
import { Badge, Button, cn, Input, Label, ScrollArea, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { CID } from "multiformats/cid";
const AlertCircle = lazyIcon("AlertCircle");
const CheckCircle = lazyIcon("CheckCircle");
const Pin = lazyIcon("Pin");
const X = lazyIcon("X");


const pinSchema = z.object({
  cids: z.array(z.string()).min(1, "At least one CID is required"),
});

export type PinFormData = z.infer<typeof pinSchema>;

interface CidTag {
  id: string;
  cid: string;
  isValid: boolean;
  isAlreadyPinned: boolean;
}

// CID input component
const CidInputComponent = forwardRef<
  HTMLDivElement,
  {
    existingPinnedCids?: string[];
  }
>(({ existingPinnedCids = [] }, ref) => {
  const formContext = useFormContext<PinFormData>();
  const { formInstance } = formContext;
  const [inputValue, setInputValue] = useState("");
  const [cidTags, setCidTags] = useState<CidTag[]>([]);

  // Convert existing CIDs to Set for O(1) lookup
  const existingPinnedSet = useMemo(
    () => new Set(existingPinnedCids),
    [existingPinnedCids],
  );

  // Validate CID format using multiformats CID library
  const isValidCid = useCallback((cid: string): boolean => {
    try {
      CID.parse(cid.trim());
      return true;
    } catch (error) {
      return false;
    }
  }, []);

  // Format CID for display
  const formatCidForDisplay = useCallback((cid: string): string => {
    if (cid.length <= 20) return cid;
    return `${cid.slice(0, 8)}...${cid.slice(-8)}`;
  }, []);

  // Add CID tag
  const addCidTag = useCallback(
    (cid: string) => {
      const trimmedCid = cid.trim();
      if (!trimmedCid) return;

      // Check for duplicates
      if (cidTags.some((tag) => tag.cid === trimmedCid)) return;

      const newTag: CidTag = {
        id: crypto.randomUUID(),
        cid: trimmedCid,
        isValid: isValidCid(trimmedCid),
        isAlreadyPinned: existingPinnedSet.has(trimmedCid),
      };

      setCidTags((prev) => [...prev, newTag]);

      // Update form with valid CIDs
      const validCids = cidTags
        .filter((tag) => tag.isValid && !tag.isAlreadyPinned)
        .map((tag) => tag.cid);

      if (newTag.isValid && !newTag.isAlreadyPinned) {
        formInstance.setValue("cids", [...validCids, newTag.cid]);
      }

      setInputValue("");
    },
    [cidTags, existingPinnedSet, formInstance, isValidCid],
  );

  // Remove CID tag
  const removeCidTag = useCallback(
    (tagId: string) => {
      const updatedTags = cidTags.filter((tag) => tag.id !== tagId);
      setCidTags(updatedTags);

      // Update form with remaining valid CIDs
      const validCids = updatedTags
        .filter((tag) => tag.isValid && !tag.isAlreadyPinned)
        .map((tag) => tag.cid);

      formInstance.setValue("cids", validCids);
    },
    [cidTags, formInstance],
  );

  // Handle input key press
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        addCidTag(inputValue);
      }
    },
    [inputValue, addCidTag],
  );

  // Clear all tags
  const clearAllTags = useCallback(() => {
    setCidTags([]);
    formInstance.setValue("cids", []);
  }, [formInstance]);

  // Memoize stats calculation
  const stats = useMemo(() => {
    const total = cidTags.length;
    const valid = cidTags.filter((tag) => tag.isValid).length;
    const invalid = total - valid;
    const alreadyPinned = cidTags.filter((tag) => tag.isAlreadyPinned).length;
    const newToPin = valid - alreadyPinned;

    return { total, valid, invalid, alreadyPinned, newToPin };
  }, [cidTags]);

  return (
    <div ref={ref} className="space-y-4">
      {/* Description */}
      <div className="text-muted-foreground text-justify text-sm">
        <p>
          Pin content to your account by entering Content Identifiers (CIDs).
        </p>
        <p className="mt-1">
          Pinned content remains available and accessible through your account.
        </p>
        <p className="mt-1">
          Supports both CIDv0 (Qm...) and CIDv1 (baf..., bae...) formats.
        </p>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <Label htmlFor="cid-input" className="text-foreground">
          Enter CID
        </Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              id="cid-input"
              placeholder="QmXxXx... or bafXxXx..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              className="border-border bg-background text-foreground placeholder:text-muted-foreground h-10 w-full"
            />
          </div>
          <Button
            onClick={() => addCidTag(inputValue)}
            disabled={!inputValue.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 h-10">
            Add
          </Button>
        </div>
      </div>

      {/* CID Tags */}
      {cidTags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-foreground">
              CIDs to Pin ({cidTags.length})
            </Label>
            {cidTags.length > 0 && (
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
              {cidTags.map((tag) => (
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
                      <Pin className="h-4 w-4 flex-shrink-0 text-yellow-400" />
                    ) : (
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-400" />
                    )
                  ) : (
                    <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-400" />
                  )}

                  {/* CID */}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-mono text-sm">
                      {formatCidForDisplay(tag.cid)}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {!tag.isValid && "Invalid CID format"}
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
                    onClick={() => removeCidTag(tag.id)}
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
  onPin: (cids: string[]) => Promise<void>,
  open?: (options: any) => void,
): FormDialogConfig<PinFormData> {
  return {
    type: DialogTypes.FORM,
    title: "Pin Content to Account",
    description: "Enter CIDs to pin content to your account",
    formConfig: {
      defaultValues: {
        cids: [],
      },
      fields: [
        {
          name: "cids",
          type: "custom",
          component: CidInputComponent,
          required: true,
        } as FormFieldConfig<PinFormData>,
      ],
      validationSchema: pinSchema,
      submitLabel: "Pin to Account",
    },
    onSubmit: async (data) => {
      try {
        await onPin(data.cids);
        return { success: true };
      } catch (error) {
        open?.({
          type: "error",
          message: "Failed to pin content",
          description: "An error occurred while pinning the content",
        });
        throw error;
      }
    },
    onSuccess: () => {
      open?.({
        type: "success",
        message: "Content pinning queued",
        description: "The content has been queued for pinning to your account",
      });
    },
    size: ComponentSize.TWO_XL,
  };
}
