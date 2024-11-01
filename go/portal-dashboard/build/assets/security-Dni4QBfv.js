import { r as reactExports, j as jsxRuntimeExports } from "./jsx-runtime-IZdvEyt_.js";
import { A as AccountUsage, M as ManagementGrid, a as ManagementCard, b as ManagementCardTitle, c as ManagementCardContent, d as ManagementCardFooter, S as SetupTwoFactorDialog, D as DisableTwoFactorDialog } from "./AccountUsage-C1cu2_gv.js";
import { D as Dialog, f as DialogTrigger, a as DialogContent } from "./dialog-bMhe1ZLy.js";
import { B as Button } from "./button-CxRLgqWQ.js";
import { A as AddIcon, R as RemoveIcon } from "./icons-DXepPAEW.js";
import { o as oo } from "./index-C-G3KncW.js";
import "./avatar-wPQuP-0B.js";
import "./useFeatureFlag-D-GCpHdz.js";
import "./usePortalMeta-B1ITfk6e.js";
import "./usePortalUrl-CIV3_GNQ.js";
import "./index-BpxO7BrF.js";
import "./index-bnQotRZh.js";
import "./index-DzjV6XGT.js";
import "./react-icons.esm-BJVio-o0.js";
import "./index-D2ZIrmHy.js";
import "./form-CB2qhI_6.js";
import "./label-GoC-rw9-.js";
import "./input-B5SdZGo1.js";
import "./useSubscription-C-dlgiPr.js";
import "./alert-3RvGnShr.js";
import "./circle-alert-DqjWzdjR.js";
import "./Combination-px7rCmli.js";
import "./useCurrentUsage-Cyons4Fq.js";
import "./progress-CxS0Yg7S.js";
import "./components-XyVy0HiW.js";
import "./index-CVd92JJe.js";
import "./index-v7sdPLyF.js";
import "./index-BNJrySUY.js";
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
