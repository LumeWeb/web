import { j as jsxRuntimeExports, r as reactExports } from "./index-D_nKaDFf.js";
import { N as EditIcon, O as FingerPrintIcon, G as GeneralLayout, q as Dialog, y as CloudIcon, r as AddIcon, s as DialogTrigger, x as CrownIcon, t as DialogContent, v as DialogHeader, w as DialogTitle, Q as useUppy, S as CloudUploadIcon, T as CloudCheckIcon, $ as $5d3850c4d0b4e6c7$export$fba2fb7cd781b7ac } from "./general-layout-jof5o2lh.js";
import { C as Cross2Icon } from "./index-DTpHO9Dm.js";
import { $ as $r, e as ec, t as to, J as Jr } from "./index-CdKFiKW0.js";
import { z } from "./index-D6hcoGBN.js";
import { F as Field, I as Input } from "./forms-CkXMubWQ.js";
import { c as cn } from "./utils-Cugm_gHJ.js";
import { A as Avatar, U as UsageCard } from "./usage-card-BybuNPdo.js";
import { B as Button } from "./button-DkhPxfS-.js";
import { u as useForm, g as getZodConstraint, p as parseWithZod, a as getFormProps } from "./parse-BXCwHSH6.js";
import "./lume-logo-ChvyOqr_.js";
import "./discord-logo-aRR5czcd.js";
import "./index-reyVn01_.js";
import "./sdk-context-umh223ZI.js";
import "./pinning-DQLv895D.js";
import "./index-CnnG_NQj.js";
import "./components-BjLx0zCB.js";
const ManagementCardAvatar = ({ src, button, onClick }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-fit h-fit", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "border-2 border-ring h-28 w-28" }),
    !button ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        onClick,
        variant: "outline",
        className: "absolute bottom-0 right-0 z-50 flex items-center w-10 h-10 p-0 border-white rounded-full justiyf-center hover:bg-secondary-2",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {})
      }
    ) : button
  ] }) });
};
const ManagementCardTitle = ({
  children,
  className
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex items-center gap-x-2 font-semibold", className), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FingerPrintIcon, { className: "text-ring" }),
    children
  ] });
};
const ManagementCardContent = ({
  children,
  className
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("mt-4 mb-8 text-sm text-primary-2", className), children });
};
const ManagementCardFooter = ({
  children,
  className
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className, children });
};
const ManagementCard = ({
  children,
  variant
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      className: cn(
        "rounded-lg p-8 border w-full border-[--variant-color]",
        !variant && "[--variant-color:theme(colors.border)]",
        variant === "accent" && "[--variant-color:theme(colors.primary-1.DEFAULT)]"
      ),
      children
    }
  );
};
const QRImg = "/assets/QR-DC5pRUZJ.png";
function MyAccount() {
  const {
    data: identity
  } = $r();
  const [openModal, setModal] = reactExports.useState({
    changeEmail: false,
    changePassword: false,
    setupTwoFactor: false,
    changeAvatar: false
  });
  const closeModal = () => {
    setModal({
      changeEmail: false,
      changePassword: false,
      setupTwoFactor: false,
      changeAvatar: false
    });
  };
  const isModalOpen = Object.values(openModal).some((isOpen) => isOpen);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(ec, {
    children: /* @__PURE__ */ jsxRuntimeExports.jsxs(GeneralLayout, {
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("h1", {
        className: "text-lg font-bold mb-4",
        children: "My Account"
      }), /* @__PURE__ */ jsxRuntimeExports.jsxs(Dialog, {
        onOpenChange: (open) => {
          if (!open) {
            closeModal();
          }
        },
        open: isModalOpen,
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx(UsageCard, {
          label: "Usage",
          currentUsage: 2,
          monthlyUsage: 10,
          icon: /* @__PURE__ */ jsxRuntimeExports.jsx(CloudIcon, {
            className: "text-ring"
          }),
          button: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
            variant: "accent",
            className: "gap-x-2 h-12",
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Upgrade to Premium"]
          })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
          className: "font-bold my-8",
          children: "Account Management"
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "grid grid-cols-3 gap-x-8",
          children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCard, {
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardAvatar, {
              button: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, {
                asChild: true,
                className: "absolute bottom-0 right-0 z-50",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
                  onClick: () => setModal({
                    ...openModal,
                    changeAvatar: true
                  }),
                  variant: "outline",
                  className: " flex items-center w-10 h-10 p-0 border-white rounded-full justiyf-center hover:bg-secondary-2",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(EditIcon, {})
                })
              })
            })
          }), /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Email Address"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
              className: "text-ring font-semibold",
              children: identity == null ? void 0 : identity.email
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, {
                asChild: true,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                  className: "h-12 gap-x-2",
                  onClick: () => setModal({
                    ...openModal,
                    changeEmail: true
                  }),
                  children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Change Email Address"]
                })
              })
            })]
          }), /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Account Type"
            }), /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCardContent, {
              className: "text-ring font-semibold flex gap-x-2",
              children: ["Lite Premium Account", /* @__PURE__ */ jsxRuntimeExports.jsx(CrownIcon, {})]
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                className: "h-12 gap-x-2",
                children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Upgrade to Premium"]
              })
            })]
          })]
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
          className: "font-bold my-8",
          children: "Security"
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "grid grid-cols-3 gap-x-8",
          children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Password"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(PasswordDots, {
                className: "mt-6"
              })
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, {
                asChild: true,
                children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                  className: "h-12 gap-x-2",
                  onClick: () => setModal({
                    ...openModal,
                    changePassword: true
                  }),
                  children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Change Password"]
                })
              })
            })]
          }), /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Two-Factor Authentication"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
              children: "Improve security by enabling 2FA."
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
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
            })]
          })]
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("h2", {
          className: "font-bold my-8",
          children: "More"
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
          className: "grid grid-cols-3 gap-x-8",
          children: [/* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            variant: "accent",
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Invite a Friend"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
              children: "Get 1 GB per friend invited for free (max 5 GB)."
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                variant: "accent",
                className: "h-12 gap-x-2",
                children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Send Invitation"]
              })
            })]
          }), /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Read our Resources"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
              children: "Navigate helpful articles or get assistance."
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                className: "h-12 gap-x-2",
                children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Open Support Centre"]
              })
            })]
          }), /* @__PURE__ */ jsxRuntimeExports.jsxs(ManagementCard, {
            children: [/* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardTitle, {
              children: "Delete Account"
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardContent, {
              children: "Once initiated, this action cannot be undone."
            }), /* @__PURE__ */ jsxRuntimeExports.jsx(ManagementCardFooter, {
              children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, {
                className: "h-12 gap-x-2",
                variant: "destructive",
                children: [/* @__PURE__ */ jsxRuntimeExports.jsx(AddIcon, {}), "Delete my Account"]
              })
            })]
          })]
        }), /* @__PURE__ */ jsxRuntimeExports.jsxs(DialogContent, {
          children: [openModal.changeAvatar && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangeAvatarForm, {
            close: closeModal
          }), openModal.changeEmail && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangeEmailForm, {
            currentValue: (identity == null ? void 0 : identity.email) || "",
            close: closeModal
          }), openModal.changePassword && /* @__PURE__ */ jsxRuntimeExports.jsx(ChangePasswordForm, {
            close: closeModal
          }), openModal.setupTwoFactor && /* @__PURE__ */ jsxRuntimeExports.jsx(SetupTwoFactorDialog, {
            close: closeModal
          })]
        })]
      })]
    })
  }, "account");
}
const ChangeEmailSchema = z.object({
  email: z.string().email(),
  password: z.string(),
  retypePassword: z.string()
}).superRefine((data, ctx) => {
  if (data.password !== data.retypePassword) {
    return ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["retypePassword"],
      message: "Passwords do not match"
    });
  }
  return true;
});
const ChangeEmailForm = ({
  currentValue,
  close
}) => {
  const {
    data: identity
  } = $r();
  const {
    mutate: updateEmail,
    isSuccess
  } = to();
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(ChangeEmailSchema),
    onValidate({
      formData
    }) {
      return parseWithZod(formData, {
        schema: ChangeEmailSchema
      });
    },
    shouldValidate: "onSubmit",
    onSubmit(e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      console.log(identity);
      updateEmail({
        resource: "account",
        id: "",
        values: {
          email: data.email.toString(),
          password: data.password.toString()
        }
      });
    }
  });
  reactExports.useEffect(() => {
    if (isSuccess) {
      close();
    }
  }, [isSuccess, close]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, {
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, {
        className: "mb-8",
        children: "Change Email"
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "rounded-full px-4 py-2 w-fit text-sm bg-ring font-bold text-secondary-1",
      children: currentValue
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
      ...getFormProps(form),
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
        className: "mt-8",
        inputProps: {
          name: fields.email.name
        },
        labelProps: {
          children: "New Email Address"
        },
        errors: fields.email.errors
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
        inputProps: {
          name: fields.password.name,
          type: "password"
        },
        labelProps: {
          children: "Password"
        },
        errors: fields.password.errors
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
        inputProps: {
          name: fields.retypePassword.name,
          type: "password"
        },
        labelProps: {
          children: "Retype Password"
        },
        errors: fields.retypePassword.errors
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
        className: "w-full h-14",
        children: "Change Email Address"
      })]
    })]
  });
};
const ChangePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  retypePassword: z.string()
}).superRefine((data, ctx) => {
  if (data.newPassword !== data.retypePassword) {
    return ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["retypePassword"],
      message: "Passwords do not match"
    });
  }
  return true;
});
const ChangePasswordForm = ({
  close
}) => {
  const {
    mutate: updatePassword,
    isSuccess
  } = Jr();
  const [form, fields] = useForm({
    id: "login",
    constraint: getZodConstraint(ChangePasswordSchema),
    onValidate({
      formData
    }) {
      return parseWithZod(formData, {
        schema: ChangePasswordSchema
      });
    },
    shouldValidate: "onSubmit",
    onSubmit(e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(e.currentTarget).entries());
      updatePassword({
        currentPassword: data.currentPassword.toString(),
        password: data.newPassword.toString()
      });
    }
  });
  reactExports.useEffect(() => {
    if (isSuccess) {
      close();
    }
  }, [isSuccess, close]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, {
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, {
        className: "mb-8",
        children: "Change Password"
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsxs("form", {
      ...getFormProps(form),
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
        inputProps: {
          name: fields.currentPassword.name,
          type: "password"
        },
        labelProps: {
          children: "Current Password"
        },
        errors: fields.currentPassword.errors
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
        inputProps: {
          name: fields.newPassword.name,
          type: "password"
        },
        labelProps: {
          children: "New Password"
        },
        errors: fields.newPassword.errors
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Field, {
        inputProps: {
          name: fields.retypePassword.name,
          type: "password"
        },
        labelProps: {
          children: "Retype Password"
        },
        errors: fields.retypePassword.errors
      }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
        className: "w-full h-14",
        children: "Change Password"
      })]
    })]
  });
};
const SetupTwoFactorDialog = ({
  close
}) => {
  const [continueModal, setContinue] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, {
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, {
        className: "mb-8",
        children: "Setup Two-Factor"
      })
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
      className: "flex flex-col gap-y-6",
      children: continueModal ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "text-sm text-primary-2",
          children: "Enter the authentication code generated in your two-factor application to confirm your setup."
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Input, {
          fullWidth: true,
          className: "text-center"
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
          className: "w-full h-14",
          children: "Confirm"
        })]
      }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
        children: [/* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "p-6 flex justify-center border bg-secondary-2",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
            src: QRImg,
            alt: "QR",
            className: "h-36 w-36"
          })
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
          className: "font-semibold",
          children: "Don’t have access to scan? Use this code instead."
        }), /* @__PURE__ */ jsxRuntimeExports.jsx("div", {
          className: "p-4 border text-primary-2 text-center font-bold",
          children: "HHH7MFGAMPJ44OM44FGAMPJ44O232"
        }), /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
          className: "w-full h-14",
          onClick: () => setContinue(true),
          children: "Continue"
        })]
      })
    })]
  });
};
const ChangeAvatarForm = ({
  close
}) => {
  var _a;
  const {
    getRootProps,
    getInputProps,
    getFiles,
    upload,
    state,
    removeFile,
    cancelAll
  } = useUppy();
  const isUploading = state === "uploading";
  const isCompleted = state === "completed";
  const hasStarted = state !== "idle" && state !== "initializing";
  const file = (_a = getFiles()) == null ? void 0 : _a[0];
  const imagePreview = reactExports.useMemo(() => {
    if (file) {
      return URL.createObjectURL(file.data);
    }
  }, [file]);
  reactExports.useEffect(() => {
    if (isCompleted) {
      close();
    }
  }, [isCompleted, close]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, {
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, {
      className: "mb-6",
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, {
        children: "Edit Avatar"
      })
    }), !hasStarted && !getFiles().length ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      ...getRootProps(),
      className: "border border-border rounded text-primary-2 bg-primary-dark h-48 flex flex-col items-center justify-center",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx("input", {
        hidden: true,
        "aria-hidden": true,
        name: "uppyFiles[]",
        multiple: true,
        ...getInputProps()
      }, (/* @__PURE__ */ new Date()).toISOString()), /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUploadIcon, {
        className: "w-24 h-24 stroke stroke-primary-dark"
      }), /* @__PURE__ */ jsxRuntimeExports.jsx("p", {
        children: "Drag & Drop Files or Browse"
      })]
    }) : null, !hasStarted && file && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "border border-border rounded p-4 bg-primary-dark relative",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
        className: "absolute top-1/2 right-1/2 rounded-full bg-gray-800/50 hover:bg-primary p-2 text-sm",
        onClick: () => removeFile(file == null ? void 0 : file.id),
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Cross2Icon, {
          className: "size-4"
        })
      }), /* @__PURE__ */ jsxRuntimeExports.jsx("img", {
        className: "w-full h-48 object-contain",
        src: imagePreview,
        alt: "New Avatar Preview"
      })]
    }), hasStarted ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", {
      className: "flex flex-col items-center gap-y-2 w-full text-primary-1",
      children: [/* @__PURE__ */ jsxRuntimeExports.jsx(CloudCheckIcon, {
        className: "w-32 h-32"
      }), isCompleted ? "Upload completed" : "0% completed"]
    }) : null, isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx($5d3850c4d0b4e6c7$export$fba2fb7cd781b7ac, {
      asChild: true,
      onClick: cancelAll,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
        size: "lg",
        className: "mt-6",
        children: "Cancel"
      })
    }) : null, isCompleted ? /* @__PURE__ */ jsxRuntimeExports.jsx($5d3850c4d0b4e6c7$export$fba2fb7cd781b7ac, {
      asChild: true,
      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
        size: "lg",
        className: "mt-6",
        children: "Close"
      })
    }) : null, !hasStarted && !isCompleted && !isUploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Button, {
      size: "lg",
      className: "mt-6",
      onClick: upload,
      children: "Upload"
    }) : null]
  });
};
const PasswordDots = ({
  className
}) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("svg", {
    "aria-hidden": "true",
    width: "219",
    height: "7",
    viewBox: "0 0 219 7",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    children: [/* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "3.7771",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "31.7771",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "45.7771",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "17.7771",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "59.7771",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "73.7771",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "87.7771",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "101.777",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "131.5",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "117.5",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "145.5",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "159.5",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "173.5",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "187.5",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "201.5",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    }), /* @__PURE__ */ jsxRuntimeExports.jsx("circle", {
      cx: "215.5",
      cy: "3.5",
      r: "3.5",
      fill: "currentColor"
    })]
  });
};
export {
  MyAccount as default
};
