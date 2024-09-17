import { useCallback, useRef, useState } from "react";
import { DataTable, DataTableProps } from "@/components/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { AlertCircle, Copy, Plus, Trash2 } from "lucide-react";
import { APIKey, apiKeyColumns } from "./api-keys.columns.js";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FieldValues } from "react-hook-form";
import { DeleteOneResponse, useDelete, useNotification } from "@refinedev/core";
import { createColumnHelper } from "@tanstack/react-table";

const formSchema = z.object({
  name: z.string().min(1, "API Key name is required"),
});

const defaultValues: FieldValues = {
  name: "",
};

export default function APIKeys() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [keyToRevoke, setKeyToRevoke] = useState<APIKey | null>(null);
  const apiKeyCopyRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema> & { key: string }>({
    resolver: zodResolver(formSchema),
    refineCoreProps: {
      resource: "account/keys",
      action: "create",
      createMutationOptions: {
        onSuccess(data) {
          setIsCreateDialogOpen(false);
          form.reset(defaultValues);
          setNewApiKey(data.data.key);
        },
      },
    },
    defaultValues,
  });

  const notify = useNotification();

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
          resource: "account/keys",
          id: keyToRevoke.uuid,
          successNotification: {
            message: "API Key revoked successfully",
            type: "success",
          },
        },
        {
          onSuccess(data: DeleteOneResponse) {
            setKeyToRevoke(null);
          },
        },
      );
    }
  }, [keyToRevoke]);

  const columnHelper = createColumnHelper<APIKey>();
  const actionsColumn = columnHelper.display({
    id: "actions",
    header: "Actions",
    cell: (info) => (
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={() => handleRevokeKey(info.row.original)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
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

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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

      <Dialog open={!!newApiKey} onOpenChange={() => setNewApiKey(null)}>
        <DialogContent onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>New API Key Created</DialogTitle>
            <DialogDescription>
              Please copy your new API key. For security reasons, it won't be
              displayed again.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Input value={newApiKey || ""} readOnly ref={apiKeyCopyRef} />
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
              Make sure to copy this key now. You won't be able to see it again!
            </AlertDescription>
          </Alert>
        </DialogContent>
      </Dialog>

      <Dialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm API Key Revocation</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke the API key "{keyToRevoke?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKeyToRevoke(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRevoke}>
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
