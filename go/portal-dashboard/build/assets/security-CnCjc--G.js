import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-CzXAEjbZ.js";
import { A as AccountUsage, M as ManagementGrid, a as ManagementCard, b as ManagementCardTitle, c as ManagementCardContent, d as ManagementCardFooter, S as SetupTwoFactorDialog, D as DisableTwoFactorDialog } from "./AccountUsage-hmiY0N4w.js";
import { D as Dialog, f as DialogTrigger, a as DialogContent } from "./dialog-e2EjNOoC.js";
import { B as Button } from "./button-jedbwRXf.js";
import { A as AddIcon, R as RemoveIcon } from "./icons-3kvdaKde.js";
import { o as oo } from "./index-xFQL_PNe.js";
import "./avatar-BR3FNp1h.js";
import "./useFeatureFlag-BpxbgP9R.js";
import "./usePortalMeta-iFy40cTW.js";
import "./usePortalUrl-CWejBXEP.js";
import "./index-BpxO7BrF.js";
import "./index-DpbAjMft.js";
import "./react-icons.esm-o-P2jf_4.js";
import "./index-COfyDwxK.js";
import "./index-CGnbJqoH.js";
import "./form-B0KDmX57.js";
import "./label-DTm3nVMD.js";
import "./input-Sza_mO8a.js";
import "./useSubscription-BUn1Y-e1.js";
import "./alert-CN5Jif_P.js";
import "./circle-alert-CYe2rk_H.js";
import "./createLucideIcon-DFCINFSp.js";
import "./useCurrentUsage-B7CB8JtU.js";
import "./progress-DqLuAjsp.js";
import "./components-D8mYRm61.js";
import "./index-QWRrEtKK.js";
import "./index-5ukv8M2q.js";
import "./index-DVyQH_Qd.js";
import "./component-Da1x9Q9K.js";
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
