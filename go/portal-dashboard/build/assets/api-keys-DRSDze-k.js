import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-CzXAEjbZ.js";
import { D as DataTable } from "./DataTable-DHoCv7gR.js";
import { B as Button } from "./button-jedbwRXf.js";
import { I as Input } from "./input-Sza_mO8a.js";
import { D as Dialog, a as DialogContent, b as DialogHeader, c as DialogTitle, d as DialogDescription, e as DialogFooter } from "./dialog-e2EjNOoC.js";
import { F as Form, a as FormField, b as FormItem, e as FormLabel, c as FormControl } from "./form-B0KDmX57.js";
import { C } from "./index-CGnbJqoH.js";
import { t } from "./zod-BlhIUxtz.js";
import { o as objectType, s as stringType } from "./index-BpxO7BrF.js";
import { c as createColumnHelper } from "./index-BOOu2P05.js";
import { A as Alert, a as AlertTitle, b as AlertDescription } from "./alert-CN5Jif_P.js";
import { c as $e, x as xo } from "./index-xFQL_PNe.js";
import { c as createLucideIcon } from "./createLucideIcon-DFCINFSp.js";
import { C as Copy } from "./copy-BTdE7U-g.js";
import { C as CircleAlert } from "./circle-alert-CYe2rk_H.js";
import "./react-icons.esm-o-P2jf_4.js";
import "./index-COfyDwxK.js";
import "./select-BEMrC4Fv.js";
import "./index-DpbAjMft.js";
import "./index-CxTzuwWC.js";
import "./component-Da1x9Q9K.js";
import "./index-CJ8FhmRo.js";
import "./index-DSJ5IsRY.js";
import "./index-COopH7IU.js";
import "./skeleton-DaJxHvFz.js";
import "./index-DVyQH_Qd.js";
import "./label-DTm3nVMD.js";
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Plus = createLucideIcon("Plus", [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
]);
/**
 * @license lucide-react v0.396.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const Trash2 = createLucideIcon("Trash2", [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
]);
const columnHelper = createColumnHelper();
const apiKeyColumns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => info.getValue()
  }),
  columnHelper.accessor("created_at", {
    header: "Created",
    cell: (info) => {
      const date = new Date(info.getValue());
      return date.toLocaleDateString();
    }
  })
];
const formSchema = objectType({
  name: stringType().min(1, "API Key name is required")
});
const defaultValues = {
  name: ""
};
function APIKeys() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = reactExports.useState(false);
  const [newApiKey, setNewApiKey] = reactExports.useState(null);
  const [keyToRevoke, setKeyToRevoke] = reactExports.useState(null);
  const apiKeyCopyRef = reactExports.useRef(null);
  const form = C({
    resolver: t(formSchema),
    refineCoreProps: {
      resource: "account/keys",
      action: "create",
      createMutationOptions: {
        onSuccess(data) {
          setIsCreateDialogOpen(false);
          form.reset(defaultValues);
          setNewApiKey(data.data.key);
        }
      }
    },
    defaultValues
  });
  $e();
  const deleteMutator = xo({});
  const handleCopyKey = reactExports.useCallback((key) => {
    var _a;
    (_a = apiKeyCopyRef.current) == null ? void 0 : _a.select();
    navigator.clipboard.writeText(key);
  }, []);
  const handleRevokeKey = reactExports.useCallback((key) => {
    setKeyToRevoke(key);
  }, []);
  const confirmRevoke = reactExports.useCallback(() => {
    if (keyToRevoke) {
      deleteMutator.mutate({
        resource: "account/keys",
        id: keyToRevoke.uuid,
        successNotification: {
          message: "API Key revoked successfully",
          type: "success"
        }
      }, {
        onSuccess(data) {
          setKeyToRevoke(null);
        }
      });
    }
  }, [keyToRevoke]);
  const columnHelper2 = createColumnHelper();
  const actionsColumn = columnHelper2.display({
    id: "actions",
    header: "Actions",
    cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "flex gap-2",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
        variant: "destructive",
        size: "sm",
        onClick: () => handleRevokeKey(info.row.original),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, {
          className: "h-4 w-4"
        })
      })
    })
  });
  const columns = [...apiKeyColumns, actionsColumn];
  const tableProps = {
    columns,
    resource: "account/keys"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
    className: "p-5",
    children: [/* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "flex justify-between items-center mb-4",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
        className: "text-2xl font-bold",
        children: "API Keys"
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
        onClick: () => setIsCreateDialogOpen(true),
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Plus, {
          className: "mr-2 h-4 w-4"
        }), " Create New API Key"]
      })]
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(DataTable, {
      ...tableProps
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, {
      open: isCreateDialogOpen,
      onOpenChange: setIsCreateDialogOpen,
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, {
        children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, {
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, {
            children: "Create New API Key"
          }), /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, {
            children: "Enter a name for your new API key."
          })]
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Form, {
          ...form,
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("form", {
            onSubmit: form.handleSubmit(() => {
            }),
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(FormField, {
              control: form.control,
              name: "name",
              render: ({
                field
              }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(FormItem, {
                children: [/* @__PURE__ */ jsxRuntimeExports.jsx(FormLabel, {
                  children: "API Key Name"
                }), /* @__PURE__ */ jsxRuntimeExports.jsx(FormControl, {
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
                    placeholder: "Enter API Key Name",
                    ...field
                  })
                })]
              })
            })
          })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(DialogFooter, {
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
            type: "submit",
            ...form.saveButtonProps,
            children: "Create API Key"
          })
        })]
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, {
      open: !!newApiKey,
      onOpenChange: () => setNewApiKey(null),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, {
        onPointerDownOutside: (e) => e.preventDefault(),
        children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, {
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, {
            children: "New API Key Created"
          }), /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, {
            children: "Please copy your new API key. For security reasons, it won't be displayed again."
          })]
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "mt-4",
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
            value: newApiKey || "",
            readOnly: true,
            ref: apiKeyCopyRef
          }), /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
            className: "mt-2 w-full",
            onClick: () => newApiKey && handleCopyKey(newApiKey),
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Copy, {
              className: "mr-2 h-4 w-4"
            }), " Copy API Key"]
          })]
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs(Alert, {
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, {
            className: "h-4 w-4"
          }), /* @__PURE__ */ jsxRuntimeExports.jsx(AlertTitle, {
            children: "Warning"
          }), /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDescription, {
            children: "Make sure to copy this key now. You won't be able to see it again!"
          })]
        })]
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, {
      open: !!keyToRevoke,
      onOpenChange: () => setKeyToRevoke(null),
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, {
        children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(DialogHeader, {
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, {
            children: "Confirm API Key Revocation"
          }), /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogDescription, {
            children: ['Are you sure you want to revoke the API key "', keyToRevoke == null ? void 0 : keyToRevoke.name, '"? This action cannot be undone.']
          })]
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogFooter, {
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
            variant: "outline",
            onClick: () => setKeyToRevoke(null),
            children: "Cancel"
          }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
            variant: "destructive",
            onClick: confirmRevoke,
            children: "Revoke Key"
          })]
        })]
      })
    })]
  });
}
export {
  APIKeys as default
};
