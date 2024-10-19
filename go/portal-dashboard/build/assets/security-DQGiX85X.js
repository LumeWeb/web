import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-IZdvEyt_.js";
import { A as AccountUsage, M as ManagementGrid, a as ManagementCard, b as ManagementCardTitle, c as ManagementCardContent, d as ManagementCardFooter, S as SetupTwoFactorDialog, D as DisableTwoFactorDialog } from "./AccountUsage-B-VjgqE9.js";
import { D as Dialog, f as DialogTrigger, a as DialogContent } from "./dialog-D6SmLySg.js";
import { B as Button } from "./button-CzfLTIHt.js";
import { A as AddIcon, R as RemoveIcon } from "./icons-DfV8n6Ey.js";
import { o as oo } from "./index-DU1IfKY5.js";
import "./avatar-BEvRnn4D.js";
import "./index-C-2rzX6a.js";
import "./index-BquAYmyk.js";
import "./index-DiXcXsr5.js";
import "./useFeatureFlag-PPzt5-ch.js";
import "./usePortalMeta-BrKLDHxF.js";
import "./usePortalUrl-Bjyn0q0k.js";
import "./index-BpxO7BrF.js";
import "./index-BWzHRlC6.js";
import "./form-D1HtfKzz.js";
import "./label-DPLqB6Bj.js";
import "./input-B6UnxZyR.js";
import "./useSubscription-BJBkiziB.js";
import "./alert-BS46AoM-.js";
import "./circle-alert-Bf8XKLoY.js";
import "./Combination-BC6FEbU4.js";
import "./useCurrentUsage-CtAD3g0m.js";
import "./filesize-DaDW_CYa.js";
import "./components-DMYkXxdw.js";
import "./index-CfDxhBvB.js";
import "./index-O1NGHMyc.js";
import "./index-DUTfRgmH.js";
function Security() {
  const {
    data: identity
  } = oo();
  const [openModal, setModal] = reactExports.useState({
    setupTwoFactor: false,
    disableTwoFactor: false
  });
  const closeModal = () => {
    setModal({
      setupTwoFactor: false,
      disableTwoFactor: false
    });
  };
  const isModalOpen = Object.values(openModal).some((isOpen) => isOpen);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, {
    onOpenChange: (open) => {
      if (!open) {
        closeModal();
      }
    },
    open: isModalOpen,
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "mt-10",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(AccountUsage, {})
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "mt-10",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementGrid, {
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
            children: "Two-Factor Authentication"
          }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
            className: "text-foreground",
            children: "Improve security by enabling 2FA."
          }), !(identity == null ? void 0 : identity.otp) && /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, {
              asChild: true,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                className: "h-12 gap-x-2",
                onClick: () => setModal({
                  ...openModal,
                  setupTwoFactor: true
                }),
                children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Enable Two-Factor Authorization"]
              })
            })
          }), (identity == null ? void 0 : identity.otp) && /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, {
              asChild: true,
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                className: "h-12 gap-x-2",
                onClick: () => setModal({
                  ...openModal,
                  disableTwoFactor: true
                }),
                children: [/* @__PURE__ */ jsxRuntimeExports.jsx(RemoveIcon, {}), "Disable Two-Factor Authorization"]
              })
            })
          })]
        })
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, {
        children: [openModal.setupTwoFactor && /* @__PURE__ */ jsxRuntimeExports.jsx(SetupTwoFactorDialog, {
          close: closeModal
        }), openModal.disableTwoFactor && /* @__PURE__ */ jsxRuntimeExports.jsx(DisableTwoFactorDialog, {
          close: closeModal
        })]
      })]
    })]
  });
}
export {
  Security as default
};
