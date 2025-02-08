import { zodResolver } from "@hookform/resolvers/zod";
import { createBridgeComponent } from "@lumeweb/portal-framework-core";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  DataTable,
  DataTableProps,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  withTheme,
} from "@lumeweb/portal-framework-ui";
import { DeleteOneResponse, useDelete } from "@refinedev/core";
import { useForm } from "@refinedev/react-hook-form";
import { createColumnHelper } from "@tanstack/react-table";
import { AlertCircle, Copy, Plus, Trash2 } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import { APIKey, apiKeyColumns } from "src/ui/components/account/ApiKeyColumns";
import * as z from "zod";
import "@lumeweb/portal-framework-ui-core/tailwind.css";

const formSchema = z.object({
  name: z.string().min(1, "API Key name is required"),
});

const defaultValues: FieldValues = {
  name: "",
};

function APIKeys() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<null | string>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<APIKey | null>(null);
  const apiKeyCopyRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema> & { key: string }>({
    defaultValues,
    refineCoreProps: {
      action: "create",
      createMutationOptions: {
        onSuccess(data) {
          setIsCreateDialogOpen(false);
          form.reset(defaultValues);
          setNewApiKey(data.data.key);
        },
      },
      resource: "account/keys",
    },
    resolver: zodResolver(formSchema),
  });

  const deleteMutator = useDelete<any>({});

  const handleCopyKey = useCallback((key: string) => {
    apiKeyCopyRef.current?.select();
    navigator.clipboard.writeText(key);
    // You might want to show a toast notification here
  }, []);

  const handleRevokeKey = useCallback((key: APIKey) => {
    setKeyToRevoke(key);
  }, []);

  const confirmRevoke = useCallback(() => {
    if (keyToRevoke) {
      deleteMutator.mutate(
        {
          id: keyToRevoke.uuid,
          resource: "account/keys",
          successNotification: {
            message: "API Key revoked successfully",
            type: "success",
          },
        },
        {
          onSuccess(_data: DeleteOneResponse) {
            setKeyToRevoke(null);
          },
        },
      );
    }
  }, [keyToRevoke]);

  const columnHelper = createColumnHelper<APIKey>();
  const actionsColumn = columnHelper.display({
    cell: (info) => (
      <div className="flex gap-2">
        <Button
          onClick={() => handleRevokeKey(info.row.original)}
          size="sm"
          variant="destructive">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
    header: "Actions",
    id: "actions",
  });

  const columns = [...apiKeyColumns, actionsColumn];

  const tableProps: DataTableProps<APIKey> = {
    columns,
    resource: "account/keys",
  };

  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">API Keys</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create New API Key
        </Button>
      </div>

      <DataTable {...tableProps} />

      <Dialog onOpenChange={setIsCreateDialogOpen} open={isCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Enter a name for your new API key.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(() => {})}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter API Key Name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button type="submit" {...form.saveButtonProps}>
              Create API Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={() => setNewApiKey(null)} open={!!newApiKey}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>New API Key Created</DialogTitle>
            <DialogDescription>
              Please copy your new API key. For security reasons, it won&apost
              be displayed again.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Input readOnly ref={apiKeyCopyRef} value={newApiKey || ""} />
            <Button
              className="mt-2 w-full"
              onClick={() => newApiKey && handleCopyKey(newApiKey)}>
              <Copy className="mr-2 h-4 w-4" /> Copy API Key
            </Button>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Make sure to copy this key now. You won&apost be able to see it
              again!
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={() => setKeyToRevoke(null)} open={!!keyToRevoke}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm API Key Revocation</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the API key &quot
              {keyToRevoke?.name}&quot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setKeyToRevoke(null)} variant="outline">
              Cancel
            </Button>
            <Button onClick={confirmRevoke} variant="destructive">
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default createBridgeComponent(withTheme(APIKeys));
